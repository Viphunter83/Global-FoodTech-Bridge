
const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

// Configuration from environment or defaults
const RPC_URL = process.env.RPC_URL || "https://polygon-rpc.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
    console.error("FATAL: PRIVATE_KEY is not set in environment.");
    process.exit(1);
}

const CONTRACT_PATH = path.resolve(__dirname, '../../../packages/blockchain/contracts/SupplyChainRegistry.sol');

async function main() {
    console.log(`--- FoodTech Bridge: Mainnet Deployment ---`);
    console.log(`Network: ${RPC_URL}`);
    console.log(`Contract: ${CONTRACT_PATH}`);

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
            },
            optimizer: {
                enabled: true,
                runs: 200
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

    console.log("Compiling Smart Contract...");
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    if (output.errors) {
        output.errors.forEach(err => console.error(err.formattedMessage));
        if (output.errors.some(err => err.severity === 'error')) process.exit(1);
    }

    const contractFile = output.contracts['SupplyChainRegistry.sol']['SupplyChainRegistry'];
    const bytecode = contractFile.evm.bytecode.object;
    const abi = contractFile.abi;

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    console.log(`Deployer Address: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`Current Balance: ${ethers.formatEther(balance)} POL`);

    if (balance < ethers.parseEther("0.05")) {
        console.warn("WARNING: Balance might be too low for deployment.");
    }

    console.log("Deploying...");
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);
    
    // For Polygon Mainnet, sometimes we need to manually specify gas to avoid "underpriced" errors
    const feeData = await provider.getFeeData();
    const contract = await factory.deploy({
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
    });

    console.log("Waiting for confirmation...");
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    
    console.log(`\n=========================================`);
    console.log(`✅ DEPLOYED SUCCESSFULLY!`);
    console.log(`CONTRACT ADDRESS: ${address}`);
    console.log(`=========================================\n`);
    
    console.log(`Roles granted automatically to deployer (constructor).`);
    console.log(`Action required: Update Railway CONTRACT_ADDRESS variable.`);
}

main().catch(error => {
    console.error("Deployment failed:", error);
    process.exit(1);
});
