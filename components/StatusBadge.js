"use client";

function isOverdue(booking) {
  const today = new Date().toISOString().slice(0, 10);
  return booking.status === "Active" && booking.endDate < today;
}

export default function StatusBadge({ booking }) {
  if (isOverdue(booking)) {
    return <span className="badge badge-overdue">⚠️ Overdue</span>;
  }
  const map = {
    Pending: "badge-pending",
    Approved: "badge-approved",
    Active: "badge-active",
    Returned: "badge-returned",
    Rejected: "badge-rejected",
  };
  const icons = {
    Pending: "⏳",
    Approved: "✅",
    Active: "🚀",
    Returned: "📦",
    Rejected: "✖️",
  };
  return (
    <span className={`badge ${map[booking.status] || "badge-pending"}`}>
      {icons[booking.status]} {booking.status}
    </span>
  );
}

export { isOverdue };
