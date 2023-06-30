import {getAllFilesPathsFromBucket, createListFiles} from './s3-bucket';
import generator from './generator';
import * as fs from 'fs';
import yargs, {exit} from 'yargs';
import {andThen, prop, pipeWith} from 'ramda';

const writeFile = (path: string) => (content: string): void => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	fs.writeFile(path, content, err => {
		if (err) {
			console.log('error while trying to write capnp', err);
		} else {
			console.log('capnp writting successful');
		}
	});
};

const generateCapnp = (bucketName: string, s3Endpoint: string): void => {
	pipeWith(andThen)([
		getAllFilesPathsFromBucket(bucketName, s3Endpoint),
		prop('Contents'),
		createListFiles,
		generator(8080, '*'),
		writeFile('./config.capnp'),
	// CreateFileInS3(bucketName, fileName),
	])();
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const {bucketName, s3Endpoint} = yargs(process.argv)
	.option({bucketName: {type: 'string'}, s3Endpoint: {type: 'string'}})
	.parseSync();

if (typeof bucketName === 'undefined' || typeof s3Endpoint === 'undefined') {
	console.error('missing --bucketName or --s3Endpoint');
	exit(1, new Error('missing --bucketName or --s3Endpoint'));
}

generateCapnp(bucketName!, s3Endpoint!);

