type Service = {name: string; worker: string};
type ServiceList = Service[];

type Ip = `${number}.${number}.${number}.${number}` | 'localhost' | '*';
type Address = `${Ip}:${number}`;

type Socket = {
	name: string;
	address: Address;
};
type SocketList = Socket[];

type Module = {name: string; esModule: string};
type ModuleList = Module[];

type OneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type ZeroToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Year = `19${ZeroToNine}${ZeroToNine}` | `20${ZeroToNine}${ZeroToNine}`;
type Month = `0${OneToNine}` | `1${0 | 1 | 2}`;
type Day = `${0}${OneToNine}` | `${1 | 2}${ZeroToNine}` | `3${0 | 1}`;
type CompatibilityDate = `${Year}-${Month}-${Day}`;

type WorkerdModule = {
	modules: ModuleList;
	compatibilityDate: CompatibilityDate;
};

type Config = {
	services: ServiceList;
	sockets: SocketList;
};

type WorkerType = {name: string; capnp: string};

type Filename = string[];

type FilenameList = Filename[];

export type {ModuleList, WorkerdModule, CompatibilityDate, Ip, Module, WorkerType, Filename, FilenameList};
