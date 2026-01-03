
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

const RPC_URL = "https://rpc-amoy.polygon.technology";
const ADMIN_KEY = "11d9aa36e00148c062a2511f63071bfb50f57d5df9c5abf64fdb67a9c1779e89";

const LOGISTICS_ADDR = "0x1b9ba7069eb01d54fE7E8fC563274f945576B73a";
const RETAILER_ADDR = "0xB69B16B4b22e65BfCe544774DA9947E61506Fea0";

const CONTRACT_PATH = path.resolve(__dirname, '../../../packages/blockchain/contracts/SupplyChainRegistry.sol');

async function main() {
    console.log(`Reading contract from ${CONTRACT_PATH}...`);
    const content = fs.readFileSync(CONTRACT_PATH, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'SupplyChainRegistry.sol': { content }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    function findImports(pathName) {
        try {
            const nodeModulesPath = path.resolve(__dirname, '../../../packages/blockchain/node_modules');
            const absolutePath = pathName.startsWith('@openzeppelin')
                ? path.join(nodeModulesPath, pathName)
                : path.resolve(path.dirname(CONTRACT_PATH), pathName);

            if (fs.existsSync(absolutePath)) {
                return { contents: fs.readFileSync(absolutePath, 'utf8') };
            }
            return { error: 'File not found' };
        } catch (e) {
            return { error: e.message };
        }
    }

    console.log("Compiling...");
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    if (output.errors) {
        output.errors.forEach(err => console.error(err.formattedMessage));
        if (output.errors.some(err => err.severity === 'error')) process.exit(1);
    }

    const contractFile = output.contracts['SupplyChainRegistry.sol']['SupplyChainRegistry'];
    const bytecode = contractFile.evm.bytecode.object;
    const abi = contractFile.abi;

    console.log("Connecting to Amoy...");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(ADMIN_KEY, provider);

    console.log(`Deploying from ${wallet.address}...`);
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    const contract = await factory.deploy();

    console.log("Waiting for deployment...");
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    console.log(`DEPLOYED AT: ${address}`);

    // Roles
    const LOGISTICS_ROLE = ethers.keccak256(ethers.toUtf8Bytes("LOGISTICS_ROLE"));
    const RETAILER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE"));

    console.log(`Granting LOGISTICS_ROLE to ${LOGISTICS_ADDR}...`);
    const tx1 = await contract.grantRole(LOGISTICS_ROLE, LOGISTICS_ADDR);
    await tx1.wait();
    console.log("Granted!");

    console.log(`Granting RETAILER_ROLE to ${RETAILER_ADDR}...`);
    const tx2 = await contract.grantRole(RETAILER_ROLE, RETAILER_ADDR);
    await tx2.wait();
    console.log("Granted!");

    console.log("DONE. Please update docker-compose.yml with new address.");
}

main().catch(console.error);
