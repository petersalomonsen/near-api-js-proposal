import { serialize, Schema, deserialize } from 'borsh';

abstract class Action  {
    constructor() {}
}

export class CreateAccount extends Action {}

export class Transfer extends Action {
    deposit: BigInt;

    constructor({ deposit }: { deposit: BigInt }) {
        super()
        this.deposit = deposit;
    }
}

class PublicKey {
    constructor(public keyType: number, public data: Uint8Array) {}
}

export class Transaction {
    constructor(
        public signerId: string,
        public publicKey: PublicKey,
        public nonce: number,
        public receiverId: string,
        public blockHash: Uint8Array,
        public actions: Action[]
    ) {}
}

export class SignedTransaction {
    constructor(
        public transaction: Transaction,
        public signature: Uint8Array
    ) {}
}

export const SCHEMA = new class BorshSchema {
    Ed25519Signature: Schema = {
        struct: {
            data: { array: { type: 'u8', len: 64 } },
        }
    };
    Secp256k1Signature: Schema = {
        struct: {
            data: { array: { type: 'u8', len: 65 } },
        }
    };
    Signature: Schema = {
        enum: [
            { struct: { ed25519Signature: this.Ed25519Signature } },
            { struct: { secp256k1Signature: this.Secp256k1Signature } },
        ]
    };
    PublicKey: Schema = {
        struct: {
            keyType: 'u8',
            data: { array: { type: 'u8', len: 32 } },
        }
    };
    CreateAccount: Schema = {
        struct: {}
    };
    Transfer: Schema = {
        struct: {
            amount: 'u128',
        }
    };
    Action: Schema = {
        enum: [
            { struct: { createAccount: this.CreateAccount } },
            { struct: { transfer: this.Transfer } }
        ]
    };
    Transaction: Schema = {
        struct: {
            signerId: 'string',
            publicKey: this.PublicKey,
            nonce: 'u64',
            receiverId: 'string',
            blockHash: { array: { type: 'u8', len: 32 } },
            actions: { array: { type: this.Action } },
        }
    };
    SignedTransaction: Schema = {
        struct: {
            transaction: this.Transaction,
            signature: this.Signature,
        }
    };
};

export async function createTransaction(
    senderId: string,
    publicKey: Uint8Array,
    nonce: number,
    blockHash: Uint8Array,
    newAccountId: string,
    initialBalance: string
) {
    const actions = [
       /* {createAccount: {}},
        {transfer: {amount: BigInt(initialBalance)}}*/
    ];

    const transaction = new Transaction(
        senderId,
        new PublicKey(0, publicKey),
        nonce,
        newAccountId,
        blockHash,
        actions
    );

    console.log(transaction);
    const serializedTransaction = serialize(SCHEMA.Transaction, transaction);    
    return serializedTransaction;
}

export function serializeTransactionAndSignature(serializedTransaction: Uint8Array, signature: Uint8Array): Uint8Array {
    const transaction = deserialize(SCHEMA.Transaction, serializedTransaction);
    
    const serializedAndSignedTx = serialize(SCHEMA.SignedTransaction, { transaction, signature: {
        ed25519Signature: { 
            data: signature 
        }
    } });
    return serializedAndSignedTx;
}

export async function hash(data: Uint8Array): Promise<Uint8Array> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
}