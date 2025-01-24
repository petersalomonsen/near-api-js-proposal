import { WasmLib } from "./wasmlib/wasmlib";
import { readWasmFile } from "./utils";
import bs58 from "bs58";
import { KeyPair } from "./keypair";
import { fetchAccessKey } from "./accesskeys";

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

export class Signer {
  constructor(
    public accountId: string,
    public keyPair: KeyPair,
    public accessKey: any,
    public nodeUrl: string,
  ) {}

  static async from(accountId: string, secretKey: string, nodeUrl: string) {
    const keyPair = KeyPair.fromSecretKey(secretKey);
    const accessKey = await fetchAccessKey(
      nodeUrl,
      accountId,
      (await keyPair.getPublicKey()).toString(),
    );

    return new Signer(accountId, keyPair, accessKey, nodeUrl);
  }
}
