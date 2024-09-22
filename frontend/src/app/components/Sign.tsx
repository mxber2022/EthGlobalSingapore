"use client";
import { useTransport } from '../contexts/TransportContext';
import Eth from "@ledgerhq/hw-app-eth";
import { useState } from "react";
import { ethers } from "ethers";
import Mint from './Mint';

const Sign: React.FC = () => {
    const { transport, loading, error, initializeTransport } = useTransport();
    const [signedMessage, setSignedMessage] = useState<string | null>(null);
    const [signingError, setSigningError] = useState<string | null>(null);
    const [accessGranted, setAccessGranted] = useState<boolean | null>(null); // Access starts as null (no result yet)
    const [processing, setProcessing] = useState<boolean>(false);
    const [telegramAccess, setTelegramAccess] = useState<boolean | null>(null);

    const SBT_CONTRACT_ADDRESS = "0x32e8ecB86D397162FDbE2c42446EB872d71007a6"; // Replace with actual SBT contract address
    const TELEGRAM_BOT_TOKEN = "";
    const TELEGRAM_CHAT_ID = "your-telegram-chat-id"; // Your Telegram group chat ID

    // Function to check if the user holds a Soulbound Token (SBT)
    const checkSBT = async (address: string) => {
        try {
            const SBT_ABI = [
                "function balanceOf(address owner) view returns (uint256)"
            ];
            const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/2SHg9nYGwUEpcXJuBTdkDcT2tYV");
            const contract = new ethers.Contract(SBT_CONTRACT_ADDRESS, SBT_ABI, provider);
            const balance = await contract.balanceOf(address); // Check SBT balance of the user
            //return balance > 0;
            return false
        } catch (error) {
            console.error("Error checking SBT:", error);
            return false;
        }
    };

    // Grant access to the Telegram group using Telegram's API
    const grantTelegramAccess = async (userId: string) => {
       // try {
        //     const response = await fetch(
        //         `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/inviteLink`,
        //         {
        //             method: "POST",
        //             body: JSON.stringify({
        //                 chat_id: TELEGRAM_CHAT_ID,
        //                 user_id: userId,
        //             }),
        //             headers: {
        //                 "Content-Type": "application/json",
        //             },
        //         }
        //     );
        //     const data = await response.json();
        //     if (data.ok) {
        //         setTelegramAccess(true);
        //     } else {
        //         setTelegramAccess(false);
        //         console.error("Failed to grant Telegram access:", data);
        //     }
        // } catch (error) {
        //     setTelegramAccess(false);
        //     console.error("Error granting Telegram access:", error);
        // }
        //setTelegramAccess(true);
        setTelegramAccess(false);
    };

    const signAndCheckAccess = async () => {
        try {
            setProcessing(true);
            setAccessGranted(null); // Reset accessGranted state before checking
            setSigningError(null); // Reset any previous errors

            if (!transport) {
                setSigningError("Transport not initialized. Please connect your Ledger device.");
                return;
            }

            const eth = new Eth(transport);
            const derivationPath = "44'/60'/0'/0/0";
            const message = "Access Token-Gated Community!";
            const messageHex = Buffer.from(message, "utf-8").toString("hex");
            const signature = await eth.signPersonalMessage(derivationPath, messageHex);
            const signedHash = `0x${signature.r}${signature.s}${signature.v.toString(16)}`;
            setSignedMessage(signedHash);

            const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/2SHg9nYGwUEpcXJuBTdkDcT2tYV");
            //const signer = provider.getSigner();
            const { address } = await eth.getAddress("44'/60'/0'/0/0", false); // Get user's Ethereum address

            // Check if user holds Soulbound Token (SBT)
            const hasSBT = await checkSBT(address);
            if (hasSBT) {
                setAccessGranted(true);
                // Grant Telegram access
                await grantTelegramAccess(address); // Assuming you map ETH address to a Telegram user ID
            } else {
                setAccessGranted(false);
                setSigningError("You do not hold a Soulbound Token. Please mint one to gain access.");
            }
        } catch (e: any) {
            setSigningError(`Error during the process: ${e.message || e}`);
            setSignedMessage(null);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="sign-container">
            <h1 className="sign-title">Sign in to Access Token-Gated Community</h1>

            <button
                onClick={signAndCheckAccess}
                disabled={loading || processing}
                className={`sign-button ${loading || processing ? 'disabled-button' : ''}`}
            >
                {loading ? "Connecting..." : "Sign Transaction"}
            </button>

            {processing && (
                <div className="processing-message">
                    <p>Please check your Ledger device and sign the transaction to proceed.</p>
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

            {accessGranted && telegramAccess === true && (
                <div className="success-message">
                    <p>Access granted! You can now join the Telegram token-gated group (t.me/myteam) </p>
                </div>
            )}

{accessGranted === false && (
    <>
        <div className="error-message">
            <p>You do not hold the required SBT. Please mint an NFT to gain access.</p>
        </div>
        <div className="mint-section">
            <Mint />
        </div>
    </>
)}
        </div>
    );
};

export default Sign;
