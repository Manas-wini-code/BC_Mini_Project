import React, { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import TrackProduct from "./pages/TrackProduct";
import TransferProduct from "./pages/TransferProduct";
import ContractModal from "./components/ContractModal";
import {
  isMetaMaskInstalled,
  requestWalletConnection,
  requestAccountSwitch,
  getContractAdmin,
  fetchRole,
  parseBlockchainError,
  switchToSepoliaNetwork,
  shortenAddress
} from "./blockchain/contract";
import {
  getActiveContractAddress,
  DEFAULT_CONTRACT_ADDRESS,
  SEPOLIA_CHAIN_ID
} from "./blockchain/config";
import { AlertCircle, SlidersHorizontal, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [userRole, setUserRole] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAddress, setAdminAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contractAddress, setContractAddress] = useState(getActiveContractAddress());
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [selectedTransferId, setSelectedTransferId] = useState(null);

  const isContractConfigured = contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000";
  const isWrongNetwork = Boolean(account && chainId && chainId !== SEPOLIA_CHAIN_ID);

  // Load contract admin and role info
  const refreshAccountAndContractInfo = useCallback(async (currentAcc) => {
    try {
      if (isContractConfigured) {
        // 1. Fetch Contract Admin
        try {
          const admin = await getContractAdmin();
          setAdminAddress(admin);
          if (currentAcc && admin.toLowerCase() === currentAcc.toLowerCase()) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          console.warn("Could not read admin address from contract:", e);
        }

        // 2. Fetch User Role
        if (currentAcc) {
          try {
            const role = await fetchRole(currentAcc);
            setUserRole(role);
          } catch (e) {
            console.warn("Could not read role for account:", e);
            setUserRole(0);
          }
        }
      }
    } catch (err) {
      console.warn("Error refreshing contract state:", err);
    }
  }, [isContractConfigured]);

  // Connect MetaMask Wallet
  const handleConnectWallet = async () => {
    setWalletError("");
    setIsConnecting(true);
    localStorage.removeItem("WALLET_EXPLICIT_DISCONNECTED");
    try {
      const { address, chainId } = await requestWalletConnection();
      setAccount(address);
      setChainId(chainId);
      await refreshAccountAndContractInfo(address);

      // Prompt to switch network if not on Sepolia
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await switchToSepoliaNetwork();
          const provider = new BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
        } catch (switchErr) {
          console.warn("User deferred switching to Sepolia:", switchErr);
        }
      }
    } catch (err) {
      setWalletError(parseBlockchainError(err));
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch Account handler
  const handleSwitchAccount = async () => {
    setWalletError("");
    setIsSwitchingAccount(true);
    try {
      localStorage.removeItem("WALLET_EXPLICIT_DISCONNECTED");
      const { address, chainId } = await requestAccountSwitch();
      setAccount(address);
      setChainId(chainId);
      await refreshAccountAndContractInfo(address);

      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await switchToSepoliaNetwork();
          const provider = new BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
        } catch (switchErr) {
          console.warn("User deferred switching to Sepolia:", switchErr);
        }
      }
    } catch (err) {
      setWalletError(parseBlockchainError(err));
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  // Sync / Refresh currently active account from MetaMask
  const handleRefreshAccount = async () => {
    setWalletError("");
    try {
      if (!isMetaMaskInstalled()) {
        throw new Error("MetaMask is not detected. Please install MetaMask.");
      }
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No connected accounts found. Please click Connect MetaMask.");
      }
      localStorage.removeItem("WALLET_EXPLICIT_DISCONNECTED");
      setAccount(accounts[0]);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
      await refreshAccountAndContractInfo(accounts[0]);
    } catch (err) {
      setWalletError(parseBlockchainError(err));
    }
  };

  // Switch to Sepolia handler
  const handleSwitchNetwork = async () => {
    setIsSwitchingNetwork(true);
    setWalletError("");
    try {
      await switchToSepoliaNetwork();
      if (isMetaMaskInstalled()) {
        const provider = new BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));
        if (account) {
          await refreshAccountAndContractInfo(account);
        }
      }
    } catch (err) {
      setWalletError(parseBlockchainError(err));
    } finally {
      setIsSwitchingNetwork(false);
    }
  };

  // Disconnect / Clear local state
  const handleDisconnectWallet = () => {
    localStorage.setItem("WALLET_EXPLICIT_DISCONNECTED", "true");
    setAccount(null);
    setUserRole(0);
    setIsAdmin(false);
  };

  // Listen for MetaMask account and chain changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      const isExplicitlyDisconnected = localStorage.getItem("WALLET_EXPLICIT_DISCONNECTED") === "true";
      if (!isExplicitlyDisconnected) {
        window.ethereum
          .request({ method: "eth_accounts" })
          .then(async (accounts) => {
            if (accounts && accounts.length > 0) {
              setAccount(accounts[0]);
              try {
                const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
                setChainId(parseInt(chainIdHex, 16));
              } catch (e) {
                console.warn("Error fetching chainId:", e);
              }
              refreshAccountAndContractInfo(accounts[0]);
            }
          })
          .catch(console.error);
      }

      // Listener for accounts change
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          handleDisconnectWallet();
        } else {
          localStorage.removeItem("WALLET_EXPLICIT_DISCONNECTED");
          setAccount(accounts[0]);
          refreshAccountAndContractInfo(accounts[0]);
        }
      };

      // Listener for chain changed
      const handleChainChanged = (chainIdHex) => {
        setChainId(parseInt(chainIdHex, 16));
        if (account) {
          refreshAccountAndContractInfo(account);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [account, refreshAccountAndContractInfo]);

  // Listen for trackId in URL if shared
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const trackId = urlParams.get("trackId");
      if (trackId) {
        setSelectedTrackId(trackId);
        setActivePage("track");
      }
    }
  }, []);

  // Handlers for navigation from other pages
  const handleSearchTrack = (pId) => {
    setSelectedTrackId(pId);
    setActivePage("track");
  };

  const handleTransferRequest = (pId) => {
    setSelectedTransferId(pId);
    setActivePage("transfer");
  };

  return (
    <div className="app-container">
      {/* Top Banner: Contract Configuration & Etherscan link */}
      <div className={`config-banner ${!isContractConfigured ? "unconfigured" : ""}`}>
        <div className="config-banner-left">
          {!isContractConfigured ? (
            <>
              <AlertCircle size={15} />
              <span>
                <strong>Contract Address Not Configured:</strong> Deploy <code>SupplyChain.sol</code> and enter the address to connect.
              </span>
            </>
          ) : (
            <>
              <ShieldCheck size={15} color="var(--teal-primary)" />
              <span>
                Sepolia Contract: <code style={{ fontFamily: "monospace" }}>{contractAddress}</code>
              </span>
              <a
                href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "var(--teal-dark)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  marginLeft: "6px",
                  fontSize: "0.8rem",
                  textDecoration: "underline"
                }}
              >
                View on Etherscan <ExternalLink size={12} />
              </a>
            </>
          )}
        </div>
        <button className="btn-link-action" onClick={() => setIsSettingsOpen(true)}>
          {!isContractConfigured ? "Set Contract Address" : "Contract Settings"}
        </button>
      </div>

      {/* Network Alert Banner when user is on a different network */}
      {isWrongNetwork && (
        <div style={{ backgroundColor: "#fef2f2", borderBottom: "1px solid #fecaca", padding: "10px 20px" }}>
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#991b1b", fontSize: "0.88rem" }}>
              <AlertTriangle size={18} />
              <span>
                <strong>Incorrect Network:</strong> MetaMask is connected to Chain ID <code>{chainId}</code>. The contract is deployed on <strong>Ethereum Sepolia (Chain ID 11155111)</strong>.
              </span>
            </div>
            <button
              className="btn btn-teal btn-sm"
              onClick={handleSwitchNetwork}
              disabled={isSwitchingNetwork}
            >
              {isSwitchingNetwork ? "Switching..." : "Switch to Sepolia Network"}
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        account={account}
        chainId={chainId}
        isWrongNetwork={isWrongNetwork}
        onSwitchNetwork={handleSwitchNetwork}
        userRole={userRole}
        isAdmin={isAdmin}
        isConnecting={isConnecting}
        isSwitchingAccount={isSwitchingAccount}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onSwitchAccount={handleSwitchAccount}
        onRefreshAccount={handleRefreshAccount}
        onOpenSettings={() => setIsSettingsOpen(true)}
        contractConfigured={isContractConfigured}
      />

      {/* Global Wallet Error Banner */}
      {walletError && (
        <div style={{ maxWidth: "1200px", margin: "16px auto 0", padding: "0 20px" }}>
          <div className="alert alert-danger" style={{ marginBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={18} />
              <span>{walletError}</span>
            </div>
            <button
              onClick={() => setWalletError("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontWeight: 700 }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Router */}
      <main className="main-content">
        {activePage === "home" && (
          <Home
            onSearchTrack={handleSearchTrack}
            onConnectWallet={handleConnectWallet}
            account={account}
            setActivePage={setActivePage}
          />
        )}

        {activePage === "track" && (
          <TrackProduct
            initialProductId={selectedTrackId}
            onTransferRequest={handleTransferRequest}
            currentAccount={account}
          />
        )}

        {activePage === "admin" && (
          <AdminDashboard
            account={account}
            isAdmin={isAdmin}
            onConnectWallet={handleConnectWallet}
            onSwitchAccount={handleSwitchAccount}
            adminAddress={adminAddress}
          />
        )}

        {activePage === "manufacturer" && (
          <ManufacturerDashboard
            account={account}
            userRole={userRole}
            onConnectWallet={handleConnectWallet}
            onSwitchAccount={handleSwitchAccount}
            onTrackProduct={handleSearchTrack}
          />
        )}

        {activePage === "transfer" && (
          <TransferProduct
            account={account}
            onConnectWallet={handleConnectWallet}
            onSwitchAccount={handleSwitchAccount}
            onTrackProduct={handleSearchTrack}
            initialTransferId={selectedTransferId}
          />
        )}
      </main>

      {/* Settings Modal */}
      <ContractModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onAddressUpdated={(newAddr) => {
          setContractAddress(newAddr);
          refreshAccountAndContractInfo(account);
        }}
      />

      {/* Professional Academic Footer */}
      <footer className="footer">
        <p>
          <strong>Blockchain-Based Supply Chain Tracking System</strong> • College Mini-Project
        </p>
        <p style={{ marginTop: "4px", fontSize: "0.8rem" }}>
          Ethereum Sepolia Contract: <a href={`https://sepolia.etherscan.io/address/${contractAddress}`} target="_blank" rel="noreferrer" style={{ color: "var(--teal-primary)", fontFamily: "monospace" }}>{shortenAddress(contractAddress)}</a> • Ethers.js v6 • Zero Centralized Database
        </p>
      </footer>
    </div>
  );
}
