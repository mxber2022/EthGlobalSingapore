"use client"
import { useTransport } from '../contexts/TransportContext';
import { ethers } from "ethers";
import Eth from "@ledgerhq/hw-app-eth";
import ledgerService from "@ledgerhq/hw-app-eth/lib/services/ledger";

function SendEther() {

    const { transport, loading, error, initializeTransport } = useTransport();

    async function send() {
        if(transport)
            {
            const transaction = {
                to: "0x7199D548f1B30EA083Fe668202fd5E621241CC89",
                chainId: "11155111",
                data: "0x00",
                value: ethers.toBeHex(ethers.parseUnits("0.001", "ether")),
            }
            let  _eth = new Eth(transport);
            const { address } = await _eth.getAddress("44'/60'/0'/0/0", false);
            console.log("address: ", address);
            const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/d9e68a4d18c8455c9596b5d386af2a65");
            let unsignedTx = ethers.Transaction.from(transaction).unsignedSerialized.substring(2);
            const resolution = await ledgerService.resolveTransaction(unsignedTx, {}, {});
        
            //Sign with the Ledger Nano (Sign what you see)
            const signature = await _eth.signTransaction("44'/60'/0'/0/0",unsignedTx, resolution);
        
            //Serialize the same transaction as before, but adding the parsed signature on it
            let signedTx = ethers.Transaction.from({...transaction, 
                signature: {
                r: "0x"+signature.r,
                s: "0x"+signature.s,
                v: parseInt(signature.v),
                },
            }).serialized;
        
            //Sending the transaction to the blockchain
            const hash = (await provider.broadcastTransaction(signedTx)).hash;
            console.log("hash", hash);
        }

    }

    return(
        <>
            <button onClick={send}>Send</button>
        </>
    )
}

export default SendEther;