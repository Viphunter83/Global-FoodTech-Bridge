const { ethers } = require('ethers');

const RPC_URL = 'https://lb.drpc.live/polygon-amoy/AlVK5_YuREjmtO6UkBFatFYqocHRRYgR8Z3JtiKh6MJI';
const CONTRACT_ADDRESS = '0xE326362613F44383504b1bFA5Dd92C0Fc7D38471';

const REGISTRY_ABI = [
    "function getBatchData(string memory batchUUID) public view returns (address currentOwner, string memory uri, string memory violation, bool isViolated, uint256 timestamp, address pendingOwner)"
];

async function main() {
    console.log("Connecting to RPC:", RPC_URL);
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    try {
        const block = await provider.getBlockNumber();
        console.log("Block number:", block);
        
        const code = await provider.getCode(CONTRACT_ADDRESS);
        console.log("Contract code length:", code.length);
        if (code === '0x') {
            console.log("❌ CONTRACT NOT DEPLOYED AT THIS ADDRESS ON AMOY!");
        } else {
            console.log("✅ Contract deployed successfully.");
        }
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, REGISTRY_ABI, provider);
        console.log("Calling getBatchData...");
        const data = await contract.getBatchData("dummy-id");
        console.log("Result:", data);
        
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
}

main();
