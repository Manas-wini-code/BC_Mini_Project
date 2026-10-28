/**
 * Blockchain & Network Configuration
 * ----------------------------------------------------------------------------
 * Deployed on: Ethereum Sepolia Testnet
 * Contract: SupplyChain.sol
 * Contract Address: 0x4e7590c7e068c603fce08700380dca01b83802d9
 * Etherscan: https://sepolia.etherscan.io/address/0x4e7590c7e068c603fce08700380dca01b83802d9
 * ----------------------------------------------------------------------------
 */

// Deployed Sepolia Contract Address
export const DEFAULT_CONTRACT_ADDRESS = "0x4e7590c7e068c603fce08700380dca01b83802d9";

// Network Parameters: Ethereum Sepolia Testnet
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export const SEPOLIA_NETWORK_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: "Sepolia Test Network",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: [
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://rpc.sepolia.org",
    "https://sepolia.gateway.tenderly.co"
  ],
  blockExplorerUrls: ["https://sepolia.etherscan.io"]
};

// Fallback public RPC for read-only tracking without MetaMask
export const FALLBACK_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

// Roles enum mapping corresponding to Solidity enum Role
export const ROLES = {
  0: "None",
  1: "Manufacturer",
  2: "Distributor",
  3: "Warehouse",
  4: "Retailer"
};

export const ROLE_OPTIONS = [
  { value: 1, label: "Manufacturer" },
  { value: 2, label: "Distributor" },
  { value: 3, label: "Warehouse" },
  { value: 4, label: "Retailer" }
];

// Product lifecycle status mapping corresponding to Solidity enum ProductStatus
export const PRODUCT_STATUS = {
  0: "Created",
  1: "InTransit",
  2: "Delivered"
};

export const STATUS_COLORS = {
  0: { bg: "#e0f2fe", text: "#0369a1", label: "Created" },
  1: { bg: "#fef3c7", text: "#b45309", label: "In Transit" },
  2: { bg: "#dcfce7", text: "#15803d", label: "Delivered" }
};

/**
 * Gets the active contract address (either from localStorage user override or default config)
 */
export const getActiveContractAddress = () => {
  const customAddress = localStorage.getItem("SUPPLY_CHAIN_CONTRACT_ADDRESS");
  if (customAddress && customAddress.trim().length === 42 && customAddress.startsWith("0x")) {
    return customAddress.trim();
  }
  return DEFAULT_CONTRACT_ADDRESS;
};

/**
 * Sets a custom contract address in browser localStorage
 */
export const setActiveContractAddress = (address) => {
  if (address && address.trim().length === 42 && address.startsWith("0x")) {
    localStorage.setItem("SUPPLY_CHAIN_CONTRACT_ADDRESS", address.trim());
    return true;
  }
  return false;
};

/**
 * Clears custom contract address from localStorage
 */
export const clearActiveContractAddress = () => {
  localStorage.removeItem("SUPPLY_CHAIN_CONTRACT_ADDRESS");
};
