import {getAllFilesPathsFromBucket, createListFiles} from './s3-bucket';
import {andThen, pipeWith, prop} from 'ramda';
import generator from './generator';
import {createFileInS3} from './upload';
import {bucketName, fileName, s3Endpoint} from './constants';

const proceeedGenerationAndUploadCapnp = pipeWith(andThen)([
	getAllFilesPathsFromBucket(bucketName, s3Endpoint),
	prop('Contents'),
	createListFiles,
	generator(8080, '*'),
	createFileInS3(bucketName, fileName),
]);

const process = proceeedGenerationAndUploadCapnp();

