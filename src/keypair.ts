import * as bs58 from "bs58";

export class PublicKey {
  constructor(public data: Uint8Array) {}

  toString() {
    return `ed25519:${bs58.default.encode(this.data).toString()}`;
  }
}
export class KeyPair {
  private constructor(public keyPairBytes: Uint8Array) {}

  public static fromSecretKey(secretKey: string): KeyPair {
    const keyData = bs58.default.decode(secretKey.substring("ed25519:".length));

    return new KeyPair(keyData);
  }

  public getPublicKey(): PublicKey {
    return new PublicKey(new Uint8Array(this.keyPairBytes.slice(32)));
  }

  public getSecretKey(): string {
    return `ed25519:${bs58.default.encode(this.getSecretKeyBytes()).toString()}`;
  }

  public getSecretKeyBytes(): Uint8Array {
    return new Uint8Array(this.keyPairBytes);
  }
}
