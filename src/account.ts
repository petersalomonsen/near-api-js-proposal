import { createTransaction } from "./transaction";

export class Account {
  accountId: string;
  amount: BigInt;

  static createAccount(accountId: string) {
    const account = new Account();
    account.accountId = accountId;
    return account;
  }

  fundMyself(amount: BigInt) {
    this.amount = amount;
    return this;
  }

  asTransaction(
    senderId: string,
    publicKey: Uint8Array,
    nonce: number,
    blockHash: Uint8Array,
  ) {
    return createTransaction(
      senderId,
      this.accountId,
      publicKey,
      nonce,
      blockHash,
      [{ createAccount: {} }, { transfer: { deposit: this.amount } }],
    );
  }
}
