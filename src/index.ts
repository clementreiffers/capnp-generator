import {type CompatibilityDate, type Ip, type Module, type ModuleList, type WorkerdModule} from './types';
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

const main = (defaultPort: number, defaultIpAddress: Ip, filenames: string[]) => {
	const workers: WorkerdModule[] = [];
	for (const file of filenames) {
		workers.push(workerdModuleFactory(`${file}${defaultPort++}`, file, '2023-02-28'));
	}

	console.log(JSON.stringify(workers));
};

main(8080, '*', ['index1.js', 'index2.js', 'index3.js']);
