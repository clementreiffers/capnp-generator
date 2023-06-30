import {getAllFilesPathsFromBucket, createListFiles} from './s3-bucket';
import generator from './generator';
import * as fs from 'fs';
import yargs, {exit} from 'yargs';
import {andThen, prop, pipeWith} from 'ramda';

const writeFile = (path: string) => (content: string): void => {
	fs.writeFile(path, content, err => {
		if (err) {
			console.log('error while trying to write capnp', err);
		} else {
			console.log('capnp writting successful');
		}
	});
};

const generateCapnp = (bucketName: string, s3Endpoint: string, outFile: string): void => {
	pipeWith(andThen)([
		getAllFilesPathsFromBucket(bucketName, s3Endpoint),
		prop('Contents'),
		createListFiles,
		generator(8080, '*'),
		writeFile(outFile),
	// CreateFileInS3(bucketName, fileName),
	])();
};

const isUndefined = (value: any) => typeof value === 'undefined';

const isStringEmpty = (value: string) => value === '';

const isNotCorrectValue = (value: any) => isUndefined(value) || isStringEmpty(value);

const {bucketName, s3Endpoint, outFile} = yargs(process.argv)
	.option({
		bucketName: {type: 'string'},
		s3Endpoint: {type: 'string'},
		outFile: {type: 'string'},
	}).parseSync();

if (isNotCorrectValue(bucketName) || isNotCorrectValue(s3Endpoint) || isNotCorrectValue(outFile)) {
	console.error('missing --bucketName or --s3Endpoint');
	exit(1, new Error('missing --bucketName or --s3Endpoint or --outFile'));
}

generateCapnp(bucketName!, s3Endpoint!, outFile!);

