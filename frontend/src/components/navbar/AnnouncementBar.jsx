import { Truck, ShieldCheck, BadgePercent } from "lucide-react";

export default function AnnouncementBar() {
  return (
    <div className="hidden md:block border-b border-violet-100 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-6 py-2 text-xs font-medium">
        <div className="flex items-center gap-2">
          <Truck size={14} />
          Free Shipping Above ₹999
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck size={14} />
          Secure Payments
        </div>

        <div className="flex items-center gap-2">
          <BadgePercent size={14} />
          New Deals Every Week
        </div>
      </div>
    </div>
  );
}