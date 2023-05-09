import {type FilenameList, type Ip} from './types';
import generator from './generator';
import {writeFile} from 'fs';

const defaultPort = 8080;
const defaultIp: Ip = '*';

// Const filenames: FilenameList = Array.from({length: 800}, () => ['./build/worker/shim.mjs', './build/worker/index.wasm']);
const filenames: FilenameList = Array.from({length: 2}, () => './build/index.js');
const capnp: string = generator(defaultPort, defaultIp, filenames);

writeFile('my-config.capnp',
	capnp,
	err => {
		console.log(err);
	},
);
