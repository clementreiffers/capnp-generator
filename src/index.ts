import {
	type CapnpWorkerNearName,
	type CompatibilityDate,
	type Ip,
	type Module,
	type ModuleList,
	type WorkerdModule,
} from './types';
import {writeFile} from 'fs';
/*

What do we need ?

- the default port or a range of Port
- the default IP address
- filenames of all Workers used

- if wasm instead of js : array instead of string

 */
const defaultPort = 8080;
const defaultIp: Ip = '*';
const filenameCapnpGenerated = 'my-config.capnp';
const numberOfWorkersToCreate = 3;
const workerFilename = 'worker2/index.js';

const moduleListFactory = (name: string, esModule: string): ModuleList => [{name, esModule}];

const workerdModuleFactory = (name: string, file: string, compatibilityDate: CompatibilityDate): WorkerdModule => ({
	modules: moduleListFactory(name, file),
	compatibilityDate,
});

const manageModuleType = (module: Module): string =>
	module.esModule.includes('mjs') || module.esModule.includes('wasm')
		? moduleWasmCapnpify(module)
		: moduleCapnpify(module);

const moduleCapnpify = (module: Module): string => `(name = "${module.name}", esModule = embed "${module.esModule}")`;

const moduleListCapnpify = (moduleList: ModuleList): string => `modules = [${moduleList.map(manageModuleType).join('')}]`;

/*
  Modules = [
    ( name = "entrypoint", esModule = embed "./build/worker/shim.mjs" ),
    ( name = "./index.wasm", wasm = embed "./build/worker/index.wasm" )
  ],
 */

const moduleWasmCapnpify = (module: Module): string =>
	module.esModule.includes('mjs')
		? `(name = "${module.name}", esModule = embed "${module.esModule})"`
		: `(name = "${module.name}", wasm = embed "${module.esModule}")`;

const workerdCapnpify = (workers: WorkerdModule[]): CapnpWorkerNearName[] => {
	let indice = 0;
	return workers.map((worker: WorkerdModule) => {
		const name = `i${indice++}`;
		const capnp = createWorker(name, worker);
		return {name, capnp};
	}) satisfies CapnpWorkerNearName[];
};

const createService = (workerCapnp: CapnpWorkerNearName): string =>
	`(name = "${workerCapnp.name}", worker = .${workerCapnp.name}),`;

const createWorker = (name: string, worker: WorkerdModule): string =>
	`const ${name} :Workerd.Worker = (${moduleListCapnpify(worker.modules)},compatibilityDate = "${worker.compatibilityDate}");`;

const servicesCapnpify = (capnpWorkerNearName: CapnpWorkerNearName[]): string =>
	`services = [${capnpWorkerNearName.map(createService).join('')}],`;

const createSocket = (defaultPort: number, defaultIp: Ip) => (workerCapnp: CapnpWorkerNearName) =>
	`(name = "http",address = "${defaultIp}:${defaultPort++}",http = (),service = "${workerCapnp.name}")`;

const socketsCapnpify = (capnpWorkerNearName: CapnpWorkerNearName[], defaultPort: number, defaultIp: Ip): string =>
	`sockets = [${capnpWorkerNearName.map(createSocket(defaultPort, defaultIp)).join(',')}]`;

const configCapnpify = (workerCapnpNearNames: CapnpWorkerNearName[], defaultPort: number, defaultIp: Ip) =>
	`const config :Workerd.Config = (${servicesCapnpify(workerCapnpNearNames)}${socketsCapnpify(workerCapnpNearNames, defaultPort, defaultIp)});`;

const capnpGenerator = (defaultPort: number, defaultIp: Ip, filenames: any) => {
	const workers = filenames.map((file: string) => workerdModuleFactory('worker', file, '2023-02-28'));

	const workerCapnpNearNames = workerdCapnpify(workers);
	const config = configCapnpify(workerCapnpNearNames, defaultPort, defaultIp);

	const finalCapnp
		= `using Workerd = import "/workerd/workerd.capnp"; ${config} ${workerCapnpNearNames.map(w => w.capnp).join('')}`;

	return finalCapnp;
};

// Const filenames = Array.from({length: numberOfWorkersToCreate}, () => workerFilename);

const filenames = [['index.mjs', 'index.wasm']];

writeFile(filenameCapnpGenerated,
	capnpGenerator(defaultPort, defaultIp, filenames),
	err => {
		console.log(err);
	});

