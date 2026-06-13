import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from '@aws-sdk/client-cloudfront';
import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import cliProgress from 'cli-progress';
import program from 'commander';
import { createHash } from 'crypto';
import dotenv from 'dotenv';
import fs, { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { envString, loadRootEnv } from '@bao/env';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PACKAGE_ROOT, 'public');

const packageJson = JSON.parse(
  fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf8')
);

const progress = new cliProgress.SingleBar(
  { etaBuffer: 1000 },
  cliProgress.Presets.shades_classic
);

const CLOUDFRONT_MAX_PATHS = 3000;

const resolveS3Env = (name) =>
  envString(`BAO_S3_${name}`) ?? envString(`AWS_S3_${name}`);

const s3KeyToInvalidationPath = (key) => `/${key}`;

const buildInvalidationPaths = (keys) => {
  const unique = [...new Set(keys.map(s3KeyToInvalidationPath))];

  if (unique.length === 0) {
    return [];
  }

  if (unique.length > CLOUDFRONT_MAX_PATHS) {
    return ['/*'];
  }

  return unique;
};

const invalidateCloudFront = async ({
  client,
  distributionId,
  paths,
  debug = false,
}) => {
  if (paths.length === 0) {
    return null;
  }

  const callerReference = `bao-deploy-${Date.now()}-${createHash('md5')
    .update(paths.join('\0'))
    .digest('hex')
    .slice(0, 12)}`;

  const response = await client.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: callerReference,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    })
  );

  const invalidationId = response.Invalidation?.Id ?? null;

  if (debug) {
    console.log(
      `[deploy] cloudfront invalidation ${invalidationId}: ${paths.length} path(s)`
    );
    if (paths.length <= 20) {
      paths.forEach((item) => console.log(`[deploy]   ${item}`));
    }
  }

  return invalidationId;
};

const loadDeployEnv = (environment) => {
  const repoRoot = loadRootEnv(PACKAGE_ROOT);

  const overlayPaths = [
    path.join(PACKAGE_ROOT, `.env.${environment}`),
    path.join(repoRoot, `.env.${environment}`),
  ];

  for (const overlayPath of overlayPaths) {
    if (fs.existsSync(overlayPath)) {
      dotenv.config({ path: overlayPath, override: true });
      return overlayPath;
    }
  }

  return path.join(repoRoot, '.env');
};

const walkFiles = (rootDir) => {
  const files = [];

  const visit = (currentDir) => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  };

  visit(rootDir);
  return files;
};

const toPosixKey = (filePath, rootDir) =>
  path.relative(rootDir, filePath).split(path.sep).join('/');

const listRemoteObjects = async (client, bucket) => {
  const objects = new Map();
  let continuationToken;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      })
    );

    for (const object of response.Contents ?? []) {
      if (object.Key) {
        objects.set(object.Key, object.ETag ?? null);
      }
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return objects;
};

const fileMd5 = (filePath) =>
  new Promise((resolve, reject) => {
    const hash = createHash('md5');
    const stream = createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });

const contentTypeForKey = (key) => {
  if (key.endsWith('.json')) {
    return 'application/json';
  }
  if (key.endsWith('.png')) {
    return 'image/png';
  }
  if (key.endsWith('.mp3')) {
    return 'audio/mpeg';
  }
  if (key.endsWith('.wav')) {
    return 'audio/wav';
  }
  return undefined;
};

const cacheControlForKey = (key) => {
  if (key.endsWith('.json')) {
    return 'public, max-age=300, must-revalidate';
  }
  if (key.endsWith('.png') || key.endsWith('.mp3') || key.endsWith('.wav')) {
    return 'public, max-age=31536000, immutable';
  }
  return 'public, max-age=3600';
};

const etagMatchesMd5 = (remoteEtag, localMd5) => {
  if (!remoteEtag) {
    return false;
  }

  const normalized = remoteEtag.replace(/^"|"$/g, '');

  // Multipart uploads use a compound ETag (e.g. "abc123-5") — re-upload.
  if (normalized.includes('-')) {
    return false;
  }

  return normalized === localMd5;
};

const deleteRemoteKeys = async (client, bucket, keys) => {
  const batchSize = 1000;

  for (let index = 0; index < keys.length; index += batchSize) {
    const batch = keys.slice(index, index + batchSize);
    if (batch.length === 0) {
      continue;
    }

    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
        },
      })
    );
  }
};

