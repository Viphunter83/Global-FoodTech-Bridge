// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SupplyChainRegistryV2
 * @dev Optimized version of FoodTech Batch tracking.
 *      - Added Pausable functionality for emergencies.
 *      - Added Ownable for top-level admin control.
 *      - Gas Optimization: Metadata handled via IPFS hash mapping.
 */
contract SupplyChainRegistryV2 is ERC721, AccessControl, Pausable, Ownable {
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct BatchInfo {
        string batchUUID;
        string violationDetails;
        bool isViolated;
        uint256 creationTime;
        string ipfsHash; // Stores IPFS hash instead of full URI to save gas
    }

    // Mapping TokenID -> Batch Info
    mapping(uint256 => BatchInfo) public batchInfos;
    // Mapping UUID string -> TokenID
    mapping(string => uint256) public uuidToTokenId;
    // Mapping TokenID -> Pending Recipient
    mapping(uint256 => address) public pendingTransfers;

    event BatchCreated(uint256 indexed tokenId, string batchUUID, address indexed producer, uint256 timestamp);
    event BatchCustodyTransferred(uint256 indexed tokenId, address from, address to, uint256 timestamp);
    event ViolationReported(uint256 indexed tokenId, string details, address indexed reporter, uint256 timestamp);
    event TransferInitiated(uint256 indexed tokenId, address indexed from, address indexed to);
    event TransferCompleted(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor(address initialOwner) ERC721("FoodTechBatch", "FTB") Ownable(initialOwner) {
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(PRODUCER_ROLE, initialOwner);
        _grantRole(LOGISTICS_ROLE, initialOwner);
        _grantRole(RETAILER_ROLE, initialOwner);
    }

    /**
     * @dev Emergency pause
     */
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Producer mints a new Batch NFT.
     */
    function createBatch(string memory batchUUID, string memory ipfsHash) public onlyRole(PRODUCER_ROLE) whenNotPaused {
        require(uuidToTokenId[batchUUID] == 0, "Batch UUID already exists");

        uint256 tokenId = uint256(keccak256(abi.encodePacked(batchUUID)));
        
        _mint(msg.sender, tokenId);

        uuidToTokenId[batchUUID] = tokenId;
        batchInfos[tokenId] = BatchInfo({
            batchUUID: batchUUID,
            violationDetails: "",
            isViolated: false,
            creationTime: block.timestamp,
            ipfsHash: ipfsHash
        });

        emit BatchCreated(tokenId, batchUUID, msg.sender, block.timestamp);
    }

    /**
     * @dev Step 1 of Handover: Current owner initiates transfer
     */
    function initiateTransfer(uint256 tokenId, address to) public whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Only owner can initiate");
        require(to != address(0), "Invalid address");
        require(
            hasRole(LOGISTICS_ROLE, to) || hasRole(RETAILER_ROLE, to),
            "Recipient must be authorized partner"
        );
        
        pendingTransfers[tokenId] = to;
        emit TransferInitiated(tokenId, msg.sender, to);
    }

    /**
     * @dev Step 2 of Handover: Recipient accepts transfer
     */
    function acceptTransfer(uint256 tokenId) public whenNotPaused {
        require(pendingTransfers[tokenId] == msg.sender, "Not the pending owner");
        
        address currentOwner = ownerOf(tokenId);
        _transfer(currentOwner, msg.sender, tokenId);
        
        delete pendingTransfers[tokenId];
        emit TransferCompleted(tokenId, currentOwner, msg.sender);
        emit BatchCustodyTransferred(tokenId, currentOwner, msg.sender, block.timestamp);
    }

    /**
     * @dev Log violations from IoT/Auditors
     */
    function reportViolation(string memory batchUUID, string memory details) public whenNotPaused {
        uint256 tokenId = uuidToTokenId[batchUUID];
        require(tokenId != 0, "Batch does not exist");
        require(
            hasRole(AUDITOR_ROLE, msg.sender) || hasRole(LOGISTICS_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 
            "Not authorized"
        );

        BatchInfo storage info = batchInfos[tokenId];
        info.violationDetails = details;
        info.isViolated = true;

        emit ViolationReported(tokenId, details, msg.sender, block.timestamp);
    }

    function getBatchData(string memory batchUUID) public view returns (
        address currentOwner,
        string memory ipfsHash, 
        string memory violation, 
        bool isViolated,
        uint256 timestamp,
        address pendingOwner
    ) {
        uint256 tokenId = uuidToTokenId[batchUUID];
        require(tokenId != 0, "Batch not found");
        
        BatchInfo memory info = batchInfos[tokenId];
        
        return (
            ownerOf(tokenId),
            info.ipfsHash,
            info.violationDetails,
            info.isViolated,
            info.creationTime,
            pendingTransfers[tokenId]
        );
    }
}
