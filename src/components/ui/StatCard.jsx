// src/components/ui/StatCard.jsx
export default function StatCard({ label, value, sub, accent = "teal", icon: Icon }) {
  const accentClass = {
    teal:   "border-teal/20 hover:border-teal/40",
    lav:    "border-lav/20  hover:border-lav/40",
    red:    "border-red-500/20 hover:border-red-500/40",
    yellow: "border-yellow-500/20 hover:border-yellow-500/40",
  }[accent] || "border-teal/20";

  const valueClass = {
    teal:   "text-teal",
    lav:    "text-lav",
    red:    "text-red-400",
    yellow: "text-yellow-400",
  }[accent] || "text-teal";

  const iconClass = {
    teal:   "text-teal",
    lav:    "text-lav",
    red:    "text-red-400",
    yellow: "text-yellow-400",
  }[accent] || "text-teal";

  return (
    <div className={`card border ${accentClass} transition-colors flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="stat-label">{label}</span>
        {Icon && <Icon size={16} className={iconClass} strokeWidth={1.75} />}
      </div>
      <span className={`text-2xl font-bold font-mono ${valueClass}`}>{value}</span>
      {sub && <span className="text-xs text-muted">{sub}</span>}
    </div>
  );
}
