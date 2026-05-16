export const categories = ["tailor", "cobbler", "potter", "artisan", "vendor"];

export const statusBadgeClass = (status = "") => {
  const normalized = status.toLowerCase();

  if (normalized === "pending") return "badge badgeWarning";
  if (normalized === "accepted") return "badge badgeSuccess";
  if (normalized === "rejected") return "badge badgeDanger";
  if (normalized === "completed") return "badge badgeInfo";
  if (normalized === "cancelled") return "badge badgeNeutral";

  return "badge";
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) return "Flexible";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const titleCase = (value = "") =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
