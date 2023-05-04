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

 */
const moduleListFactory = (name: string, esModule: string): ModuleList => [{name, esModule}];

const workerdModuleFactory = (name: string, file: string, compatibilityDate: CompatibilityDate): WorkerdModule => ({
	modules: moduleListFactory(name, file),
	compatibilityDate,
});

const moduleCapnpify = (module: Module): string => `(name = "${module.name}", esModule = embed "${module.esModule}")`;

const moduleListCapnpify = (moduleList: ModuleList): string => `modules = [${moduleList.map(moduleCapnpify).join('')}]`;

const workerdCapnpify = (workers: WorkerdModule[]): CapnpWorkerNearName[] =>
	workers.map((worker: WorkerdModule) => {
		const name = `w${Date.now()}`;
		const capnp = createWorker(name, worker);
		return {name, capnp};
	}) satisfies CapnpWorkerNearName[];

const createService = (workerCapnp: CapnpWorkerNearName): string =>
	`(name = "${workerCapnp.name}", worker = .${workerCapnp.name}),`;

const createWorker = (name: string, worker: WorkerdModule): string =>
	`const ${name} :Workerd.Worker = (${moduleListCapnpify(worker.modules)},compatibilityDate = "${worker.compatibilityDate}");`;

const servicesCapnpify = (capnpWorkerNearName: CapnpWorkerNearName[]): string =>
	`services = [${capnpWorkerNearName.map(createService).join('')}],`;

const createSocket = (defaultPort: number, defaultIp: Ip) => (workerCapnp: CapnpWorkerNearName) =>
	`(name = "http",address = "${defaultIp}:${defaultPort++}",http = (),service = "${workerCapnp.name}")`;

const socketsCapnpify = (capnpWorkerNearName: CapnpWorkerNearName[], defaultPort: number, defaultIp: Ip): string =>
	`sockets = [${capnpWorkerNearName.map(createSocket(defaultPort, defaultIp)).join('')}]`;

const configCapnpify = (workerCapnpNearNames: CapnpWorkerNearName[], defaultPort: number, defaultIp: Ip) =>
	`const config :Workerd.Config = (${servicesCapnpify(workerCapnpNearNames)}${socketsCapnpify(workerCapnpNearNames, defaultPort, defaultIp)});`;

const capnpGenerator = (defaultPort: number, defaultIp: Ip, filenames: string[]) => {
	const workers = filenames.map((file: string) => workerdModuleFactory('worker', file, '2023-02-28'));

	const workerCapnpNearNames = workerdCapnpify(workers);
	const config = configCapnpify(workerCapnpNearNames, defaultPort, defaultIp);

	const finalCapnp
		= `using Workerd = import "/workerd/workerd.capnp"; ${config} ${workerCapnpNearNames.map(w => w.capnp).join('')}`;

	return finalCapnp;
};

const filenames = Array.from({length: 1000}, () => 'build/index.js');

writeFile(
	'my-config.capnp',
	capnpGenerator(8080, '*', filenames),
	err => {
		console.log(err);
	});

