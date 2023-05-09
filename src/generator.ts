import {type Filename, type FilenameList, type Ip, type WorkerType} from './types';
import {writeFile} from 'fs';

const workerGenerator = (file: Filename, nth: number): WorkerType => {
	const workerModuleGenerator = (file: string): string =>
		file.includes('.mjs') || file.includes('.js')
			? `(name = "w", esModule = embed "${file}")`
			: `(name = "w", wasm = embed "${file}")`;

	const manageModules = (file: Filename) => typeof file === 'string'
		? workerModuleGenerator(file)
		: file.map(workerModuleGenerator).join(',');

	const name = `w${nth}`;

	const capnp
        = `const w${name} :Workerd.Worker = (modules = [${manageModules(file)}],compatibilityDate = "2023-02-28");`;

	return {
		name, capnp,
	};
};

const createService = (worker: WorkerType): string =>
	`(name = "${worker.name}", worker = .${worker.name}),`;

const servicesCapnpify = (workerList: WorkerType[]): string =>
	`services = [${workerList.map(createService).join('')}],`;

const createSocket = (defaultPort: number, defaultIp: Ip) => (worker: WorkerType) =>
	`(name = "http",address = "${defaultIp}:${defaultPort++}",http = (),service = "${worker.name}")`;

const socketsCapnpify = (workerList: WorkerType[], defaultPort: number, defaultIp: Ip): string =>
	`sockets = [${workerList.map(createSocket(defaultPort, defaultIp)).join(',')}]`;

const configGenerator = (workerList: WorkerType[], defaultPort: number, defaultIp: Ip) =>
	`const config :Workerd.Config = (${servicesCapnpify(workerList)}${socketsCapnpify(workerList, defaultPort, defaultIp)});`;

const generator = (defaultPort: number, defaultIp: Ip, filenames: FilenameList): string => {
	// Generation of all workers first
	const workers = filenames.map(workerGenerator);
	const config = configGenerator(workers, defaultPort, defaultIp);
	return `using Workerd = import "/workerd/workerd.capnp"; ${config} ${workers.map(w => w.capnp).join('')}`;
};

export default generator;
