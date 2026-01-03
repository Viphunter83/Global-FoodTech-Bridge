
const { ethers } = require("ethers");

const RPC_URL = "https://rpc-amoy.polygon.technology";
const ADMIN_KEY = "11d9aa36e00148c062a2511f63071bfb50f57d5df9c5abf64fdb67a9c1779e89"; // The funded wallet

const LOGISTICS_ADDR = "0x1b9ba7069eb01d54fE7E8fC563274f945576B73a";
const RETAILER_ADDR = "0xB69B16B4b22e65BfCe544774DA9947E61506Fea0";

const AMOUNT = ethers.parseEther("0.1");

async function main() {
    console.log("Connecting to Amoy...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_KEY, provider);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Admin Balance: ${ethers.formatEther(balance)} MATIC`);

    if (balance < (AMOUNT * 2n)) {
        console.error("Insufficient admin balance to fund custodians.");
        process.exit(1);
    }

    console.log(`Sending 0.1 MATIC to Logistics (${LOGISTICS_ADDR})...`);
    const tx1 = await wallet.sendTransaction({
        to: LOGISTICS_ADDR,
        value: AMOUNT
    });
    console.log("Tx Sent:", tx1.hash);
    await tx1.wait();
    console.log("Funded Logistics!");

    console.log(`Sending 0.1 MATIC to Retailer (${RETAILER_ADDR})...`);
    const tx2 = await wallet.sendTransaction({
        to: RETAILER_ADDR,
        value: AMOUNT
    });
    console.log("Tx Sent:", tx2.hash);
    await tx2.wait();
    console.log("Funded Retailer!");
}

main().catch(console.error);
