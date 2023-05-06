using Workerd = import "/workerd/workerd.capnp";


const config :Workerd.Config = (
    services = [(name = "i0", worker = .i0),],
    sockets = [(name = "http",address = "*:8080",http = (),service = "i0")]);


const i0 :Workerd.Worker = (
    modules = [(name = "worker", esModule = embed "index.mjs,index.wasm")],compatibilityDate = "2023-02-28");
