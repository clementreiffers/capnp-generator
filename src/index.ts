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

const moduleListCapnpify = (moduleList: ModuleList): string => 'modules = [' + moduleList.map(moduleCapnpify).join('') + ']';

const workerdCapnpify = (workers: WorkerdModule[]): CapnpWorkerNearName[] => {
	const capnpFormatNearWorkerName: CapnpWorkerNearName[] = [];
	for (const worker of workers) {
		const name = `w${Date.now()}`;
		const capnp = `const ${name} :Workerd.Worker = (${moduleListCapnpify(worker.modules)},compatibilityDate = ${worker.compatibilityDate});`;
		capnpFormatNearWorkerName.push({name, capnp});
	}

	return capnpFormatNearWorkerName;
};

const main = (defaultPort: number, defaultIpAddress: Ip, filenames: string[]) => {
	const workers: WorkerdModule[] = [];
	for (const file of filenames) {
		workers.push(workerdModuleFactory('worker', file, '2023-02-28'));
	}

	console.log(workerdCapnpify(workers));
};

main(8080, '*', ['index1.js', 'index2.js', 'index3.js']);
