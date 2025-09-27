import React from "react";

const WalletConnect = ({ wallet, connectWallet, disconnectWallet }) => (
  <div className="mb-4 flex items-center space-x-4">
    {!wallet ? (
      <button
        onClick={connectWallet}
        className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
      >
        Connect Phantom
      </button>
    ) : (
      <div className="flex items-center space-x-2">
        <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
          {wallet.slice(0, 4)}...{wallet.slice(-4)}
        </span>
        <button
          onClick={disconnectWallet}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    )}
  </div>
);

export default WalletConnect;