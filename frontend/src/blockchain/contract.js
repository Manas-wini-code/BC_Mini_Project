import { ethers } from "ethers";
import contractABI from "./contractABI.json";
import {
  getActiveContractAddress,
  FALLBACK_RPC_URL,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_HEX,
  SEPOLIA_NETWORK_CONFIG
} from "./config";

/**
 * Checks if MetaMask or an EVM provider is available in the browser window
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== "undefined" && Boolean(window.ethereum);
};

/**
 * Shorten an Ethereum address for UI display (0x1234...5678)
 */
export const shortenAddress = (address) => {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Formats a UNIX timestamp (seconds) into human-readable date/time
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  const num = typeof timestamp === "bigint" ? Number(timestamp) : Number(timestamp);
  if (num === 0) return "N/A";
  return new Date(num * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

/**
 * Extract user-friendly error message from ethers v6 transaction or call error
 */
export const parseBlockchainError = (error) => {
  if (!error) return "An unknown error occurred.";

  // User rejected transaction in MetaMask
  if (error.code === 4001 || error.code === "ACTION_REJECTED") {
    return "Transaction was cancelled / rejected in MetaMask.";
  }

  // Insufficient funds for gas
  if (
    error.code === "INSUFFICIENT_FUNDS" ||
    error.message?.toLowerCase().includes("insufficient funds") ||
    error.info?.error?.message?.toLowerCase().includes("insufficient funds")
  ) {
    return "Insufficient Sepolia ETH in your wallet to cover transaction gas fees. Please obtain free testnet ETH from a Sepolia faucet.";
  }

  // Contract revert with specific reason
  if (error.reason) {
    return error.reason.replace("execution reverted: ", "").replace("SupplyChain: ", "");
  }

  if (error.shortMessage) {
    return error.shortMessage;
  }

  if (error.info?.error?.message) {
    return error.info.error.message.replace("execution reverted: ", "");
  }

  if (error.message) {
    if (error.message.includes("user rejected action")) {
      return "Transaction was rejected in MetaMask.";
    }
    if (error.message.includes("Connector not connected")) {
      return "Please connect your MetaMask wallet first.";
    }
    if (error.message.includes("network")) {
      return "Network communication error. Please ensure your wallet is set to Ethereum Sepolia.";
    }
    return error.message.slice(0, 160);
  }

  return "Transaction failed on blockchain. Please verify permissions and parameters.";
};

/**
 * Switch or add Sepolia network to MetaMask
 */
export const switchToSepoliaNetwork = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not detected. Please install MetaMask to switch networks.");
  }
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
    });
    return true;
  } catch (switchError) {
    // Error code 4902 indicates that Sepolia has not been added to the user's MetaMask
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [SEPOLIA_NETWORK_CONFIG]
        });
        return true;
      } catch (addError) {
        throw new Error("Failed to add Sepolia testnet to MetaMask.");
      }
    }
    throw switchError;
  }
};

/**
 * Get read-only or read-write ethers provider
 */
export const getProvider = () => {
  if (isMetaMaskInstalled()) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  // Fallback to public RPC provider for read-only tracking without MetaMask
  return new ethers.JsonRpcProvider(FALLBACK_RPC_URL);
};

/**
 * Get MetaMask signer
 */
export const getSigner = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to perform transactions.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
};

/**
 * Request wallet connection and retrieve network
 */
export const requestWalletConnection = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not detected. Please install the MetaMask extension.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please unlock MetaMask.");
  }
  const network = await provider.getNetwork();
  return {
    address: accounts[0],
    chainId: Number(network.chainId)
  };
};

/**
 * Request account switch via MetaMask permissions API.
 * Triggers the MetaMask account selection dialog allowing the user to select another account.
 */
export const requestAccountSwitch = async () => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not detected. Please install the MetaMask extension.");
  }
  try {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }]
    });
  } catch (permError) {
    if (permError.code === 4001 || permError.code === "ACTION_REJECTED") {
      throw new Error("Account selection was cancelled in MetaMask.");
    }
    console.warn("wallet_requestPermissions fallback to eth_requestAccounts:", permError);
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_accounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts authorized in MetaMask.");
  }
  const network = await provider.getNetwork();
  return {
    address: accounts[0],
    chainId: Number(network.chainId)
  };
};

/**
 * Get Contract instance
 * @param {boolean} needSigner - If true, initializes with signer for sending transactions
 */
export const getContractInstance = async (needSigner = false) => {
  const address = getActiveContractAddress();
  if (!address || address === "0x0000000000000000000000000000000000000000" || !ethers.isAddress(address)) {
    throw new Error("Smart contract address is not configured. Please set the deployed contract address.");
  }

  if (needSigner) {
    const signer = await getSigner();
    return new ethers.Contract(address, contractABI, signer);
  } else {
    const provider = getProvider();
    return new ethers.Contract(address, contractABI, provider);
  }
};

