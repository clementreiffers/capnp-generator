import {type AWSError, S3} from 'aws-sdk';
import {
	append,
	assoc,
	defaultTo,
	filter,
	isNil,
	juxt,
	keys,
	map,
	pipe,
	pluck,
	prop,
	reduce,
	reject, unnest,
	splitAt,
	test,
	values,
	zip, concat, tap,
} from 'ramda';
import {regexFileAccepted} from './constants';
import {type PromiseResult} from 'aws-sdk/lib/request';
import {type ListObjectsV2Output} from 'aws-sdk/clients/s3';

const convertToStringList = (data: any) => data as string[];

const splitPathFile = (data: string) => splitAt(data.lastIndexOf('/'), data);

const conserveOnlyJsOrWasmFiles = filter(test(regexFileAccepted));

const assocIfSamePaths = (acc: Record<string, string[]>, [key, value]: string[]) =>
	assoc(key, append(value, defaultTo([], prop(key, acc))), acc);

const concatPaths = (data: [string[], string[][]]) => {
	const paths = [];
	for (const [key, value] of zip(data[0], data[1])) {
		paths.push(value.map(v => key + v));
	}

	return paths;
};

const createListFiles = (contentData: Array<Record<string, any>>): string[][] =>
	pipe(
		pluck('Key'),
		reject(isNil),
		conserveOnlyJsOrWasmFiles,
		convertToStringList,
		map(splitPathFile),
		reduce(assocIfSamePaths, {}),
		juxt([keys, values]),
		concatPaths,
	)(contentData);

const initS3Client = (endpoint?: string): S3 => endpoint === undefined ? new S3() : new S3({endpoint});

const getAllFilesPathsFromBucket = (bucketName: string, endpoint?: string) =>
	async (): Promise<PromiseResult<ListObjectsV2Output, AWSError>> =>
		initS3Client(endpoint).listObjectsV2({
		// eslint-disable-next-line @typescript-eslint/naming-convention
			Bucket: bucketName,
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Prefix: '',
		}).promise();

export {createListFiles, getAllFilesPathsFromBucket};
