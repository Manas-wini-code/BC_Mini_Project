import React, { useState, useEffect } from "react";
import { fetchProduct, fetchProductHistory, fetchProductCount, parseBlockchainError } from "../blockchain/contract";
import ProductCard from "../components/ProductCard";
import HistoryTimeline from "../components/HistoryTimeline";
import { Search, AlertCircle, RefreshCw, Layers, ShieldCheck, Box } from "lucide-react";

export default function TrackProduct({ initialProductId, onTransferRequest, currentAccount }) {
  const [productIdInput, setProductIdInput] = useState(initialProductId ? String(initialProductId) : "1");
  const [activeProductId, setActiveProductId] = useState(initialProductId || null);
  const [productData, setProductData] = useState(null);
  const [productHistory, setProductHistory] = useState([]);
  const [totalProducts, setTotalProducts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch total registered products count on load
  useEffect(() => {
    fetchProductCount()
      .then((count) => setTotalProducts(count))
      .catch((err) => console.warn("Could not read product count:", err));
  }, []);

  const loadProductData = async (pId) => {
    if (!pId || Number(pId) <= 0) return;
    setErrorMsg("");
    setIsLoading(true);
    setProductData(null);
    setProductHistory([]);

    try {
      const [prod, history] = await Promise.all([
        fetchProduct(pId),
        fetchProductHistory(pId)
      ]);
      setProductData(prod);
      setProductHistory(history);
      setActiveProductId(pId);
    } catch (err) {
      console.error(err);
      setErrorMsg(parseBlockchainError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialProductId) {
      setProductIdInput(String(initialProductId));
      loadProductData(initialProductId);
    }
  }, [initialProductId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const id = productIdInput.trim();
    if (id) {
      loadProductData(id);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--navy-dark)" }}>
          Product Journey & Provenance Tracking
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Publicly verify authentic production data and historical custody transitions recorded on the immutable ledger.
        </p>
      </div>

      {/* Search Bar with Total Count Info */}
      <div className="card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--navy-dark)" }}>
            Search by Product ID
          </span>
          {totalProducts !== null && (
            <span
              style={{
                fontSize: "0.82rem",
                background: "var(--teal-light)",
                color: "var(--teal-dark)",
                padding: "3px 10px",
                borderRadius: "9999px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <Box size={13} />
              Total On-Chain Products: {totalProducts}
            </span>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "240px", position: "relative" }}>
            <input
              type="number"
              min="1"
              className="form-input"
              placeholder="Enter Product ID (e.g. 1)"
              value={productIdInput}
              onChange={(e) => setProductIdInput(e.target.value)}
              required
              style={{ fontSize: "1rem", padding: "12px 14px" }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-teal"
            disabled={isLoading}
            style={{ padding: "12px 24px", minWidth: "150px" }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="spin" /> Searching...
              </>
            ) : (
              <>
                <Search size={16} /> Track Product
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "10px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          💡 Public Read-Only Verification: Anyone can inspect this record without connecting a wallet or spending gas.
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="alert alert-danger">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Unable to Retrieve Product:</strong>
            <p style={{ fontSize: "0.85rem", marginTop: "2px" }}>
              {errorMsg.includes("Product does not exist")
                ? `No product found matching ID #${productIdInput}. Please confirm the ID or ensure a product has been registered first.`
                : errorMsg}
            </p>
          </div>
        </div>
      )}

      {/* Results View */}
      {productData && (
        <div>
          {/* Main Product Card */}
          <ProductCard
            product={productData}
            onTransfer={onTransferRequest}
            currentAccount={currentAccount}
          />

          {/* Movement History Timeline */}
          <div className="card" style={{ marginTop: "24px" }}>
            <div className="card-header">
              <div>
                <h3 className="card-title" style={{ fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Layers size={18} color="var(--teal-primary)" /> Complete Movement & Custody History
                </h3>
                <p className="card-subtitle">
                  Chronological, cryptographically signed ledger of each transit stop and handoff
                </p>
              </div>
            </div>

            <HistoryTimeline history={productHistory} />
          </div>
        </div>
      )}
    </div>
  );
}
