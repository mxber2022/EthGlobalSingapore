"use client"

import { createContext, useContext, useState, ReactNode } from 'react';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';

interface TransportContextProps {
  transport: TransportWebUSB | null;
  loading: boolean;
  error: string | null;
  initializeTransport: () => Promise<void>;
}

const TransportContext = createContext<TransportContextProps | undefined>(undefined);

export const TransportProvider = ({ children }: { children: ReactNode }) => {
  const [transport, setTransport] = useState<TransportWebUSB | null>(null); // Ensure correct type
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const initializeTransport = async () => {
    setLoading(true);
    setError(null); 
    try {
      const transportInstance = await TransportWebUSB.create() as TransportWebUSB; // Explicitly cast the type
      setTransport(transportInstance);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransportContext.Provider value={{ transport, loading, error, initializeTransport }}>
      {children}
    </TransportContext.Provider>
  );
};

export const useTransport = () => {
  const context = useContext(TransportContext);
  if (!context) {
    throw new Error('useTransport must be used within a TransportProvider');
  }
  return context;
};
