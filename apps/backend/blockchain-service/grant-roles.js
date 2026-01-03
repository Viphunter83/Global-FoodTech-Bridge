
const { ethers } = require("ethers");

const RPC_URL = "https://rpc-amoy.polygon.technology";
const ADMIN_KEY = "7f270a660aa883584852ab117075c3ef46271c0c6ac4012108740c06497f1f96";
const CONTRACT_ADDRESS = "0x34991cE9703C683e83C639A60632192fCa82728e";

// Roles from smart contract
const LOGISTICS_ROLE = ethers.keccak256(ethers.toUtf8Bytes("LOGISTICS_ROLE"));
const RETAILER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE"));

// New Custodial Addresses
const LOGISTICS_ADDR = "0x1b9ba7069eb01d54fE7E8fC563274f945576B73a";
const RETAILER_ADDR = "0xB69B16B4b22e65BfCe544774DA9947E61506Fea0";

async function main() {
    console.log("Connecting to Amoy...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_KEY, provider);

    const abi = [
        "function grantRole(bytes32 role, address account) public",
        "function hasRole(bytes32 role, address account) public view returns (bool)"
    ];

    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

    console.log(`Granting LOGISTICS_ROLE to ${LOGISTICS_ADDR}...`);
    if (await contract.hasRole(LOGISTICS_ROLE, LOGISTICS_ADDR)) {
        console.log("Already has role.");
    } else {
        const tx1 = await contract.grantRole(LOGISTICS_ROLE, LOGISTICS_ADDR);
        console.log("Tx sent:", tx1.hash);
        await tx1.wait();
        console.log("Granted!");
    }

    console.log(`Granting RETAILER_ROLE to ${RETAILER_ADDR}...`);
    if (await contract.hasRole(RETAILER_ROLE, RETAILER_ADDR)) {
        console.log("Already has role.");
    } else {
        const tx2 = await contract.grantRole(RETAILER_ROLE, RETAILER_ADDR);
        console.log("Tx sent:", tx2.hash);
        await tx2.wait();
        console.log("Granted!");
    }
}

main().catch(console.error);
