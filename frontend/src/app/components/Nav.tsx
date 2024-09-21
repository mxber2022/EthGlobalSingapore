"use client";

import { useTransport } from '../contexts/TransportContext';
import Eth from "@ledgerhq/hw-app-eth";
import { useEffect, useState } from 'react';

const Nav = () => {
  const { transport, loading, error, initializeTransport } = useTransport();
  const [isConnected, setIsConnected] = useState(false);
  const [ethAddress, setEthAddress] = useState("");

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
          let _eth = new Eth(transport);
          const { address } = await _eth.getAddress("44'/60'/0'/0/0", false);
          setEthAddress(address); // Store the address
          setIsConnected(true); // Set state to reflect successful connection
        } catch (err) {
          console.error("Error connecting to Ledger:", err);
        }
      }
    };

    handleLedgerConnection();
  }, [transport]); // Run the effect whenever `transport` updates

  const formatAddress = (address: any) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div>
      {loading && <p>Initializing transport...</p>}
      {error && <p>Error: {error}</p>}
      {!isConnected ? (
        <button onClick={connect} disabled={loading}>
          Connect Ledger
        </button>
      ) : (
        <p>Connected to Ledger, Address: {formatAddress(ethAddress)}</p>
      )}
    </div>
  );
};

export default Nav;
