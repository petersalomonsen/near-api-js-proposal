export async function readWasmFile(filePath: string): Promise<ArrayBuffer> {
  if (typeof window === "undefined") {
    // Node.js environment
    const fs = await import("fs/promises");
    const path = await import("path");
    const file = await fs.readFile(path.resolve(filePath));
    return new Uint8Array(file).buffer;
  } else {
    // Browser environment
    const response = await fetch(filePath);
    return await response.arrayBuffer();
  }
}
