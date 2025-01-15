import { Worker } from 'near-workspaces';

export class Tokens {
    accountId: string;
    constructor(accountId) {
        this.accountId = accountId;
    }

    static account(accountId) {
        return new Tokens(accountId);
    }

    async nearBalance() {
        const balance = 0;
        return balance;
    }
}