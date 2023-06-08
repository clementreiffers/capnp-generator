import {S3} from 'aws-sdk';
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
	reject,
	splitAt,
	test,
	values,
	zip,
} from 'ramda';
import {regexFileAccepted} from './constants';

const s3: S3 = new S3({
	endpoint: 's3.fr-par.scw.cloud',
});

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

const getAllFilesPathsFromBucket = (bucketName: string) => async () =>
	s3.listObjectsV2({
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Bucket: bucketName,
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Prefix: '',
	}).promise();

export default getAllFilesPathsFromBucket;
export {createListFiles};
