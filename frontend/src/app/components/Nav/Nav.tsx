"use client";
import { useTransport } from '../../contexts/TransportContext';
import Eth from "@ledgerhq/hw-app-eth";
import { useEffect, useState } from 'react';
//import "./Nav.css"; // Importing the regular CSS file

const Nav = () => {
  const { transport, loading, error, initializeTransport } = useTransport();
  const [isConnected, setIsConnected] = useState(false);
  const [ethAddress, setEthAddress] = useState("");

  async function connect() {
    if (!transport) {
      await initializeTransport();
    }
  }

  useEffect(() => {
    const handleLedgerConnection = async () => {
      if (transport) {
        try {
          let _eth = new Eth(transport);
          const { address } = await _eth.getAddress("44'/60'/0'/0/0", false);
          setEthAddress(address);
          setIsConnected(true);
        } catch (err) {
          console.error("Error connecting to Ledger:", err);
        }
      }
    };

    handleLedgerConnection();
  }, [transport]);

  const formatAddress = (address: any) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="navbar">
      <div className="logo">
        <h1 className="title">SoulPass</h1>
      </div>
      <div className="actions">
        {loading && <p className="loading">Initializing transport...</p>}
        {error && <p className="error">Error: {error}</p>}
        {!isConnected ? (
          <button onClick={connect} disabled={loading} className="button">
            Connect Ledger
          </button>
        ) : (
          <p className="connected">Connected: {formatAddress(ethAddress)}</p>
        )}
      </div>
    </div>
  );
};

export default Nav;
