"use client";

import { useTransport } from '../contexts/TransportContext';
import AppBtc from "@ledgerhq/hw-app-btc";
import { useEffect, useState } from 'react';

const Nav = () => {
  const { transport, loading, error, initializeTransport } = useTransport();
  const [isConnected, setIsConnected] = useState(false);

  async function connect() {
    if (!transport) {
      await initializeTransport(); // Initialize transport if it's not initialized yet
    }
  }

  useEffect(() => {
    // This effect runs when the transport is updated (after initializeTransport)
    const handleLedgerConnection = async () => {
      if (transport) {
        try {
          const appBtc = new AppBtc({ transport }); // Pass transport as an object
          const { bitcoinAddress } = await appBtc.getWalletPublicKey(
            "44'/0'/0'/0/0",
            { verify: false, format: "legacy" }
          );

          console.log("bitcoinAddress: ", bitcoinAddress);
          // Display the address on the Ledger device and ask to verify the address
          await appBtc.getWalletPublicKey("44'/0'/0'/0/0", { format: "legacy", verify: true });

          setIsConnected(true); // Set state to reflect successful connection
        } catch (err) {
          console.error("Error connecting to Ledger:", err);
        }
      }
    };

   // handleLedgerConnection();
  }, [transport]); // Run the effect whenever `transport` updates

  return (
    <div>
      {loading && <p>Initializing transport...</p>}
      {error && <p>Error: {error}</p>}
      {!isConnected ? (
        <button onClick={connect} disabled={loading}>
          Initialize Transport
        </button>
      ) : (
        <p>Transport initialized and connected successfully!</p>
      )}
    </div>
  );
};

export default Nav;
