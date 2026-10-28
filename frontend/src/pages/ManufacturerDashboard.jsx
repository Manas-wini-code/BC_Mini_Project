import React, { useState } from "react";
import { registerProduct, parseBlockchainError, shortenAddress } from "../blockchain/contract";
import { Box, CheckCircle2, AlertCircle, ArrowRight, ShieldAlert, Sparkles, Hash, Factory } from "lucide-react";

export default function ManufacturerDashboard({ account, userRole, onConnectWallet, onSwitchAccount, onTrackProduct }) {
  const [productName, setProductName] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState(null);

  const isManufacturer = userRole === 1; // Role.Manufacturer === 1

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessData(null);

    if (!account) {
      setErrorMsg("Please connect your MetaMask wallet first.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await registerProduct(productName, manufacturerName, batchNumber);
      setSuccessData({
        productId: res.productId,
        txHash: res.txHash,
        name: productName,
        batch: batchNumber
      });

      // Clear form
      setProductName("");
      setBatchNumber("");
    } catch (err) {
      setErrorMsg(parseBlockchainError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--navy-dark)" }}>
          Manufacturer Dashboard
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Register new products on the blockchain to initialize their cryptographic supply chain journey.
        </p>
      </div>

      {/* Role Notice */}
      {!account ? (
        <div className="alert alert-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box size={20} />
            <span>Connect your manufacturer wallet with MetaMask to register products.</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onConnectWallet}>
            Connect Wallet
          </button>
        </div>
      ) : !isManufacturer ? (
        <div className="alert alert-warning" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <ShieldAlert size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Manufacturer Role Required:</strong>
              <p style={{ fontSize: "0.85rem", marginTop: "2px" }}>
                Your connected wallet (<code>{shortenAddress(account)}</code>) does not hold the <strong>Manufacturer</strong> role.
                The smart contract modifier <code>onlyRole(Role.Manufacturer)</code> will reject unauthorized registration attempts.
                Please switch to the manufacturer wallet or request role assignment from the Admin.
              </p>
            </div>
          </div>
          {onSwitchAccount && (
            <button className="btn btn-outline btn-sm" onClick={onSwitchAccount} style={{ whiteSpace: "nowrap" }}>
              Switch Account
            </button>
          )}
        </div>
      ) : null}

      {/* Success Banner */}
      {successData && (
        <div className="card" style={{ border: "2px solid var(--teal-primary)", background: "#f0fdfa", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
            <div style={{ background: "var(--teal-primary)", color: "white", padding: "10px", borderRadius: "50%" }}>
              <CheckCircle2 size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--navy-dark)" }}>
                Product Registered Successfully!
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "2px" }}>
                The product has been minted on the Ethereum blockchain with an immutable timestamp and initial custody.
              </p>

              <div className="grid-3" style={{ marginTop: "16px", marginBottom: "16px" }}>
                <div style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Assigned Product ID
                  </div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--teal-primary)" }}>
                    #{successData.productId}
                  </div>
                </div>

                <div style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Batch Number
                  </div>
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--navy-dark)", marginTop: "4px" }}>
                    {successData.batch}
                  </div>
                </div>

                <div style={{ background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Transaction Hash
                  </div>
                  <div style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "var(--navy-dark)", marginTop: "4px", wordBreak: "break-all" }}>
                    {shortenAddress(successData.txHash)}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  className="btn btn-teal btn-sm"
                  onClick={() => onTrackProduct(successData.productId)}
                >
                  View Product Details & Timeline <ArrowRight size={14} />
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setSuccessData(null)}
                >
                  Register Another Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Form Card */}
      <div className="card" style={{ maxWidth: "700px" }}>
        <div className="card-header">
          <div>
            <h3 className="card-title" style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
              <Factory size={20} color="var(--teal-primary)" /> Register New Product
            </h3>
            <p className="card-subtitle">
              Enter the manufacturing and batch credentials
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Organic Ethiopian Coffee 250g or Paracetamol 500mg"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
            />
            <span className="form-hint">Official product nomenclature or trade designation.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Manufacturer Facility / Company Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Apex BioPharma Industries or GreenHarvest Corp"
              value={manufacturerName}
              onChange={(e) => setManufacturerName(e.target.value)}
              required
            />
            <span className="form-hint">Entity name officially certifying production origin.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Batch / Lot Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. LOT-2026-X89 or BATCH-0482"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              required
              style={{ fontFamily: "monospace" }}
            />
            <span className="form-hint">Production lot or batch reference identifier.</span>
          </div>

          <div style={{ marginTop: "24px" }}>
            <button
              type="submit"
              className="btn btn-teal"
              disabled={isSubmitting || !account}
              style={{ width: "100%", padding: "12px" }}
            >
              {isSubmitting ? "Registering on Ethereum..." : "Register Product on Blockchain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
