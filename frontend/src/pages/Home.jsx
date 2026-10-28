import React, { useState } from "react";
import { Search, Shield, Truck, Box, CheckCircle, ArrowRight, Layers, Lock, Cpu } from "lucide-react";

export default function Home({ onSearchTrack, onConnectWallet, account, setActivePage }) {
  const [searchId, setSearchId] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      onSearchTrack(searchId.trim());
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 70%, #0f766e 100%)",
          color: "#ffffff",
          padding: "48px 36px",
          border: "none",
          marginBottom: "32px"
        }}
      >
        <div style={{ maxWidth: "760px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(13, 148, 136, 0.25)",
              color: "#5eead4",
              border: "1px solid rgba(94, 234, 212, 0.3)",
              padding: "4px 12px",
              borderRadius: "9999px",
              fontSize: "0.82rem",
              fontWeight: 600,
              marginBottom: "16px"
            }}
          >
            <Shield size={14} /> Ethereum Smart Contract Powered
          </div>

          <h1 style={{ fontSize: "2.4rem", fontWeight: 800, lineHeight: 1.2, marginBottom: "16px" }}>
            Blockchain-Based Supply Chain Tracking System
          </h1>

          <p style={{ fontSize: "1.05rem", color: "#cbd5e1", lineHeight: 1.6, marginBottom: "28px" }}>
            A decentralized platform for verifiable product provenance, immutable ownership transfers,
            and real-time logistics auditing across manufacturers, distributors, warehouses, and retailers.
          </p>

          {/* Quick Tracking Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: "flex",
              gap: "10px",
              maxWidth: "540px",
              background: "#ffffff",
              padding: "6px",
              borderRadius: "10px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", paddingLeft: "12px", color: "var(--text-muted)" }}>
              <Search size={18} />
            </div>
            <input
              type="number"
              min="1"
              placeholder="Enter Product ID (e.g. 1, 2...)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "0.95rem",
                color: "var(--navy-dark)",
                padding: "8px 4px"
              }}
            />
            <button type="submit" className="btn btn-teal">
              Track Journey
            </button>
          </form>

          {/* Action buttons */}
          <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            {!account ? (
              <button className="btn btn-teal" onClick={onConnectWallet}>
                Connect MetaMask Wallet <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn-teal" onClick={() => setActivePage("manufacturer")}>
                Go to Dashboard <ArrowRight size={16} />
              </button>
            )}
            <button
              className="btn btn-outline"
              style={{ background: "rgba(255, 255, 255, 0.1)", color: "#ffffff", borderColor: "rgba(255,255,255,0.2)" }}
              onClick={() => setActivePage("admin")}
            >
              Role Administration
            </button>
          </div>
        </div>
      </div>

      {/* How Blockchain Supply Chain Tracking Works */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">How It Works</h2>
            <p className="card-subtitle">
              Every stage of the supply chain executes an EVM transaction, ensuring complete transparency and tamper-proofing.
            </p>
          </div>
        </div>

        <div className="grid-3" style={{ marginTop: "12px" }}>
          <div style={{ padding: "16px", borderRadius: "8px", background: "#f8fafc", border: "1px solid var(--border-color)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0369a1", marginBottom: "12px" }}>
              <Shield size={20} />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "6px" }}>1. Role-Based Permissions</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              The Contract Admin authorizes participants with explicit roles: Manufacturer, Distributor, Warehouse, and Retailer. Only authorized wallets can perform authorized actions.
            </p>
          </div>

          <div style={{ padding: "16px", borderRadius: "8px", background: "#f8fafc", border: "1px solid var(--border-color)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#ccfbf1", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f766e", marginBottom: "12px" }}>
              <Box size={20} />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "6px" }}>2. Product Minting</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Manufacturers register batches and products directly on Ethereum. Each product is assigned an immutable ID, timestamp, and cryptographic proof of origin.
            </p>
          </div>

          <div style={{ padding: "16px", borderRadius: "8px", background: "#f8fafc", border: "1px solid var(--border-color)" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#b45309", marginBottom: "12px" }}>
              <Truck size={20} />
            </div>
            <h4 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "6px" }}>3. Custodial Transfers</h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
              When goods move between distributor, warehouse, and retailer, the current custodian issues an on-chain transfer recording the physical location and new owner.
            </p>
          </div>
        </div>
      </div>

      {/* Key Advantages */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Project Architectural Highlights</h2>
            <p className="card-subtitle">Engineered specifically for academic and demonstration rigor</p>
          </div>
        </div>

        <div className="grid-2" style={{ gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <CheckCircle size={20} color="var(--teal-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontWeight: 600, fontSize: "0.95rem" }}>Zero Centralized Database</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                No Firebase, MongoDB, or Supabase. All product identities, timestamps, ownership transitions, and history logs live entirely on the Ethereum blockchain.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <CheckCircle size={20} color="var(--teal-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontWeight: 600, fontSize: "0.95rem" }}>Smart Contract Security Enforcement</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Permissions are secured at the EVM opcode level via Solidity modifiers (<code>onlyAdmin</code>, <code>onlyRole</code>, <code>onlyProductOwner</code>).
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <CheckCircle size={20} color="var(--teal-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontWeight: 600, fontSize: "0.95rem" }}>Public Read-Only Tracking</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Consumers and auditors do not need MetaMask or crypto funds to track a product's authentic journey. Tracking is publicly verifiable by anyone.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <CheckCircle size={20} color="var(--teal-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <h4 style={{ fontWeight: 600, fontSize: "0.95rem" }}>QR Code Verification</h4>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Each registered item features an instant QR verification code for easy mobile barcode scanning at retail checkpoints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
