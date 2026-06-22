const SIZE_MAP = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-20 w-20 text-xl",
};

export default function Avatar({ initials, size = "md", gradient, className = "" }) {
  const sizeClass = SIZE_MAP[size] ?? SIZE_MAP.md;
  const colorClass = gradient
    ? `bg-gradient-to-br ${gradient}`
    : "bg-indigo-100 text-indigo-700";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white
        ${sizeClass} ${colorClass} ${className}`}
    >
      {initials}
    </div>
  );
}
