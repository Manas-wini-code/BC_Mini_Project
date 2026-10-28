import React, { useState } from "react";
import { assignRole, revokeRole, fetchRole, parseBlockchainError, shortenAddress } from "../blockchain/contract";
import { ROLES, ROLE_OPTIONS } from "../blockchain/config";
import { Shield, UserPlus, Search, CheckCircle2, AlertCircle, RefreshCw, KeyRound, UserMinus } from "lucide-react";

export default function AdminDashboard({ account, isAdmin, onConnectWallet, onSwitchAccount, adminAddress }) {
  // Form state for assigning role
  const [targetAddress, setTargetAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("1"); // default Manufacturer
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState(null);
  const [assignError, setAssignError] = useState("");

  // Query state for checking role
  const [queryAddress, setQueryAddress] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [queriedRole, setQueriedRole] = useState(null);
  const [queryError, setQueryError] = useState("");

  // Revoke state
  const [revokeAddress, setRevokeAddress] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeResult, setRevokeResult] = useState(null);
  const [revokeError, setRevokeError] = useState("");

  // Handle Assign Role Submit
  const handleAssignRole = async (e) => {
    e.preventDefault();
    setAssignError("");
    setAssignResult(null);

    if (!account) {
      setAssignError("Please connect your MetaMask wallet first.");
      return;
    }

    try {
      setIsAssigning(true);
      const res = await assignRole(targetAddress.trim(), selectedRole);
      setAssignResult({
        txHash: res.txHash,
        account: targetAddress.trim(),
        role: ROLES[selectedRole]
      });
      setTargetAddress("");
    } catch (err) {
      setAssignError(parseBlockchainError(err));
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle Read / Query Role
  const handleQueryRole = async (e) => {
    e.preventDefault();
    setQueryError("");
    setQueriedRole(null);

    try {
      setIsQuerying(true);
      const roleId = await fetchRole(queryAddress.trim());
      setQueriedRole({
        address: queryAddress.trim(),
        roleId,
        roleName: ROLES[roleId] || "None"
      });
    } catch (err) {
      setQueryError(parseBlockchainError(err));
    } finally {
      setIsQuerying(false);
    }
  };

  // Handle Revoke Role Submit
  const handleRevokeRole = async (e) => {
    e.preventDefault();
    setRevokeError("");
    setRevokeResult(null);

    if (!account) {
      setRevokeError("Please connect your MetaMask wallet first.");
      return;
    }

    try {
      setIsRevoking(true);
      const res = await revokeRole(revokeAddress.trim());
      setRevokeResult({
        txHash: res.txHash,
        account: revokeAddress.trim()
      });
      setRevokeAddress("");
    } catch (err) {
      setRevokeError(parseBlockchainError(err));
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--navy-dark)" }}>
          Administrator Dashboard
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Manage Role-Based Access Control (RBAC) permissions on the Ethereum smart contract.
        </p>
      </div>

      {/* Wallet Status Info Card */}
      <div className="card" style={{ borderLeft: "4px solid var(--navy-dark)" }}>
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <KeyRound size={20} color="var(--navy-dark)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Connected Wallet</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.9rem", color: account ? "var(--navy-dark)" : "var(--text-muted)" }}>
                {account ? account : "No wallet connected"}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {account ? (
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  backgroundColor: isAdmin ? "var(--teal-light)" : "var(--warning-bg)",
                  color: isAdmin ? "var(--teal-dark)" : "var(--warning)"
                }}
              >
                {isAdmin ? "✓ Verified Contract Admin" : "Connected (Non-Admin)"}
              </span>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={onConnectWallet}>
                Connect MetaMask
              </button>
            )}
          </div>
        </div>

        {adminAddress && (
          <div style={{ marginTop: "12px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Contract Admin Address: <span style={{ fontFamily: "monospace" }}>{adminAddress}</span>
          </div>
        )}

        {!isAdmin && account && (
          <div className="alert alert-warning" style={{ marginTop: "14px", marginBottom: 0, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>
                <strong>Note:</strong> Your connected wallet is not the contract administrator.
                Role assignment transactions will be reverted by the smart contract modifier <code>onlyAdmin</code>.
              </span>
            </div>
            {onSwitchAccount && (
              <button className="btn btn-outline btn-sm" onClick={onSwitchAccount} style={{ whiteSpace: "nowrap" }}>
                Switch Account
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid-2">
        {/* SECTION 1: Assign Role Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <UserPlus size={18} color="var(--teal-primary)" /> Assign Role to Participant
              </h3>
              <p className="card-subtitle">Authorize an address as a supply chain participant</p>
            </div>
          </div>

          {assignError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{assignError}</span>
            </div>
          )}

          {assignResult && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <div>
                <strong>Role Assigned Successfully!</strong>
                <div style={{ fontSize: "0.82rem", marginTop: "4px" }}>
                  Wallet: <code style={{ wordBreak: "break-all" }}>{shortenAddress(assignResult.account)}</code>
                  <br />
                  Role: <strong>{assignResult.role}</strong>
                  <br />
                  Tx Hash: <code style={{ wordBreak: "break-all" }}>{shortenAddress(assignResult.txHash)}</code>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleAssignRole}>
            <div className="form-group">
              <label className="form-label">Participant Wallet Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                required
                style={{ fontFamily: "monospace" }}
              />
              <span className="form-hint">Ethereum wallet address of the party (42 characters).</span>
            </div>

            <div className="form-group">
              <label className="form-label">Select Role</label>
              <select
                className="form-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="form-hint">
                Manufacturer (registers items), Distributor, Warehouse, Retailer (delivery).
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-teal"
              disabled={isAssigning || !account}
              style={{ width: "100%" }}
            >
              {isAssigning ? "Confirming on Blockchain..." : "Assign Role"}
            </button>
          </form>
        </div>

        {/* SECTION 2: Query / Check Role */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Search size={18} color="var(--navy-dark)" /> Check Wallet Role
              </h3>
              <p className="card-subtitle">Query the current on-chain role for any address (Free read)</p>
            </div>
          </div>

          {queryError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{queryError}</span>
            </div>
          )}

          <form onSubmit={handleQueryRole}>
            <div className="form-group">
              <label className="form-label">Ethereum Address to Check</label>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                value={queryAddress}
                onChange={(e) => setQueryAddress(e.target.value)}
                required
                style={{ fontFamily: "monospace" }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-outline"
              disabled={isQuerying}
              style={{ width: "100%", marginBottom: "16px" }}
            >
              {isQuerying ? "Reading Blockchain..." : "Query Role"}
            </button>
          </form>

          {queriedRole && (
            <div
              style={{
                padding: "16px",
                borderRadius: "8px",
                background: "#f8fafc",
                border: "1px solid var(--border-color)"
              }}
            >
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                Query Result:
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.88rem", wordBreak: "break-all" }}>
                {queriedRole.address}
              </div>
              <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Active Role:</span>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    backgroundColor: queriedRole.roleId > 0 ? "var(--teal-light)" : "#e2e8f0",
                    color: queriedRole.roleId > 0 ? "var(--teal-dark)" : "var(--text-muted)"
                  }}
                >
                  {queriedRole.roleName}
                </span>
              </div>
            </div>
          )}

          {/* Quick Revoke Section */}
          <div style={{ marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--danger)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <UserMinus size={16} /> Revoke Role
            </h4>

            {revokeError && (
              <div className="alert alert-danger" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
                <AlertCircle size={16} />
                <span>{revokeError}</span>
              </div>
            )}

            {revokeResult && (
              <div className="alert alert-success" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
                <CheckCircle2 size={16} />
                <span>Role successfully revoked for {shortenAddress(revokeResult.account)}</span>
              </div>
            )}

            <form onSubmit={handleRevokeRole} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="form-input"
                placeholder="Address to revoke (0x...)"
                value={revokeAddress}
                onChange={(e) => setRevokeAddress(e.target.value)}
                style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
              />
              <button
                type="submit"
                className="btn btn-danger-outline btn-sm"
                disabled={isRevoking || !account}
                style={{ whiteSpace: "nowrap" }}
              >
                {isRevoking ? "Revoking..." : "Revoke"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
