const regexFileAccepted = /\.(js|wasm)$/;
const bucketName = 'stage-cf-worker';
const fileName = 'config.capnp';

const s3Endpoint = 's3.fr-par.scw.cloud';

export {regexFileAccepted, bucketName, fileName, s3Endpoint};
