// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChainRegistry {
    struct Record {
        string ipfsHash;
        address notary;
        uint256 timestamp;
        bool exists;
        bool handedOver;
        string violationDetails;
    }

    // Mapping from Batch UUID string to Record
    mapping(string => Record) public records;

    event BatchRegistered(string batchUUID, string dataHash, address indexed notary, uint256 timestamp);
    event BatchHandover(string batchUUID, address indexed notary, uint256 timestamp);
    event BatchViolation(string batchUUID, string details, address indexed notary, uint256 timestamp);

    function registerBatch(string memory batchUUID, string memory dataHash) public {
        require(!records[batchUUID].exists, "Batch already registered");

        records[batchUUID] = Record({
            ipfsHash: dataHash,
            notary: msg.sender,
            timestamp: block.timestamp,
            exists: true,
            handedOver: false,
            violationDetails: ""
        });

        emit BatchRegistered(batchUUID, dataHash, msg.sender, block.timestamp);
    }

    function reportViolation(string memory batchUUID, string memory details) public {
        require(records[batchUUID].exists, "Batch not found");
        
        Record storage record = records[batchUUID];
        record.violationDetails = details;
        
        emit BatchViolation(batchUUID, details, msg.sender, block.timestamp);
    }

    function finalizeHandover(string memory batchUUID) public {
        require(records[batchUUID].exists, "Batch not found");
        require(!records[batchUUID].handedOver, "Batch already handed over");
        
        Record storage record = records[batchUUID];
        record.handedOver = true;
        
        emit BatchHandover(batchUUID, msg.sender, block.timestamp);
    }
}
