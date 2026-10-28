import React from "react";
import { formatTimestamp, shortenAddress } from "../blockchain/contract";
import StatusBadge from "./StatusBadge";
import { MapPin, ArrowRight, UserCheck, Clock, FileText } from "lucide-react";

export default function HistoryTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div className="alert alert-info">
        <span>No movement history recorded yet for this product.</span>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {history.map((step, index) => {
        const isDelivered = Number(step.status) === 2;
        const isFirst = index === 0;

        return (
          <div key={index} className={`timeline-step ${isDelivered ? "completed" : ""}`}>
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-header">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="timeline-title">
                    Step #{index + 1}: {isFirst ? "Origin (Manufacturing)" : isDelivered ? "Delivered" : "In Transit"}
                  </span>
                  <StatusBadge status={step.status} />
                </div>
                <span className="timeline-time" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={13} />
                  {formatTimestamp(step.timestamp)}
                </span>
              </div>

              <div style={{ marginTop: "10px" }}>
                <div className="timeline-row">
                  <span className="timeline-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={14} color="#0d9488" /> Location:
                  </span>
                  <strong style={{ color: "#0f172a" }}>{step.location || "N/A"}</strong>
                </div>

                <div className="timeline-row">
                  <span className="timeline-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <UserCheck size={14} /> Custody:
                  </span>
                  <span className="timeline-val">
                    {step.previousOwner === "0x0000000000000000000000000000000000000000"
                      ? "Origin"
                      : shortenAddress(step.previousOwner)}
                    {" "}
                    <ArrowRight size={13} style={{ verticalAlign: "middle", margin: "0 4px" }} />
                    {" "}
                    <strong>{shortenAddress(step.newOwner)}</strong>
                  </span>
                </div>

                {step.notes && (
                  <div className="timeline-row" style={{ marginTop: "6px" }}>
                    <span className="timeline-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <FileText size={14} /> Notes:
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "#475569" }}>{step.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
