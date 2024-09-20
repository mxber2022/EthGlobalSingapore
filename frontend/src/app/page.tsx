
"use client"
import 'core-js/actual';
import { listen } from "@ledgerhq/logs";
import AppBtc from "@ledgerhq/hw-app-btc";
// Keep this import if you want to use a Ledger Nano S/X/S Plus with the USB protocol and delete the @ledgerhq/hw-transport-webhid import
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
// Keep this import if you want to use a Ledger Nano S/X/S Plus with the HID protocol and delete the @ledgerhq/hw-transport-webusb import
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
 
export default function Home() {

  async function connectLedger() {
    try {
 
      // Keep if you chose the USB protocol
      const transport = await TransportWebUSB.create();
   
      // Keep if you chose the HID protocol
      //const transport = await TransportWebHID.create();
   
      //listen to the events which are sent by the Ledger packages in order to debug the app
      listen(log => console.log(log))
   
      //When the Ledger device connected it is trying to display the bitcoin address
      const appBtc = new AppBtc({ transport, currency: "bitcoin" });
      const { bitcoinAddress } = await appBtc.getWalletPublicKey(
        "44'/0'/0'/0/0",
        { verify: false, format: "legacy"}
      );
   
      console.log("bitcoinAddress: ", bitcoinAddress);
      //Display the address on the Ledger device and ask to verify the address
      await appBtc.getWalletPublicKey("44'/0'/0'/0/0", {format:"legacy", verify: true});
    } catch (e) {
      
      console.log("Error connecting ledger: ", e);
    }
  }

  return (
    <>
      <button onClick={connectLedger}>Connect Ledger</button>
    </>
  );
}
