"use client"
import { useTransport } from '../contexts/TransportContext';
import { ethers } from "ethers";
import Eth from "@ledgerhq/hw-app-eth";
import ledgerService from "@ledgerhq/hw-app-eth/lib/services/ledger";
import { useState } from "react";

const Sign: React.FC = () => {
    const { transport, loading, error, initializeTransport } = useTransport();
    const [signedMessage, setSignedMessage] = useState<string | null>(null);
    const [signingError, setSigningError] = useState<string | null>(null);

    const sign = async () => {
        try {
            if (!transport) {
                setSigningError("Transport not initialized. Please connect your Ledger device.");
                return;
            }

            const eth = new Eth(transport);

            // Replace this with the actual derivation path if needed
            const derivationPath = "44'/60'/0'/0/0";

            // Message to be signed
            const message = "Hello Ledger!";
            const messageHex = Buffer.from(message, "utf-8").toString("hex");

            // Sign personal message using the Ledger device
            const signature = await eth.signPersonalMessage(derivationPath, messageHex);

            // Build the signed message hash
            const signedHash = `0x${signature.r}${signature.s}${signature.v.toString(16)}`;

            // Update state with the signed message
            setSignedMessage(signedHash);
            setSigningError(null);
        } catch (e: any) {
            setSigningError(`Error signing message: ${e.message || e}`);
            setSignedMessage(null);
        }
    };

    return (
        <>
            <button onClick={sign} disabled={loading}>
                {loading ? "Connecting..." : "Sign Message"}
            </button>

            {signedMessage && (
                <div>
                    <h2>Signed Message:</h2>
                    <p>{signedMessage}</p>
                </div>
            )}

            {signingError && (
                <div style={{ color: "red" }}>
                    <p>{signingError}</p>
                </div>
            )}

            {error && (
                <div style={{ color: "red" }}>
                    <p>{error}</p>
                </div>
            )}
        </>
    );
};

export default Sign;
