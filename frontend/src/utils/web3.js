// Utility functions for web3 interactions (Phantom, etc.)

export const connectPhantomWallet = async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect({ onlyIfTrusted: false });
      return resp.publicKey.toString();
    } catch (err) {
      throw err;
    }
  } else {
    throw new Error("Phantom Wallet not found");
  }
};

export const disconnectPhantomWallet = async () => {
  if (window.solana) {
    await window.solana.disconnect();
  }
};