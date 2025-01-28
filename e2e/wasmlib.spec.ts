import { expect, test } from "@playwright/test";
import { WasmLib } from "../src/wasmlib/wasmlib";
import { readFile } from "fs/promises";
test("test signing a message with the wasmlib", async () => {
  const wasmbinary = new Uint8Array(
    await readFile("wasmlib/target/wasm32-wasip1/release/wasmlib.wasm"),
  ).buffer;
  const wasmlib = await WasmLib.createInstance(wasmbinary);
  const result = wasmlib.cmd({
    secret_key:
      "ed25519:4ruqLgJ9ckYMNL5o3Hm57SgHX1p3pmN1Dssv29QPfRv2qquU3R7tMQqSmR538uz7466EpepuNNVcMkjmRtoH86SE",
    data: [1, 2, 3, 4, 5],
  });
  expect(result).toEqual({
    signature:
      "ed25519:29smSzrbMQeMJYWuq5nRanHYKUxJ3g6jBW4j8iJzio2GNefxHq8UMpgLk2mpNoijPdeHyrmj1FMt5AGetYamUpRc",
  });
});
