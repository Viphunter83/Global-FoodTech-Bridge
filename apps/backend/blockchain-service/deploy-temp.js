
const { ethers } = require("ethers");

const RPC_URL = "https://rpc-amoy.polygon.technology";
const ADMIN_KEY = "7f270a660aa883584852ab117075c3ef46271c0c6ac4012108740c06497f1f96";

// New Custodial Addresses
const LOGISTICS_ADDR = "0x1b9ba7069eb01d54fE7E8fC563274f945576B73a";
const RETAILER_ADDR = "0xB69B16B4b22e65BfCe544774DA9947E61506Fea0";

const REGISTRY_ABI = [
    "constructor()",
    "function grantRole(bytes32 role, address account) public",
    "function hasRole(bytes32 role, address account) public view returns (bool)"
];
// Simplified ABI doesn't help deployment unless we have bytecode.
// I will use Hardhat via shell command instead to deploy properly, OR just use the factory if I had bytecode.
// Since I have a "packages/blockchain" folder, I should use `npx hardhat run scripts/deploy.ts` if available.
// Let me first CHECK if there is a deploy script in `packages/blockchain`.
