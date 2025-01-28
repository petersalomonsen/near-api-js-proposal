# NEAR JS client library proposal

This is a proposas for creating an intuitive, simple, but yet flexible client library for NEAR protocol. It is meant for use by humans, but maybe even more important that it can be used by AI agents to generate client code. It's design and terminology must then be in a way that is easy for a language model to understand.

# Working with base types such as Account, Network, Signer, Transaction etc.

Standalone functions are intuitive, but may reduce flexibility. They either require the full context (network, signer etc) to be passed for every call, or the context must be stored in a global scope.

The object oriented approach allows working with multiple contexts simultaneously. Having the base structure object oriented, still allows introducing stateless standalone functions using the objects under the hood.

# Creating an account object for various usages

Let's see how we could create an account object.

Creating an account object from static functions, and not the constructor, allows several ways, depending on the usage.

To be clear to the consumer the functions for creating the object are named from the usage purpose.

```typescript
import { Account, Network, Signer } from 'near';

const account = Account.fromAccountId('psalomo.near');
const account = Account.forView('psalomo.near', 'mainnet');
const account = Account.forView('psalomo.near', Network.custom({ name: 'sandbox', url: 'http://localhost:3030' }));
const account = Account.forSigning({
    accountId: 'psalomo.near',
    signer: Signer.fromKeyPairString(ed25519`...),
    network: Network.fromName('testnet')
});
```

# View operations on the account object

Given we have used the `forView` function to get an account object we can get a summary like this:

```typescript
const accountSummary = await account.summary();

// And then we can access various properties of the summary
console.log(accountSummary.nativeAccountBalance);
console.log(accountSummary.validatorStake);
console.log(accountSummary.storageUsage);
console.log(accountSummary.contract);
console.log(accountSummary.accessKeys);
```

# Function calls and transactions

We can either use the `Account.forSigning` function, or add a signer to an account object that was created using `forView`.

```typescript
account.setSigner(signer);
```

Now we can do a function call:

```typescript
await account.call({contractId: 'guestbook.near', methodName: 'submit', attachedDeposit: NEAR`0.2`});
```

or transfer tokens

```typescript
await account.transfer({recipientId: 'peter.near', amount: NEAR`100`});
```

or create a new account

```typescript
await createAccount({accountId: 'newbie.near',
    initialBalance: NEAR`20`,
    fullAccessKeys: [ed25519`...`]
});
```

# Standalone functions for quick access

Importing a standalone function from a submodule could be quick and intuitive. The approach above requires instantiating objects, but one-liners might be more efficient for an AI agent generating code to be executed on the fly.

For example we would like to be able to import just the function for the operation we would like to perform:

```typescript
import { createNamedAccount } from 'near/account';

await createNamedAccount({
    newAccountId: "frol.near",
    initialBalance: NEAR`10`,
    fullAccessKeys: ["ed25519:..."]],
    fundingAccount: {
        accountId: "psalomo.near",
        signingKey: "ed25519:..."
    },
    network: "mainnet"
})
```

Under the hood, this would create the objects like we did above.

Let's look at how to do a transfer with this approach:

```typescript
import { transfer } from 'near/tokens';

await transfer({
    sender: "psalomo.near",
    recipientId: "frol.near",
    amount: NEAR`10`,
    signingKey: "ed25519:...",
    network: "mainnet",
    nodeUrl: "https://rpc.fastnear.com"
})
```

Or a simple view operation

```typescript
import { accountSummary } from 'near/account';

const accountSummary = accountSummary({accountId: "psalomo.near", network: "mainnet"});

// And then we can access various properties of the summary
console.log(accountSummary.nativeAccountBalance);
console.log(accountSummary.validatorStake);
console.log(accountSummary.storageUsage);
console.log(accountSummary.contract);
console.log(accountSummary.accessKeys);
```

# WebAssembly library

As a client library for a blockchain, there will be dependencies on crypto functions, and other functionality that already have robust implementations in Rust. Rather than reimplementing these in JavaScript, the proposal here is to compile these functions to WebAssembly.

In the [wasmlib](./wasmlib/) folder there is a Rust project for a WebAssembly library that provides functionality from NEAR Rust libraries. The library compiles to `wasm32-wasip1` and takes a JSON string as input via `stdin` and prints the output to `stdout`. The provided JSON contains the command and parameters to execute in the WebAssembly library.
