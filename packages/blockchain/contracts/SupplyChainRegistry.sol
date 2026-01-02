// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChainRegistry {
    struct Record {
        string ipfsHash;
        address notary;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from Batch UUID string to Record
    mapping(string => Record) public records;

    event BatchRegistered(string batchUUID, string dataHash, address indexed notary, uint256 timestamp);

    function registerBatch(string memory batchUUID, string memory dataHash) public {
        require(!records[batchUUID].exists, "Batch already registered");

        records[batchUUID] = Record({
            ipfsHash: dataHash,
            notary: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit BatchRegistered(batchUUID, dataHash, msg.sender, block.timestamp);
    }
}
