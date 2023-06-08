import getAllFilesPathsFromBucket, {createListFiles} from './getAllFilesPathsFromBucket';
import {andThen, pipeWith, prop} from 'ramda';
import generator from './generator';
import {createFileInS3} from './upload';
import {bucketName, fileName} from './constants';

const proceeedGenerationAndUploadCapnp = pipeWith(andThen)([
	getAllFilesPathsFromBucket(bucketName),
	prop('Contents'),
	createListFiles,
	generator(8080, '*'),
	createFileInS3(bucketName, fileName),
]);

const process = proceeedGenerationAndUploadCapnp();

