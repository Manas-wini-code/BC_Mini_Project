import React, { useState, useRef, useEffect } from "react";
import { shortenAddress } from "../blockchain/contract";
import { ROLES } from "../blockchain/config";
import {
  Box,
  Shield,
  Truck,
  LogOut,
  Wallet,
  SlidersHorizontal,
  Search,
  AlertTriangle,
  ArrowLeftRight,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  UserCheck
} from "lucide-react";

export default function Navbar({
  activePage,
  setActivePage,
  account,
  chainId,
  isWrongNetwork,
  onSwitchNetwork,
  userRole,
  isAdmin,
  isConnecting,
  isSwitchingAccount,
  onConnectWallet,
  onDisconnectWallet,
  onSwitchAccount,
  onRefreshAccount,
  onOpenSettings,
  contractConfigured
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  const roleName = ROLES[userRole] || "Guest";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand" onClick={() => setActivePage("home")}>
          <div className="brand-icon">
            <Box size={22} />
          </div>
          <div className="brand-text">
            <h1>SupplyChain<span style={{ color: "var(--teal-primary)" }}>Ledger</span></h1>
            <span>Blockchain Product Tracking</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav>
          <ul className="nav-links">
            <li>
              <button
                className={`nav-item-btn ${activePage === "home" ? "active" : ""}`}
                onClick={() => setActivePage("home")}
              >
                Home
              </button>
            </li>
            <li>
              <button
                className={`nav-item-btn ${activePage === "track" ? "active" : ""}`}
                onClick={() => setActivePage("track")}
              >
                <Search size={15} />
                Track Product
              </button>
            </li>
            <li>
              <button
                className={`nav-item-btn ${activePage === "admin" ? "active" : ""}`}
                onClick={() => setActivePage("admin")}
              >
                <Shield size={15} />
                Admin
              </button>
            </li>
            <li>
              <button
                className={`nav-item-btn ${activePage === "manufacturer" ? "active" : ""}`}
                onClick={() => setActivePage("manufacturer")}
              >
                <Box size={15} />
                Manufacturer
              </button>
            </li>
            <li>
              <button
                className={`nav-item-btn ${activePage === "transfer" ? "active" : ""}`}
                onClick={() => setActivePage("transfer")}
              >
                <Truck size={15} />
                Transfer & Custody
              </button>
            </li>
          </ul>
        </nav>

        {/* Right actions: Network, Wallet & Settings */}
        <div className="nav-actions">
          {/* Network Badge */}
          {account && (
            <div>
              {isWrongNetwork ? (
                <button
                  className="btn btn-sm btn-danger-outline"
                  onClick={onSwitchNetwork}
                  title="Click to switch to Sepolia network"
                  style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 10px", fontSize: "0.8rem" }}
                >
                  <AlertTriangle size={13} />
                  <span>Switch to Sepolia</span>
                </button>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    color: "#065f46",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "0.78rem",
                    fontWeight: 600
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
                  <span>Sepolia</span>
                </div>
              )}
            </div>
          )}

          <button
            className="btn btn-outline btn-sm"
            onClick={onOpenSettings}
            title="Configure Deployed Contract Address"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <SlidersHorizontal size={14} />
            <span>Contract Config</span>
          </button>

          {account ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Wallet Dropdown Wrapper */}
              <div className="wallet-dropdown-wrapper" ref={dropdownRef}>
                <button
                  className="wallet-badge-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  title="Click for Wallet Management"
                >
                  <span className="wallet-dot" />
                  <span>{shortenAddress(account)}</span>
                  {isAdmin ? (
                    <span className="wallet-role-tag" style={{ background: "#fef3c7", color: "#92400e" }}>
                      Admin
                    </span>
                  ) : userRole > 0 ? (
                    <span className="wallet-role-tag">
                      {roleName}
                    </span>
                  ) : null}
                  <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="wallet-dropdown-menu">
                    <div className="wallet-dropdown-header">
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                        Active Wallet Account
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 600, color: "var(--navy-dark)" }}>
                          {shortenAddress(account)}
                        </span>
                        <button
                          onClick={handleCopyAddress}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: copied ? "var(--success)" : "var(--text-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "0.75rem"
                          }}
                          title="Copy Full Address"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copied ? "Copied" : "Copy"}</span>
                        </button>
                      </div>

                      <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>On-Chain Role:</span>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            backgroundColor: isAdmin ? "#fef3c7" : userRole > 0 ? "var(--teal-light)" : "#f1f5f9",
                            color: isAdmin ? "#92400e" : userRole > 0 ? "var(--teal-dark)" : "var(--text-muted)"
                          }}
                        >
                          {isAdmin ? "Contract Admin" : roleName}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      className="wallet-dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        onSwitchAccount();
                      }}
                      disabled={isSwitchingAccount}
                    >
                      <ArrowLeftRight size={15} color="var(--teal-primary)" />
                      <span>{isSwitchingAccount ? "Requesting Account..." : "Connect Another Account"}</span>
                    </button>

                    <button
                      className="wallet-dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        onRefreshAccount();
                      }}
                    >
                      <RefreshCw size={15} color="var(--navy-dark)" />
                      <span>Sync Active Account</span>
                    </button>

                    <div style={{ height: "1px", background: "var(--border-color)", margin: "6px 0" }} />

                    <button
                      className="wallet-dropdown-item danger"
                      onClick={() => {
                        setDropdownOpen(false);
                        onDisconnectWallet();
                      }}
                    >
                      <LogOut size={15} />
                      <span>Disconnect Wallet</span>
                    </button>

                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "8px", padding: "0 4px", lineHeight: 1.3 }}>
                      💡 Tip: You can also switch accounts directly in your MetaMask extension.
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Switch Wallet Button */}
              <button
                className="btn btn-outline btn-sm"
                onClick={onSwitchAccount}
                disabled={isSwitchingAccount}
                title="Switch between authorized MetaMask accounts"
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <ArrowLeftRight size={13} />
                <span>{isSwitchingAccount ? "Switching..." : "Switch Wallet"}</span>
              </button>

              {/* Quick Disconnect Button */}
              <button
                className="btn btn-outline btn-sm"
                onClick={onDisconnectWallet}
                title="Disconnect Wallet Session"
                style={{ padding: "6px 9px" }}
              >
                <LogOut size={15} color="#b91c1c" />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={onConnectWallet}
              disabled={isConnecting}
            >
              <Wallet size={15} />
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
