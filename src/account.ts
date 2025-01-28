import { sign, Signer } from "./signer";
import {
  createTransaction,
  hash,
  serializeTransactionAndSignature,
} from "./transaction";
import bs58 from "bs58";
import "./polyfills";
import { PublicKey } from "./keypair";

export class Account {
  accountId: string;
  actions = [];
  signer: Signer;

  static createAccount(accountId: string) {
    const account = new Account();
    account.accountId = accountId;
    account.actions.push({ createAccount: {} });
    return account;
  }

  fundMyself(amount: BigInt) {
    this.actions.push({ transfer: { deposit: amount } });
    return this;
  }

  publicKey(publicKey: string) {
    this.actions.push({
      addKey: {
        publicKey: PublicKey.fromString(publicKey),
        accessKey: {
          nonce: 0,
          permission: { fullAccess: {} },
        },
      },
    });
    return this;
  }

  withSigner(signer) {
    this.signer = signer;
    return this;
  }

  async send() {
    const transaction = await createTransaction(
      this.signer.accountId,
      this.accountId,
      this.signer.keyPair.getPublicKey().data,
      this.signer.accessKey.nonce + 1,
      bs58.decode(this.signer.accessKey.block_hash),
      this.actions,
    );

    const signature = await sign(
      this.signer.keyPair.getSecretKey(),
      await hash(transaction),
    );
    const serializedAndSignedTx = serializeTransactionAndSignature(
      transaction,
      signature,
    );

    return await fetch(this.signer.nodeUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "dontcare",
        method: "send_tx",
        params: {
          signed_tx_base64: serializedAndSignedTx.toBase64(),
        },
      }),
    }).then((r) => r.json());
  }
}
