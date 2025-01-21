import { Wasi } from "./wasi";

export class WasmLib {
    static stdoutText: string;
    constructor(public wasi : Wasi,
        public wasmInstance: WebAssembly.Instance) {
    }

    static async createInstance(wasmbinary: ArrayBuffer) {
        const wasi = new Wasi({
            "LANG": "en_GB.UTF-8",
            "TERM": "xterm"
        });

        const mod = (await WebAssembly.instantiate(wasmbinary, {
            "wasi_snapshot_preview1": wasi as any
        })).instance;
        wasi.init(mod);

        return new WasmLib(wasi, mod);
    }

    cmd(input: any) {
        this.wasi.writeToStdin(JSON.stringify(input) + "\n");
        let result;
        this.wasi.stdout = (message ) => result = message;
        (this.wasmInstance.exports as any)._start();
        return JSON.parse(result);
    }

}