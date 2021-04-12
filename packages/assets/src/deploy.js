import cliProgress from 'cli-progress';
import program from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import s3 from 's3';

import packageJson from '../package.json';

const progress = new cliProgress.SingleBar(
  { etaBuffer: 1000 },
  cliProgress.Presets.shades_classic
);

program
  .version(packageJson.version)
  .name('deploy')
  .usage('[global options]')
  .option('-d, --debug', 'Show additional debug info')
  .option(
    '-e, --environment <environment>',
    'Environment options (staging/production)'
  )
  .action(async (dir, cmd) => {
    try {
      const debug = program.debug || false;
      const environment = program.environment || 'staging';
      console.log(process.cwd());

      const environmentPath = path.resolve(
        process.cwd(),
        `.env.${environment}`
      );
      if (!fs.existsSync(environmentPath)) {
        throw {
          message:
            'Config file for desired environment does not exist\n' +
            `Please create and configure the \`.env.${environment}\` file.`,
        };
      }

      dotenv.config({
        debug: debug === true ? true : undefined,
        path: environmentPath,
      });

      const {
        MOB_S3_BUCKET,
        MOB_S3_ACCESS_KEY,
        MOB_S3_SECRET_KEY,
        MOB_S3_REGION,
      } = process.env;
      console.log(MOB_S3_BUCKET, MOB_S3_ACCESS_KEY, MOB_S3_SECRET_KEY, MOB_S3_REGION);

      const client = s3.createClient({
        maxAsyncS3: 20, // this is the default
        s3RetryCount: 3, // this is the default
        s3RetryDelay: 1000, // this is the default
        multipartUploadThreshold: 20971520, // this is the default (20 MB)
        multipartUploadSize: 15728640, // this is the default (15 MB)
        s3Options: {
          accessKeyId: MOB_S3_ACCESS_KEY,
          secretAccessKey: MOB_S3_SECRET_KEY,
          region: MOB_S3_REGION ? MOB_S3_REGION : null,
        },
      });

      const params = {
        localDir: path.resolve(process.cwd(), 'public'),
        deleteRemoved: true, // default false, whether to remove s3 objects
        // that have no corresponding local file.

        s3Params: {
          Bucket: MOB_S3_BUCKET,
          Prefix: '',
          // other options supported by putObject, except Body and ContentLength.
          // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
        },
      };

      const uploader = client.uploadDir(params);

      uploader.on('error', function (err) {
        console.log(err);
        throw err;
      });
      uploader.on('progress', function () {
        if (uploader.progressAmount === 0) {
          progress.start(
            uploader.progressTotal || uploader.progressMd5Total,
            0
          );
        }
        progress.update(uploader.progressAmount || uploader.progressMd5Amount);
      });
      uploader.on('end', function () {
        progress.stop();
        console.log('Upload complete!');
        process.exit(0);
      });
    } catch (ex) {
      console.log(ex);
      console.error(
        `\x1b[31m[deploy script] error while running deploy script:`,
        JSON.stringify(ex, Object.getOwnPropertyNames(ex), 2),
        '\x1b[0m'
      );

      // process.exit(1);
    }
  });

program.parse(process.argv);