program
  .version(packageJson.version)
  .name('deploy')
  .usage('[options]')
  .option('-d, --debug', 'Show additional debug info')
  .option(
    '-e, --environment <environment>',
    'Optional overlay: .env.staging or .env.production (default: staging)',
    'staging'
  )
  .action(async () => {
    try {
      const debug = program.debug || false;
      const environment = program.environment || 'staging';
      const envPath = loadDeployEnv(environment);

      if (debug) {
        console.log(`[deploy] env: ${envPath}`);
        console.log(`[deploy] public: ${PUBLIC_DIR}`);
      }

      const bucket = resolveS3Env('BUCKET');
      const accessKey = resolveS3Env('ACCESS_KEY');
      const secretKey = resolveS3Env('SECRET_KEY');
      const region = resolveS3Env('REGION');

      if (!bucket || !accessKey || !secretKey) {
        throw new Error(
          'Missing S3 credentials. Set AWS_S3_BUCKET, AWS_S3_ACCESS_KEY, and ' +
            'AWS_S3_SECRET_KEY in the repo root .env (or BAO_S3_* equivalents). ' +
            `Optional overlay: .env.${environment}`
        );
      }

      if (!fs.existsSync(PUBLIC_DIR)) {
        throw new Error(`Public assets directory not found: ${PUBLIC_DIR}`);
      }

      const client = new S3Client({
        region: region ?? 'us-east-1',
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
      });

      const localFiles = walkFiles(PUBLIC_DIR);
      const localKeys = new Set(
        localFiles.map((filePath) => toPosixKey(filePath, PUBLIC_DIR))
      );

      console.log(`[deploy] syncing ${localFiles.length} file(s) to s3://${bucket}/`);

      const remoteObjects = await listRemoteObjects(client, bucket);
      const keysToDelete = [...remoteObjects.keys()].filter(
        (key) => !localKeys.has(key)
      );

      if (keysToDelete.length > 0) {
        console.log(`[deploy] removing ${keysToDelete.length} remote file(s)`);
        await deleteRemoteKeys(client, bucket, keysToDelete);
      }

      let uploaded = 0;
      let skipped = 0;
      const changedKeys = [...keysToDelete];

      progress.start(localFiles.length, 0);

      for (const filePath of localFiles) {
        const key = toPosixKey(filePath, PUBLIC_DIR);
        const localMd5 = await fileMd5(filePath);
        const remoteEtag = remoteObjects.get(key);

        if (etagMatchesMd5(remoteEtag, localMd5)) {
          skipped += 1;
          if (debug) {
            console.log(`[deploy] skip ${key}`);
          }
        } else {
          await client.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: createReadStream(filePath),
              CacheControl: cacheControlForKey(key),
              ContentType: contentTypeForKey(key),
            })
          );
          uploaded += 1;
          changedKeys.push(key);
          if (debug) {
            console.log(`[deploy] upload ${key}`);
          }
        }

        progress.increment();
      }

      progress.stop();
      console.log(
        `[deploy] complete: ${uploaded} uploaded, ${skipped} unchanged` +
          (keysToDelete.length > 0 ? `, ${keysToDelete.length} removed` : '')
      );

      const distributionId = envString('AWS_CLOUDFRONT_DISTRIBUTION_ID');

      if (!distributionId) {
        if (changedKeys.length > 0) {
          console.log(
            '[deploy] skipping CloudFront invalidation (AWS_CLOUDFRONT_DISTRIBUTION_ID not set)'
          );
        }
      } else if (changedKeys.length === 0) {
        console.log('[deploy] skipping CloudFront invalidation (no changed objects)');
      } else {
        const cloudFrontClient = new CloudFrontClient({
          region: region ?? 'us-east-1',
          credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
          },
        });

        const invalidationPaths = buildInvalidationPaths(changedKeys);
        const invalidationId = await invalidateCloudFront({
          client: cloudFrontClient,
          distributionId,
          paths: invalidationPaths,
          debug,
        });

        const pathLabel =
          invalidationPaths.length === 1 && invalidationPaths[0] === '/*'
            ? '/*'
            : `${invalidationPaths.length} path(s)`;

        console.log(
          `[deploy] cloudfront invalidation ${invalidationId ?? 'started'} (${pathLabel})`
        );
      }
      process.exit(0);
    } catch (error) {
      progress.stop();
      console.error(
        '\x1b[31m[deploy] failed:\x1b[0m',
        error?.message ?? error
      );
      process.exit(1);
    }
  });

program.parse(process.argv);
