'use client';

import {
  useAccounts,
  useChain,
  useConnectUI,
  useDisconnect,
  useFuel,
  useIsConnected,
  useWallet,
} from '@fuels/react';
import { Address, bn, ScriptTransactionRequest } from 'fuels';
import { useState } from 'react';

export default function Page() {
  const { connect, error, isError, isConnecting } = useConnectUI();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { accounts } = useAccounts();

  const { wallet } = useWallet();
  const { fuel } = useFuel()
  const {chain} = useChain()

  const [transferError, setTransferError] = useState(null);

  const simpleTransfer = async () => {

    try {

      const accounts = await fuel.accounts();
      const account = accounts[0];
      const NativeAssetId = '0xf8f8b6283d7fa5b672b530cbb84fcccb4ff8dc40f8176ef4544ddb1f1952ad07'
      const transactionRequest = new ScriptTransactionRequest({
        gasLimit: 50_000,
        // gasPrice: 1,
      });

      const toAddress = Address.fromString(account);
      const amount = bn.parseUnits("0.0000001");
      transactionRequest.addCoinOutput(toAddress, amount, NativeAssetId);

      const wallet = await fuel.getWallet(account);
      const resources = await wallet.getResourcesToSpend([[amount, NativeAssetId]]);

      transactionRequest.addResources(resources);
      const response = await wallet.sendTransaction(transactionRequest);

      // wait for transaction to be completed
      await response.wait();
    }
    catch (e) {
      setTransferError((e as any)?.message);
    }

  }


  return (
    <div>
      <button
        type="button"
        onClick={() => {
          console.log('connect');
          connect();
        }}
      >
        {isConnecting ? 'Connecting' : 'Connect'}
      </button>
      {isConnected && (
        <button type="button" onClick={() => disconnect()}>
          Disconnect
        </button>
      )}

      {isError && <p className="Error">{error?.message}</p>}

      {wallet && <div>Wallet: {wallet.address.toString()}</div>}

      {isConnected && (
        <div>
          <h3>Connected accounts</h3>
          {accounts?.map((account) => (
            <div key={account}>
              <b>Account:</b> {account}
            </div>
          ))}
        </div>
      )}

      {isConnected && chain && <div><b>Chain:</b> {chain.name}</div>}

      {isConnected && (
        <button type="button" onClick={() => simpleTransfer()}>
          Transfer
        </button>
      )}

      {transferError && <p className="Error">{transferError}</p>}

    </div>
  );
}
