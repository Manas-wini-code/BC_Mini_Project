// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SupplyChain
 * @dev Decentralized Supply Chain Tracking System with Role-Based Access Control
 * for college mini-project demonstration.
 */
contract SupplyChain {
    // Roles in the supply chain
    enum Role {
        None,           // 0
        Manufacturer,   // 1
        Distributor,    // 2
        Warehouse,      // 3
        Retailer        // 4
    }

    // Status of product lifecycle
    enum ProductStatus {
        Created,        // 0
        InTransit,      // 1
        Delivered       // 2
    }

    // Structure for movement / tracking history
    struct MovementStep {
        uint256 timestamp;
        address previousOwner;
        address newOwner;
        string location;
        ProductStatus status;
        string notes;
    }

    // Structure for product information
    struct Product {
        uint256 id;
        string name;
        string manufacturerName;
        string batchNumber;
        address currentOwner;
        address manufacturer;
        ProductStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // System administrator (contract deployer)
    address public admin;

    // Total registered products counter
    uint256 public productCount;

    // Mapping: Address => Role
    mapping(address => Role) public roles;

    // Mapping: Product ID => Product details
    mapping(uint256 => Product) private products;

    // Mapping: Product ID => Movement history log
    mapping(uint256 => MovementStep[]) private productHistory;

    // --- EVENTS ---
    event RoleAssigned(address indexed account, Role role);
    event RoleRevoked(address indexed account);
    event ProductRegistered(
        uint256 indexed productId,
        string name,
        address indexed manufacturer,
        string batchNumber,
        uint256 timestamp
    );
    event ProductTransferred(
        uint256 indexed productId,
        address indexed from,
        address indexed to,
        string location,
        uint256 timestamp
    );
    event ProductDelivered(
        uint256 indexed productId,
        address indexed deliveredBy,
        string location,
        uint256 timestamp
    );

    // --- MODIFIERS ---
    modifier onlyAdmin() {
        require(msg.sender == admin, "SupplyChain: Only admin can perform this action");
        _;
    }

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "SupplyChain: Caller does not have required role");
        _;
    }

    modifier onlyProductOwner(uint256 _productId) {
        require(_productId > 0 && _productId <= productCount, "SupplyChain: Invalid product ID");
        require(products[_productId].currentOwner == msg.sender, "SupplyChain: Caller is not the current product owner");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // --- ROLE MANAGEMENT FUNCTIONS ---

    /**
     * @notice Assigns a specific role to an account.
     * @dev Only the contract admin can call this.
     */
    function assignRole(address _account, Role _role) external onlyAdmin {
        require(_account != address(0), "SupplyChain: Invalid address");
        require(_role != Role.None, "SupplyChain: Use revokeRole to remove a role");
        roles[_account] = _role;
        emit RoleAssigned(_account, _role);
    }

    /**
     * @notice Revokes role from an account.
     * @dev Only the contract admin can call this.
     */
    function revokeRole(address _account) external onlyAdmin {
        require(_account != address(0), "SupplyChain: Invalid address");
        require(roles[_account] != Role.None, "SupplyChain: Account does not have any active role");
        roles[_account] = Role.None;
        emit RoleRevoked(_account);
    }

    /**
     * @notice Returns role of a specific account.
     */
    function getRole(address _account) external view returns (Role) {
        return roles[_account];
    }

    /**
     * @notice Helper to check if an account has a specific role.
     */
    function hasRole(address _account, Role _role) external view returns (bool) {
        return roles[_account] == _role;
    }

    // --- PRODUCT MANAGEMENT FUNCTIONS ---

    /**
     * @notice Registers a new product in the supply chain.
     * @dev Only authorized Manufacturers can call this function.
     */
    function registerProduct(
        string memory _name,
        string memory _manufacturerName,
        string memory _batchNumber
    ) external onlyRole(Role.Manufacturer) returns (uint256) {
        require(bytes(_name).length > 0, "SupplyChain: Product name is required");
        require(bytes(_manufacturerName).length > 0, "SupplyChain: Manufacturer name is required");
        require(bytes(_batchNumber).length > 0, "SupplyChain: Batch number is required");

        productCount++;
        uint256 newProductId = productCount;

        Product memory newProduct = Product({
            id: newProductId,
            name: _name,
            manufacturerName: _manufacturerName,
            batchNumber: _batchNumber,
            currentOwner: msg.sender,
            manufacturer: msg.sender,
            status: ProductStatus.Created,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        products[newProductId] = newProduct;

        // Record initial creation in movement history
        productHistory[newProductId].push(
            MovementStep({
                timestamp: block.timestamp,
                previousOwner: address(0),
                newOwner: msg.sender,
                location: "Manufacturing Facility",
                status: ProductStatus.Created,
                notes: "Product registered and certified by Manufacturer"
            })
        );

        emit ProductRegistered(newProductId, _name, msg.sender, _batchNumber, block.timestamp);
        return newProductId;
    }

    /**
     * @notice Transfers product ownership to another participant in the supply chain.
     * @dev Can only be called by the current product owner. The sender must also hold an authorized role.
     */
    function transferProduct(
        uint256 _productId,
        address _newOwner,
        string memory _location
    ) external onlyProductOwner(_productId) {
        require(_newOwner != address(0), "SupplyChain: Invalid new owner address");
        require(_newOwner != msg.sender, "SupplyChain: New owner cannot be the current owner");
        require(products[_productId].status != ProductStatus.Delivered, "SupplyChain: Delivered products cannot be transferred");
        require(roles[msg.sender] != Role.None, "SupplyChain: Current owner does not hold an authorized supply chain role");
        require(roles[_newOwner] != Role.None, "SupplyChain: New owner must have an authorized supply chain role");
        require(bytes(_location).length > 0, "SupplyChain: Location cannot be empty");

        address prevOwner = products[_productId].currentOwner;
        products[_productId].currentOwner = _newOwner;
        products[_productId].status = ProductStatus.InTransit;
        products[_productId].updatedAt = block.timestamp;

        // Append to movement log
        productHistory[_productId].push(
            MovementStep({
                timestamp: block.timestamp,
                previousOwner: prevOwner,
                newOwner: _newOwner,
                location: _location,
                status: ProductStatus.InTransit,
                notes: string(abi.encodePacked("Transferred to ", getRoleName(roles[_newOwner])))
            })
        );

        emit ProductTransferred(_productId, prevOwner, _newOwner, _location, block.timestamp);
    }

    /**
     * @notice Marks a product as Delivered at the final destination.
     * @dev Callable by current owner (e.g. Retailer or Warehouse) or Admin.
     */
    function markDelivered(
        uint256 _productId,
        string memory _location
    ) external onlyProductOwner(_productId) {
        require(products[_productId].status != ProductStatus.Delivered, "SupplyChain: Product is already delivered");
        require(
            roles[msg.sender] == Role.Retailer || roles[msg.sender] == Role.Warehouse || msg.sender == admin,
            "SupplyChain: Only Retailer, Warehouse, or Admin can mark as delivered"
        );
        require(bytes(_location).length > 0, "SupplyChain: Delivery location cannot be empty");

        products[_productId].status = ProductStatus.Delivered;
        products[_productId].updatedAt = block.timestamp;

        productHistory[_productId].push(
            MovementStep({
                timestamp: block.timestamp,
                previousOwner: msg.sender,
                newOwner: msg.sender,
                location: _location,
                status: ProductStatus.Delivered,
                notes: "Successfully delivered to customer / final destination"
            })
        );

        emit ProductDelivered(_productId, msg.sender, _location, block.timestamp);
    }

    // --- VIEW / READ FUNCTIONS (PUBLIC/READ-ONLY) ---

    /**
     * @notice Retrieves product details by ID.
     */
    function getProduct(uint256 _productId)
        external
        view
        returns (
            uint256 id,
            string memory name,
            string memory manufacturerName,
            string memory batchNumber,
            address currentOwner,
            address manufacturer,
            ProductStatus status,
            uint256 createdAt,
            uint256 updatedAt
        )
    {
        require(_productId > 0 && _productId <= productCount, "SupplyChain: Product does not exist");
        Product memory p = products[_productId];
        return (
            p.id,
            p.name,
            p.manufacturerName,
            p.batchNumber,
            p.currentOwner,
            p.manufacturer,
            p.status,
            p.createdAt,
            p.updatedAt
        );
    }

    /**
     * @notice Retrieves full movement timeline for a product.
     */
    function getProductHistory(uint256 _productId)
        external
        view
        returns (MovementStep[] memory)
    {
        require(_productId > 0 && _productId <= productCount, "SupplyChain: Product does not exist");
        return productHistory[_productId];
    }

    /**
     * @notice Returns total number of registered products.
     */
    function getProductCount() external view returns (uint256) {
        return productCount;
    }

    /**
     * @notice Helper to get human-readable role name.
     */
    function getRoleName(Role _role) public pure returns (string memory) {
        if (_role == Role.Manufacturer) return "Manufacturer";
        if (_role == Role.Distributor) return "Distributor";
        if (_role == Role.Warehouse) return "Warehouse";
        if (_role == Role.Retailer) return "Retailer";
        return "None";
    }
}
