import React from "react";
import { PRODUCT_STATUS } from "../blockchain/config";
import { CheckCircle2, Truck, Box } from "lucide-react";

export default function StatusBadge({ status }) {
  const statusNum = Number(status);
  const label = PRODUCT_STATUS[statusNum] || "Unknown";

  let statusClass = "status-created";
  let Icon = Box;

  if (statusNum === 1) {
    statusClass = "status-intransit";
    Icon = Truck;
  } else if (statusNum === 2) {
    statusClass = "status-delivered";
    Icon = CheckCircle2;
  }

  return (
    <span className={`status-badge ${statusClass}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}
