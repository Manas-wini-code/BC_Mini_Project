import React, { useState } from "react";
import { getActiveContractAddress, setActiveContractAddress, clearActiveContractAddress, DEFAULT_CONTRACT_ADDRESS } from "../blockchain/config";
import { X, Check, RefreshCw, AlertCircle, Shield } from "lucide-react";

export default function ContractModal({ isOpen, onClose, onAddressUpdated }) {
  const [addressInput, setAddressInput] = useState(getActiveContractAddress());
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    setErrorMsg("");
    setStatusMsg("");

    const trimmed = addressInput.trim();
    if (!trimmed.startsWith("0x") || trimmed.length !== 42) {
      setErrorMsg("Please enter a valid 42-character Ethereum contract address (e.g. 0x123...456)");
      return;
    }

    const ok = setActiveContractAddress(trimmed);
    if (ok) {
      setStatusMsg("Contract address saved successfully!");
      if (onAddressUpdated) onAddressUpdated(trimmed);
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setErrorMsg("Failed to save address format.");
    }
  };

  const handleReset = () => {
    clearActiveContractAddress();
    setAddressInput(DEFAULT_CONTRACT_ADDRESS);
    setStatusMsg("Reset to default address.");
    if (onAddressUpdated) onAddressUpdated(DEFAULT_CONTRACT_ADDRESS);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={20} color="var(--teal-primary)" />
            <h3 style={{ fontSize: "1.15rem", fontWeight: "700" }}>Smart Contract Settings</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginBottom: "16px" }}>
          Paste the deployed <strong>SupplyChain</strong> contract address from Remix IDE.
        </p>

        {errorMsg && (
          <div className="alert alert-danger" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {statusMsg && (
          <div className="alert alert-success" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
            <Check size={16} />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Contract Address (EVM)</label>
          <input
            type="text"
            className="form-input"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="0x..."
            style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
          />
          <span className="form-hint">
            You can find this under "Deployed Contracts" in Remix IDE after hitting Deploy.
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
          <button className="btn btn-outline btn-sm" onClick={handleReset} type="button">
            <RefreshCw size={14} /> Reset Default
          </button>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn btn-outline btn-sm" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="btn btn-teal btn-sm" onClick={handleSave} type="button">
              Save Contract Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
