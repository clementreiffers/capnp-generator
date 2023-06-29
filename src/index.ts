import {getAllFilesPathsFromBucket, createListFiles} from './s3-bucket';
import {andThen, pipeWith, prop} from 'ramda';
import generator from './generator';
// Import {createFileInS3} from './upload';
import {bucketName, fileName, s3Endpoint} from './constants';
import * as fs from 'fs';

const writeFile = (path: string) => (content: string): void => {
	fs.writeFile(path, content, err => {
		if (err) {
			console.log('error while trying to write capnp');
		} else {
			console.log('capnp writting successful');
		}
	});
};

const generateCapnp = (): void => {
	pipeWith(andThen)([
		getAllFilesPathsFromBucket(bucketName, s3Endpoint),
		prop('Contents'),
		createListFiles,
		generator(8080, '*'),
		writeFile('./'),
	// CreateFileInS3(bucketName, fileName),
	])();
};

generateCapnp();

