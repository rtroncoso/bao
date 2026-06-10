import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import cliProgress from 'cli-progress';
import program from 'commander';
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

const resolveS3Env = (name) =>
  envString(`BAO_S3_${name}`) ?? envString(`AWS_S3_${name}`);

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

const listRemoteKeys = async (client, bucket) => {
  const keys = new Set();
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
        keys.add(object.Key);
      }
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return keys;
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

      const remoteKeys = await listRemoteKeys(client, bucket);
      const keysToDelete = [...remoteKeys].filter((key) => !localKeys.has(key));

      if (keysToDelete.length > 0) {
        console.log(`[deploy] removing ${keysToDelete.length} remote file(s)`);
        await deleteRemoteKeys(client, bucket, keysToDelete);
      }

      progress.start(localFiles.length, 0);

      for (const filePath of localFiles) {
        const key = toPosixKey(filePath, PUBLIC_DIR);
        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: createReadStream(filePath),
          })
        );
        progress.increment();
      }

      progress.stop();
      console.log('Upload complete!');
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
