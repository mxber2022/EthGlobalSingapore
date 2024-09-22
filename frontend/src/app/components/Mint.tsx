"use client";
import { useTransport } from '../contexts/TransportContext';
import { useState } from 'react';
import { ethers } from "ethers";
import Eth from "@ledgerhq/hw-app-eth";
import ledgerService from "@ledgerhq/hw-app-eth/lib/services/ledger";

function Mint() {
    const { transport, loading, error, initializeTransport } = useTransport();
    const [status, setStatus] = useState<string | null>(null); // State to track minting status
    const [transactionHash, setTransactionHash] = useState<string | null>(null); // State to track transaction hash

    async function mint() {
        if (transport) {
            try {
                setStatus("Minting in progress..."); // Update status

                const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/2SHg9nYGwUEpcXJuBTdkDcT2tYV");
                const contractAddress = "0x32e8ecB86D397162FDbE2c42446EB872d71007a6"; // Replace with your contract address
                const abi = [
                    "function safeMint(address to, string memory uri) public"
                ];

                const contract = new ethers.Contract(contractAddress, abi, provider);
                const gasPrice = ethers.parseUnits("50", "gwei");

                let _eth = new Eth(transport);
                const { address } = await _eth.getAddress("44'/60'/0'/0/0", false);
                console.log("Minting NFT to address: ", address);

                const tokenURI = "https://your-nft-metadata-url"; // Replace with actual metadata URI
                const transaction = {
                    to: contractAddress,
                    chainId: 11155111,
                    data: contract.interface.encodeFunctionData("safeMint", [address, tokenURI]),
                    gasPrice: gasPrice,
                    gasLimit: ethers.toBeHex(1000000),
                    nonce: await provider.getTransactionCount(address, "latest")
                };

                let unsignedTx = ethers.Transaction.from(transaction).unsignedSerialized.substring(2);
                const resolution = await ledgerService.resolveTransaction(unsignedTx, {}, {});

                // Sign with the Ledger Nano (Sign what you see)
                const signature = await _eth.signTransaction("44'/60'/0'/0/0", unsignedTx, resolution);

                // Serialize the same transaction, adding the parsed signature
                let signedTx = ethers.Transaction.from({
                    ...transaction,
                    signature: {
                        r: "0x" + signature.r,
                        s: "0x" + signature.s,
                        v: parseInt(signature.v),
                    },
                }).serialized;

                // Sending the transaction to the blockchain
                const hash = (await provider.broadcastTransaction(signedTx)).hash;
                setTransactionHash(hash); // Update state with the transaction hash
                setStatus("Minting successful!"); // Update status to success
                console.log("Transaction hash: ", hash);

            } catch (error) {
                setStatus(`Minting failed: ${error}`); // Update status in case of error
                console.error("Error during minting:", error);
            }
        } else {
            setStatus("Ledger device not connected. Please initialize transport.");
        }
    }

    return (
        <div className="mint-container">
            <button
                onClick={mint}
                disabled={loading || status === "Minting in progress..."}
                className={`mint-button ${loading || status === "Minting in progress..." ? "disabled-button" : ""}`}
            >
                Mint NFT
            </button>

            {/* Display the minting status */}
            {status && (
                <div className="status-message">
                    <p>{status}</p>
                </div>
            )}

            {/* Display the transaction hash after successful minting */}
            {transactionHash && (
                <div className="transaction-hash">
                    <p>Transaction Hash: <a href={`https://sepolia.etherscan.io/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">{transactionHash}</a></p>
                </div>
            )}
        </div>
    );
}

export default Mint;
