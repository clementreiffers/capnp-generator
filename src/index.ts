import {type FilenameList, type Ip} from './types';
import generator from './generator';
import {writeFile} from 'fs';

const defaultPort = 8080;
const defaultIp: Ip = '*';
const filenames: FilenameList = [['index.mjs', 'index.wasm'], 'truc.js'];

const capnp: string = generator(defaultPort, defaultIp, filenames);

writeFile('my-config.capnp',
	capnp,
	err => {
		console.log(err);
	},
);
