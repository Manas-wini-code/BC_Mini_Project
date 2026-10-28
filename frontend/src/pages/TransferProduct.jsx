import React, { useState } from "react";
import { transferProduct, markProductDelivered, parseBlockchainError, shortenAddress } from "../blockchain/contract";
import { Truck, CheckCircle2, AlertCircle, ArrowRight, MapPin, UserCheck, CheckCheck } from "lucide-react";

export default function TransferProduct({ account, onConnectWallet, onSwitchAccount, onTrackProduct, initialTransferId }) {
  const [activeTab, setActiveTab] = useState("transfer"); // "transfer" | "deliver"

  // Transfer Form State
  const [transferId, setTransferId] = useState(initialTransferId ? String(initialTransferId) : "");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferLocation, setTransferLocation] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferResult, setTransferResult] = useState(null);
  const [transferError, setTransferError] = useState("");

  // Delivery Form State
  const [deliveryId, setDeliveryId] = useState(initialTransferId ? String(initialTransferId) : "");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [deliveryError, setDeliveryError] = useState("");

  // Handle Transfer Submit
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setTransferError("");
    setTransferResult(null);

    if (!account) {
      setTransferError("Please connect your MetaMask wallet first.");
      return;
    }

    try {
      setIsTransferring(true);
      const res = await transferProduct(transferId.trim(), recipientAddress.trim(), transferLocation.trim());
      setTransferResult({
        productId: transferId.trim(),
        recipient: recipientAddress.trim(),
        location: transferLocation.trim(),
        txHash: res.txHash
      });
      // Clear inputs
      setRecipientAddress("");
      setTransferLocation("");
    } catch (err) {
      setTransferError(parseBlockchainError(err));
    } finally {
      setIsTransferring(false);
    }
  };

  // Handle Mark Delivered Submit
  const handleDeliverSubmit = async (e) => {
    e.preventDefault();
    setDeliveryError("");
    setDeliveryResult(null);

    if (!account) {
      setDeliveryError("Please connect your MetaMask wallet first.");
      return;
    }

    try {
      setIsDelivering(true);
      const res = await markProductDelivered(deliveryId.trim(), deliveryLocation.trim());
      setDeliveryResult({
        productId: deliveryId.trim(),
        location: deliveryLocation.trim(),
        txHash: res.txHash
      });
      setDeliveryLocation("");
    } catch (err) {
      setDeliveryError(parseBlockchainError(err));
    } finally {
      setIsDelivering(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--navy-dark)" }}>
          Custody Transfer & Delivery Status
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Transfer on-chain custody to the next authorized supply chain participant or record final delivery.
        </p>
      </div>

      {/* Wallet check */}
      {!account && (
        <div className="alert alert-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Connect your MetaMask wallet to execute custody transfers or mark deliveries.</span>
          <button className="btn btn-primary btn-sm" onClick={onConnectWallet}>
            Connect Wallet
          </button>
        </div>
      )}

      {/* Sub-Tabs: Transfer vs Deliver */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button
          className={`btn ${activeTab === "transfer" ? "btn-teal" : "btn-outline"}`}
          onClick={() => setActiveTab("transfer")}
        >
          <Truck size={16} /> Transfer Custody
        </button>
        <button
          className={`btn ${activeTab === "deliver" ? "btn-teal" : "btn-outline"}`}
          onClick={() => setActiveTab("deliver")}
        >
          <CheckCheck size={16} /> Mark as Delivered
        </button>
      </div>

      {/* TAB 1: Transfer Product */}
      {activeTab === "transfer" && (
        <div className="card" style={{ maxWidth: "700px" }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Truck size={20} color="var(--teal-primary)" /> Transfer Product Ownership
              </h3>
              <p className="card-subtitle">
                Current owner transfers physical and digital custody to the next authorized participant
              </p>
            </div>
          </div>

          {transferError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{transferError}</span>
            </div>
          )}

          {transferResult && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <div style={{ flex: 1 }}>
                <strong>Ownership Transferred Successfully!</strong>
                <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                  Product ID: <strong>#{transferResult.productId}</strong>
                  <br />
                  Transferred To: <code style={{ wordBreak: "break-all" }}>{shortenAddress(transferResult.recipient)}</code>
                  <br />
                  Location: <strong>{transferResult.location}</strong>
                  <br />
                  Tx Hash: <code style={{ wordBreak: "break-all" }}>{shortenAddress(transferResult.txHash)}</code>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <button
                    className="btn btn-teal btn-sm"
                    onClick={() => onTrackProduct(transferResult.productId)}
                  >
                    View Updated Journey Timeline <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleTransferSubmit}>
            <div className="form-group">
              <label className="form-label">Product ID</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="e.g. 1"
                value={transferId}
                onChange={(e) => setTransferId(e.target.value)}
                required
              />
              <span className="form-hint">Must be a registered product currently owned by your wallet.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Wallet Address (New Owner)</label>
              <input
                type="text"
                className="form-input"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                required
                style={{ fontFamily: "monospace" }}
              />
              <span className="form-hint">
                The destination wallet must hold an assigned role (Distributor, Warehouse, or Retailer).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Current Transit Location / Hub</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Chicago Regional Distribution Center, Bay 4"
                value={transferLocation}
                onChange={(e) => setTransferLocation(e.target.value)}
                required
              />
              <span className="form-hint">Physical logistics checkpoint or transit station.</span>
            </div>

            <div style={{ marginTop: "24px" }}>
              <button
                type="submit"
                className="btn btn-teal"
                disabled={isTransferring || !account}
                style={{ width: "100%", padding: "12px" }}
              >
                {isTransferring ? "Executing On-Chain Transfer..." : "Submit Custody Transfer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Mark Delivered */}
      {activeTab === "deliver" && (
        <div className="card" style={{ maxWidth: "700px" }}>
          <div className="card-header">
            <div>
              <h3 className="card-title" style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCheck size={20} color="var(--success)" /> Mark Product as Delivered
              </h3>
              <p className="card-subtitle">
                Finalizes product status to "Delivered" once received at retail destination or customer
              </p>
            </div>
          </div>

          {deliveryError && (
            <div className="alert alert-danger">
              <AlertCircle size={18} />
              <span>{deliveryError}</span>
            </div>
          )}

          {deliveryResult && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              <div style={{ flex: 1 }}>
                <strong>Product Successfully Marked Delivered!</strong>
                <div style={{ fontSize: "0.85rem", marginTop: "4px" }}>
                  Product ID: <strong>#{deliveryResult.productId}</strong>
                  <br />
                  Final Destination: <strong>{deliveryResult.location}</strong>
                  <br />
                  Tx Hash: <code style={{ wordBreak: "break-all" }}>{shortenAddress(deliveryResult.txHash)}</code>
                </div>
                <div style={{ marginTop: "10px" }}>
                  <button
                    className="btn btn-teal btn-sm"
                    onClick={() => onTrackProduct(deliveryResult.productId)}
                  >
                    View Final Timeline <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleDeliverSubmit}>
            <div className="form-group">
              <label className="form-label">Product ID</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="e.g. 1"
                value={deliveryId}
                onChange={(e) => setDeliveryId(e.target.value)}
                required
              />
              <span className="form-hint">Product to be marked Delivered. Must be owned by caller.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Final Delivery Location / Store</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Retail Store #104, New York, NY"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                required
              />
              <span className="form-hint">Physical point of sale or consumer delivery drop point.</span>
            </div>

            <div style={{ marginTop: "24px" }}>
              <button
                type="submit"
                className="btn btn-teal"
                disabled={isDelivering || !account}
                style={{ width: "100%", padding: "12px" }}
              >
                {isDelivering ? "Confirming Delivery on Blockchain..." : "Mark as Delivered"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
