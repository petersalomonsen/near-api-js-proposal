import { Worker } from 'near-workspaces';

export class Tokens {
    private query: any;
    accountId: string;
    constructor(accountId) {
        this.accountId = accountId;
    }

    static account(accountId) {
        return new Tokens(accountId);
    }

    async nearBalance() {
        this.query = {
            jsonrpc: '2.0',
            id: 'dontcare',
            method: 'query',
            params: {
                request_type: 'view_account',
                finality: 'final',
                account_id: this.accountId
            }
        };
        return this;
    }

    async fetchFrom(rpcUrl: string) {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.query)
        });

        const data = await response.json();
        return data.result.amount;
    }
}