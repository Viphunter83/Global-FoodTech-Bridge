const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SupplyChainRegistryV2', function () {
    let registry, owner, producer, logistics, retailer, outsider;
    const UUID = '1f545978-0000-4000-8000-000000000001';

    beforeEach(async function () {
        [owner, producer, logistics, retailer, outsider] = await ethers.getSigners();
        const Factory = await ethers.getContractFactory('SupplyChainRegistryV2');
        registry = await Factory.deploy(owner.address);

        await registry.grantRole(await registry.PRODUCER_ROLE(), producer.address);
        await registry.grantRole(await registry.LOGISTICS_ROLE(), logistics.address);
        await registry.grantRole(await registry.RETAILER_ROLE(), retailer.address);

        await registry.connect(producer).createBatch(UUID, 'ipfs://meta');
    });

    const tokenId = () => ethers.toBigInt(ethers.solidityPackedKeccak256(['string'], [UUID]));

    it('moves custody through the two-step handover', async function () {
        await registry.connect(producer).initiateTransfer(tokenId(), logistics.address);
        await expect(registry.connect(logistics).acceptTransfer(tokenId()))
            .to.emit(registry, 'TransferCompleted')
            .withArgs(tokenId(), producer.address, logistics.address);
        expect(await registry.ownerOf(tokenId())).to.equal(logistics.address);
    });

    it('rejects plain ERC721 transfers that bypass the handover', async function () {
        await expect(
            registry.connect(producer).transferFrom(producer.address, outsider.address, tokenId())
        ).to.be.revertedWith('Use initiateTransfer/acceptTransfer');

        await registry.connect(producer).approve(outsider.address, tokenId());
        await expect(
            registry.connect(outsider)['safeTransferFrom(address,address,uint256)'](producer.address, outsider.address, tokenId())
        ).to.be.revertedWith('Use initiateTransfer/acceptTransfer');
    });

    it('blocks handovers while paused', async function () {
        await registry.connect(producer).initiateTransfer(tokenId(), logistics.address);
        await registry.pause();
        await expect(registry.connect(logistics).acceptTransfer(tokenId())).to.be.reverted;
    });

    it('only lets the custodian logistics partner report a violation', async function () {
        await expect(
            registry.connect(logistics).reportViolation(UUID, 'TEMP_HIGH')
        ).to.be.revertedWith('Not authorized');

        await registry.connect(producer).initiateTransfer(tokenId(), logistics.address);
        await registry.connect(logistics).acceptTransfer(tokenId());

        await expect(registry.connect(logistics).reportViolation(UUID, 'TEMP_HIGH'))
            .to.emit(registry, 'ViolationReported');
        const data = await registry.getBatchData(UUID);
        expect(data.isViolated).to.equal(true);
    });

    it('rejects violation reports from outsiders', async function () {
        await expect(registry.connect(outsider).reportViolation(UUID, 'fake')).to.be.revertedWith('Not authorized');
    });

    it('rejects duplicate batch UUIDs', async function () {
        await expect(registry.connect(producer).createBatch(UUID, 'ipfs://other')).to.be.revertedWith('Batch UUID already exists');
    });
});
