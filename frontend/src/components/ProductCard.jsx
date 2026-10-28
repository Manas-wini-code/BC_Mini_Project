import React from "react";
import StatusBadge from "./StatusBadge";
import { formatTimestamp, shortenAddress } from "../blockchain/contract";
import { QRCodeSVG } from "qrcode.react";
import { Box, User, Hash, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export default function ProductCard({ product, onTrack, onTransfer, currentAccount }) {
  if (!product) return null;

  const isOwner = currentAccount && product.currentOwner &&
    currentAccount.toLowerCase() === product.currentOwner.toLowerCase();

  // Create a tracking URL that points to current window location with product ID
  const trackingUrl = typeof window !== "undefined"
    ? `${window.location.origin}?trackId=${product.id}`
    : `ProductID:${product.id}`;

  return (
    <div className="card" style={{ borderLeft: "4px solid var(--teal-primary)" }}>
      <div className="card-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h3 className="card-title" style={{ fontSize: "1.2rem" }}>
              {product.name}
            </h3>
            <span style={{ fontSize: "0.82rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
              ID: #{product.id}
            </span>
            <StatusBadge status={product.status} />
          </div>
          <p className="card-subtitle">
            Manufactured by: <strong>{product.manufacturerName}</strong>
          </p>
        </div>

        {/* QR Code for quick tracking */}
        <div style={{ textAlign: "center", background: "#ffffff", padding: "6px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <QRCodeSVG value={trackingUrl} size={64} level="M" />
          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "2px" }}>Scan to Track</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: "12px", marginBottom: "16px", fontSize: "0.88rem" }}>
        <div>
          <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <Hash size={14} /> Batch Number
          </div>
          <div style={{ fontWeight: 600 }}>{product.batchNumber}</div>
        </div>

        <div>
          <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <User size={14} /> Current Custodian
          </div>
          <div style={{ fontFamily: "monospace", fontWeight: 600 }}>
            {shortenAddress(product.currentOwner)}
            {isOwner && (
              <span style={{ marginLeft: "6px", color: "var(--teal-primary)", fontSize: "0.75rem", fontWeight: 700 }}>
                (You)
              </span>
            )}
          </div>
        </div>

        <div>
          <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <ShieldCheck size={14} /> Manufacturer Wallet
          </div>
          <div style={{ fontFamily: "monospace" }}>
            {shortenAddress(product.manufacturer)}
          </div>
        </div>

        <div>
          <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
            <Clock size={14} /> Registered On
          </div>
          <div>{formatTimestamp(product.createdAt)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", borderTop: "1px solid var(--border-color)", paddingTop: "14px" }}>
        {onTrack && (
          <button className="btn btn-outline btn-sm" onClick={() => onTrack(product.id)}>
            View Full Journey Timeline
          </button>
        )}
        {isOwner && onTransfer && Number(product.status) !== 2 && (
          <button className="btn btn-teal btn-sm" onClick={() => onTransfer(product.id)}>
            Transfer Custody <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
