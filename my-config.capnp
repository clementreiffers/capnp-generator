using Workerd = import "/workerd/workerd.capnp";
const config :Workerd.Config = (services = [(name = "i0", worker = .i0),(name = "i1", worker = .i1),],
sockets = [(name = "http",address = "*:8080",http = (),service = "i0"),(name = "http",address = "*:8081",http = (),service = "i1")]); const i0 :Workerd.Worker = (modules = [(name = "worker", esModule = embed "index.mjs)"],compatibilityDate = "2023-02-28");const i1 :Workerd.Worker = (modules = [(name = "worker", wasm = embed "index.wasm")],compatibilityDate = "2023-02-28");
