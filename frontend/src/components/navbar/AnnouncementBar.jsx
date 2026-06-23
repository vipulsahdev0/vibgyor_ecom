import { Truck, ShieldCheck, BadgePercent } from "lucide-react";

const ITEMS = [
  { icon: Truck, label: "Free shipping above ₹999" },
  { icon: ShieldCheck, label: "Secure payments" },
  { icon: BadgePercent, label: "Fresh deals every week" },
];

export default function AnnouncementBar() {
  return (
    <div className="hidden border-b border-slate-200 bg-slate-950 text-white md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-6 py-2.5 text-xs font-medium text-white/85">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={14} className="text-indigo-300" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}