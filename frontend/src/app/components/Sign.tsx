"use client";
import { useTransport } from '../contexts/TransportContext';
import Eth from "@ledgerhq/hw-app-eth";
import { useState } from "react";

const Sign: React.FC = () => {
    const { transport, loading, error, initializeTransport } = useTransport();
    const [signedMessage, setSignedMessage] = useState<string | null>(null);
    const [signingError, setSigningError] = useState<string | null>(null);
    const [processing, setProcessing] = useState<boolean>(false); // New state for processing

    const sign = async () => {
        try {
            if (!transport) {
                setSigningError("Transport not initialized. Please connect your Ledger device.");
                return;
            }

            setProcessing(true); // Set processing state to true when signing starts

            const eth = new Eth(transport);
            const derivationPath = "44'/60'/0'/0/0";
            const message = "Sign in to access content!";
            const messageHex = Buffer.from(message, "utf-8").toString("hex");
            const signature = await eth.signPersonalMessage(derivationPath, messageHex);

            const signedHash = `0x${signature.r}${signature.s}${signature.v.toString(16)}`;
            setSignedMessage(signedHash);
            setSigningError(null);
        } catch (e: any) {
            setSigningError(`Error signing message: ${e.message || e}`);
            setSignedMessage(null);
        } finally {
            setProcessing(false); // Reset processing state after signing is complete
        }
    };

    return (
        <div className="sign-container">
            <h1 className="sign-title">Sign in to Access Token-Gated Content</h1>

            <button
                onClick={sign}
                disabled={loading || processing}
                className={`sign-button ${loading || processing ? 'disabled-button' : ''}`}
            >
                {loading ? "Connecting..." : "Sign Message"}
            </button>

            {processing && (
                <div className="processing-message">
                    <p>Please check your Ledger device and follow the instructions to sign the message. Once signed, you'll be granted access to the content. Thank you for your patience!</p>
                </div>
            )}

            {signedMessage && (
                <div className="signed-message">
                    <h2>Signed Message:</h2>
                    <p>{signedMessage}</p>
                </div>
            )}

            {signingError && (
                <div className="error-message">
                    <p>{signingError}</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default Sign;
