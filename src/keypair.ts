import bs58 from "bs58";

export class PublicKey {
  constructor(
    public keyType: number,
    public data: Uint8Array,
  ) {}

  static fromString(publicKey: string): PublicKey {
    if (publicKey.startsWith("ed25519:")) {
      return new PublicKey(
        0,
        new Uint8Array(bs58.decode(publicKey.substring("ed25519:".length))),
      );
    } else {
      throw new Error("Not supported key type");
    }
  }

  toString() {
    return `ed25519:${bs58.encode(this.data).toString()}`;
  }
}
export class KeyPair {
  private constructor(public keyPairBytes: Uint8Array) {}

  public static fromSecretKey(secretKey: string): KeyPair {
    const keyData = bs58.decode(secretKey.substring("ed25519:".length));

    return new KeyPair(keyData);
  }

  public getPublicKey(): PublicKey {
    return new PublicKey(0, new Uint8Array(this.keyPairBytes.slice(32)));
  }

  public getSecretKey(): string {
    return `ed25519:${bs58.encode(this.getSecretKeyBytes()).toString()}`;
  }

  public getSecretKeyBytes(): Uint8Array {
    return new Uint8Array(this.keyPairBytes);
  }
}
