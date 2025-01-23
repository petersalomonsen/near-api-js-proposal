import { WasmLib } from "./wasmlib/wasmlib";
import { readWasmFile } from "./utils";
import bs58 from "bs58";
export async function sign(
  secret_key: string,
  data: Uint8Array,
): Promise<Uint8Array> {
  const wasmbinary = await readWasmFile(
    "wasmlib/target/wasm32-wasip1/release/wasmlib.wasm",
  );
  const wasmlib = await WasmLib.createInstance(wasmbinary);
  const result = wasmlib.cmd({
    secret_key: secret_key,
    data: Array.from(data),
  });
  return bs58.decode(result.signature.substring("ed25519:".length));
}
