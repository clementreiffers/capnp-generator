import {
	type CapnpWorkerNearName,
	type CompatibilityDate,
	type Ip,
	type Module,
	type ModuleList,
	type WorkerdModule,
} from './types';
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

const moduleCapnpify = (module: Module): string => `(name = ${module.name}, esModule = embed ${module.esModule})`;

const moduleListCapnpify = (moduleList: ModuleList): string => `modules = [${moduleList.map(moduleCapnpify).join('')}]`;

const workerdCapnpify = (workers: WorkerdModule[]): CapnpWorkerNearName[] => {
	const capnpFormatNearWorkerName: CapnpWorkerNearName[] = [];
	for (const worker of workers) {
		const name = `w${Date.now()}`;
		const capnp = createWorker(name, worker);
		capnpFormatNearWorkerName.push({name, capnp});
	}

	return capnpFormatNearWorkerName;
};

const createService = (workerCapnp: CapnpWorkerNearName): string =>
	`(name="${workerCapnp.name}", worker=.${workerCapnp.name}),`;

const createWorker = (name: string, worker: WorkerdModule): string =>
	`const ${name} :Workerd.Worker = (${moduleListCapnpify(worker.modules)},compatibilityDate = ${worker.compatibilityDate});`;

const servicesCapnpify = (capnpWorkerNearName: CapnpWorkerNearName[]): string =>
	`services = [${capnpWorkerNearName.map(createService).join('')}],`;

const createSocket = (defaultPort: number, defaultIp: Ip) => (workerCapnp: CapnpWorkerNearName) =>
	`(name="http",address="${defaultIp}:${defaultPort++}",http=(),service="${workerCapnp.name}")`;

const socketsCapnpify = (capnpWorkerNearName: CapnpWorkerNearName[], defaultPort: number, defaultIp: Ip): string =>
	`sockets = [${capnpWorkerNearName.map(createSocket(defaultPort, defaultIp)).join('')}]`;

const configCapnpify = (workerCapnpNearNames: CapnpWorkerNearName[], defaultPort: number, defaultIp: Ip) => {
	const services = servicesCapnpify(workerCapnpNearNames);
	const sockets = socketsCapnpify(workerCapnpNearNames, defaultPort, defaultIp);

	return `const config :Workerd.Config = (${services}${sockets})`;
};

const main = (defaultPort: number, defaultIp: Ip, filenames: string[]) => {
	const workers: WorkerdModule[] = [];
	for (const file of filenames) {
		workers.push(workerdModuleFactory('worker', file, '2023-02-28'));
	}

	const workerCapnpNearNames = workerdCapnpify(workers);
	const config = configCapnpify(workerCapnpNearNames, defaultPort, defaultIp);

	console.log(config);
};

main(8080, '*', ['index1.js', 'index2.js', 'index3.js']);
