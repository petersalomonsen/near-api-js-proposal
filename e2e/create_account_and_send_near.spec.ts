import { expect, test } from '@playwright/test';
import { Provider, Worker} from 'near-workspaces';
import { Tokens } from '../src/near-api';
import { createTransaction, serializeTransactionAndSignature, hash } from '../src/transaction';
import * as nearApi from 'near-api-js';

let worker: Worker;

test.afterEach(async () => {
    if (worker) {
        await worker.tearDown();
    }
});

test("create account and send NEAR", async () => {
    worker = await Worker.init();
    const account = await worker.rootAccount.devCreateAccount();
    await new Promise(resolve => setTimeout(() => resolve(null), 1500));

    const expectedBalance = (await account.balance()).total;
    const balance = await (await Tokens.account(account.accountId).nearBalance())
            .fetchFrom(worker.provider.connection.url);

    expect(balance).toBe(expectedBalance.toString())

    const devKeyPair = await account.getKey();
    const accessKey = await account.viewAccessKey(account.accountId, devKeyPair.getPublicKey().toString());
    const nonce = ++accessKey.nonce;
    const recentBlockHash = nearApi.utils.serialize.base_decode(
        accessKey.block_hash
    );

    const newAccountId = `bob.${account.accountId}`;
    const tx = await createTransaction(
        account.accountId,
        devKeyPair.getPublicKey().data,
        nonce,
        recentBlockHash, newAccountId, "100");
    
    const nearapijstx = nearApi.transactions.createTransaction(account.accountId, nearApi.utils.PublicKey.from(devKeyPair.getPublicKey().toString()),newAccountId,nonce,
            [nearApi.transactions.createAccount(),
                nearApi.transactions.transfer(BigInt("100"))
            ],
        recentBlockHash);

    const signature = devKeyPair.sign(await hash(tx));
    const serializedAndSignedTx = serializeTransactionAndSignature(tx, signature.signature);

    const keyStore = new nearApi.keyStores.InMemoryKeyStore();

    keyStore.setKey("sandbox", account.accountId, nearApi.utils.KeyPair.fromString(devKeyPair.toString() as nearApi.utils.KeyPairString));
    const near = await nearApi.connect({
        networkId: "sandbox",
        nodeUrl: worker.provider.connection.url,
        keyStore
    });

    const nearApiJSAccount = await near.account(account.accountId);
    const [txHash, signedTx] = await nearApi.transactions.signTransaction(nearapijstx,nearApiJSAccount.connection.signer, account.accountId,"sandbox");

    const transactionResult = await fetch(worker.provider.connection.url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(
            {
                "jsonrpc": "2.0",
                "id": "dontcare",
                "method": "send_tx",
                "params": {
                  "signed_tx_base64": Buffer.from(serializedAndSignedTx).toString('base64'),
                  "wait_until": "INCLUDED_FINAL"
                }
            }
        )
    }).then(r => r.json());

    await expect(transactionResult.result.status.SuccessValue).toBe("");

    const newAccountView = await worker.provider.viewAccount(newAccountId);
    expect(newAccountView.amount).toBe("100");

/*    let network = near_workspaces::sandbox().await.unwrap();
    let account = network.dev_create_account().await.unwrap();
    let network = NetworkConfig::from(network);

    let balance = Tokens::account(account.id().clone())
        .near_balance()
        .fetch_from(&network)
        .await
        .unwrap();

    println!("Balance: {}", balance.liquid);

    let new_account: AccountId = format!("{}.{}", "bob", account.id()).parse().unwrap();
    let signer = Signer::new(Signer::from_workspace(&account)).unwrap();

    Account::create_account(new_account.clone())
        .fund_myself(account.id().clone(), NearToken::from_near(1))
        .public_key(generate_secret_key().unwrap().public_key())
        .unwrap()
        .with_signer(signer.clone())
        .send_to(&network)
        .await
        .unwrap();

    Tokens::account(account.id().clone())
        .send_to(new_account.clone())
        .near(NearToken::from_near(1))
        .with_signer(signer)
        .send_to(&network)
        .await
        .unwrap();

    let new_acccount_balance = Tokens::account(account.id().clone())
        .near_balance()
        .fetch_from(&network)
        .await
        .unwrap();
    let bob_balance = Tokens::account(new_account)
        .near_balance()
        .fetch_from(&network)
        .await
        .unwrap();

    println!("Balance: {}", new_acccount_balance.liquid);
    // Expect to see 2 NEAR in Bob's account. 1 NEAR from create_account and 1 NEAR from send_near
    println!("Bob balance: {}", bob_balance.liquid);*/
});