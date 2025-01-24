import "core-js/modules/esnext.uint8-array.to-base64.js";

declare global {
  interface Uint8Array {
    toBase64(options?: {
      alphabet?: "base64" | "base64url";
      omitPadding?: boolean;
    }): string;
  }
}

export {};
