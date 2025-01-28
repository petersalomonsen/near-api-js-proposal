export async function fetchAccessKey(
  rpcUrl: string,
  accountId: string,
  publicKey: string,
) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "dontcare",
      method: "query",
      params: {
        request_type: "view_access_key",
        finality: "final",
        account_id: accountId,
        public_key: publicKey,
      },
    }),
  });

  const result = await response.json();
  return result.result;
}
