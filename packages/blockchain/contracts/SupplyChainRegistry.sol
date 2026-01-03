// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SupplyChainRegistry
 * @dev Implements FoodTech Batch tracking via NFT (ERC721).
 *      Each batch is a Token. 
 *      Ownership represents physical custody.
 *      AccessControl manages permissions for producing, transporting, and retailing.
 */
contract SupplyChainRegistry is ERC721URIStorage, AccessControl {
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant LOGISTICS_ROLE = keccak256("LOGISTICS_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct BatchInfo {
        string batchUUID;
        string violationDetails;
        bool isViolated;
        uint256 creationTime;
    }

    // Mapping TokenID -> Batch Info
    mapping(uint256 => BatchInfo) public batchInfos;

    // Mapping UUID string -> TokenID (to look up by string ID)
    mapping(string => uint256) public uuidToTokenId;

    event BatchCreated(uint256 indexed tokenId, string batchUUID, address indexed producer, uint256 timestamp);
    event BatchCustodyTransferred(uint256 indexed tokenId, address from, address to, uint256 timestamp);
    event ViolationReported(uint256 indexed tokenId, string details, address indexed reporter, uint256 timestamp);

    constructor() ERC721("FoodTechBatch", "FTB") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PRODUCER_ROLE, msg.sender);
        _grantRole(LOGISTICS_ROLE, msg.sender);
        _grantRole(RETAILER_ROLE, msg.sender);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Producer mints a new Batch NFT.
     * @param batchUUID Unique string identifier from internal systems
     * @param tokenURI IPFS metdata link
     */
    function createBatch(string memory batchUUID, string memory tokenURI) public onlyRole(PRODUCER_ROLE) {
        require(uuidToTokenId[batchUUID] == 0, "Batch UUID already exists");

        // Generate Token ID from UUID hash
        uint256 tokenId = uint256(keccak256(abi.encodePacked(batchUUID)));
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        uuidToTokenId[batchUUID] = tokenId;
        batchInfos[tokenId] = BatchInfo({
            batchUUID: batchUUID,
            violationDetails: "",
            isViolated: false,
            creationTime: block.timestamp
        });

        emit BatchCreated(tokenId, batchUUID, msg.sender, block.timestamp);
    }

    /**
     * @dev Transfer custody (ownership) of the batch.
     *      Can be used for Logistics -> Retailer handover.
     *      Overrides standard transfer to add Role checks if needed.
     */
    // Mapping to store pending transfers (tokenId => toAddress)
    mapping(uint256 => address) public pending_transfers;

    event TransferInitiated(uint256 indexed tokenId, address indexed from, address indexed to);
    event TransferCompleted(uint256 indexed tokenId, address indexed from, address indexed to);

    // Step 1: Current owner initiates transfer to a specific address
    function initiateTransfer(uint256 tokenId, address to) public {
        require(ownerOf(tokenId) == msg.sender, "Only owner can initiate transfer");
        require(to != address(0), "Invalid target address");
        require(
            hasRole(LOGISTICS_ROLE, to) || hasRole(RETAILER_ROLE, to),
            "Recipient must be an authorized Logistics or Retail partner"
        );
        
        pending_transfers[tokenId] = to;
        emit TransferInitiated(tokenId, msg.sender, to);
    }

    // Step 2: Target address accepts the transfer
    function acceptTransfer(uint256 tokenId) public {
        require(pending_transfers[tokenId] == msg.sender, "Caller is not the pending owner");
        
        address currentOwner = ownerOf(tokenId);
        _transfer(currentOwner, msg.sender, tokenId);
        
        delete pending_transfers[tokenId];
        emit TransferCompleted(tokenId, currentOwner, msg.sender);
        emit BatchCustodyTransferred(tokenId, currentOwner, msg.sender, block.timestamp); // Keep original event for consistency
    }
    
    // Legacy function removed/replaced by 2-step process
    // function transferCustody... 

    /**
     * @dev Report a compliance violation (e.g. Temp > -18C).
     *      Can be called by IoT sensors (via Oracle) or Auditors.
     */
    function reportViolation(string memory batchUUID, string memory details) public {
        uint256 tokenId = uuidToTokenId[batchUUID];
        require(tokenId != 0, "Batch does not exist");
        require(
            hasRole(AUDITOR_ROLE, msg.sender) || hasRole(LOGISTICS_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 
            "Not authorized to report violation"
        );

        BatchInfo storage info = batchInfos[tokenId];
        info.violationDetails = details;
        info.isViolated = true;

        emit ViolationReported(tokenId, details, msg.sender, block.timestamp);
    }

    /**
     * @dev Public view for transparency
     */
    function getBatchData(string memory batchUUID) public view returns (
        address currentOwner,
        string memory uri, 
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
            tokenURI(tokenId),
            info.violationDetails,
            info.isViolated,
            info.creationTime,
            pending_transfers[tokenId]
        );
    }
}