// ==========================================
// CONTRACT READ FUNCTIONS
// ==========================================

export const getContractAdmin = async () => {
  const contract = await getContractInstance(false);
  return await contract.admin();
};

export const fetchRole = async (accountAddress) => {
  if (!ethers.isAddress(accountAddress)) {
    throw new Error("Invalid Ethereum address provided.");
  }
  const contract = await getContractInstance(false);
  const roleNum = await contract.getRole(accountAddress);
  return Number(roleNum);
};

export const fetchProductCount = async () => {
  const contract = await getContractInstance(false);
  const count = await contract.getProductCount();
  return Number(count);
};

export const fetchProduct = async (productId) => {
  const pId = Number(productId);
  if (isNaN(pId) || pId <= 0) {
    throw new Error("Product ID must be a positive integer.");
  }

  const contract = await getContractInstance(false);
  const p = await contract.getProduct(pId);

  return {
    id: Number(p.id),
    name: p.name,
    manufacturerName: p.manufacturerName,
    batchNumber: p.batchNumber,
    currentOwner: p.currentOwner,
    manufacturer: p.manufacturer,
    status: Number(p.status),
    createdAt: Number(p.createdAt),
    updatedAt: Number(p.updatedAt)
  };
};

export const fetchProductHistory = async (productId) => {
  const pId = Number(productId);
  if (isNaN(pId) || pId <= 0) {
    throw new Error("Product ID must be a positive integer.");
  }

  const contract = await getContractInstance(false);
  const history = await contract.getProductHistory(pId);

  return history.map((step) => ({
    timestamp: Number(step.timestamp),
    previousOwner: step.previousOwner,
    newOwner: step.newOwner,
    location: step.location,
    status: Number(step.status),
    notes: step.notes
  }));
};

// ==========================================
// CONTRACT WRITE (TRANSACTION) FUNCTIONS
// ==========================================

export const assignRole = async (accountAddress, roleId) => {
  if (!ethers.isAddress(accountAddress)) {
    throw new Error("Invalid target account address.");
  }
  const contract = await getContractInstance(true);
  const tx = await contract.assignRole(accountAddress, Number(roleId));
  const receipt = await tx.wait(); // Wait for confirmation
  return { txHash: tx.hash, receipt };
};

export const revokeRole = async (accountAddress) => {
  if (!ethers.isAddress(accountAddress)) {
    throw new Error("Invalid target account address.");
  }
  const contract = await getContractInstance(true);
  const tx = await contract.revokeRole(accountAddress);
  const receipt = await tx.wait(); // Wait for confirmation
  return { txHash: tx.hash, receipt };
};

export const registerProduct = async (name, manufacturerName, batchNumber) => {
  if (!name.trim()) throw new Error("Product name cannot be empty.");
  if (!manufacturerName.trim()) throw new Error("Manufacturer name cannot be empty.");
  if (!batchNumber.trim()) throw new Error("Batch number cannot be empty.");

  const contract = await getContractInstance(true);
  const tx = await contract.registerProduct(name.trim(), manufacturerName.trim(), batchNumber.trim());
  const receipt = await tx.wait(); // Wait for block confirmation

  // Extract productId from ProductRegistered event if available
  let newProductId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === "ProductRegistered") {
        newProductId = Number(parsed.args.productId);
        break;
      }
    } catch {
      // ignore other events
    }
  }

  // Fallback: If event not parsed, get current product count
  if (!newProductId) {
    const count = await contract.productCount();
    newProductId = Number(count);
  }

  return {
    productId: newProductId,
    txHash: tx.hash,
    receipt
  };
};

export const transferProduct = async (productId, newOwnerAddress, location) => {
  const pId = Number(productId);
  if (isNaN(pId) || pId <= 0) throw new Error("Invalid Product ID.");
  if (!ethers.isAddress(newOwnerAddress)) throw new Error("Invalid recipient wallet address.");
  if (!location.trim()) throw new Error("Transfer location is required.");

  const contract = await getContractInstance(true);
  const tx = await contract.transferProduct(pId, newOwnerAddress, location.trim());
  const receipt = await tx.wait(); // Wait for confirmation
  return { txHash: tx.hash, receipt };
};

export const markProductDelivered = async (productId, location) => {
  const pId = Number(productId);
  if (isNaN(pId) || pId <= 0) throw new Error("Invalid Product ID.");
  if (!location.trim()) throw new Error("Delivery location is required.");

  const contract = await getContractInstance(true);
  const tx = await contract.markDelivered(pId, location.trim());
  const receipt = await tx.wait(); // Wait for confirmation
  return { txHash: tx.hash, receipt };
};
