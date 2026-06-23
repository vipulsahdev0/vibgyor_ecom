import React from "react";
import { CheckCircle } from "lucide-react";

const STEPS = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export default function OrderTimeline({
  status,
}) {
  const current =
    STEPS.indexOf(status);

  return (
    <div className="flex flex-wrap gap-4">
      {STEPS.map((step, index) => {
        const completed =
          index <= current;

        return (
          <div
            key={step}
            className="flex items-center gap-2"
          >
            <CheckCircle
              className={`h-5 w-5 ${
                completed
                  ? "text-emerald-600"
                  : "text-slate-300"
              }`}
            />

            <span
              className={`text-xs ${
                completed
                  ? "font-semibold text-slate-900"
                  : "text-slate-400"
              }`}
            >
              {step.replaceAll("_", " ")}
            </span>
          </div>
        );
      })}
    </div>
  );
}