import React from "react";

export interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  src?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = "md",
  src,
  className = "",
}) => {
  const getInitials = (str: string) => {
    if (!str) return "S";
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const colors = [
    "bg-indigo-100 text-indigo-700 border-indigo-200",
    "bg-sky-100 text-sky-700 border-sky-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200",
    "bg-violet-100 text-violet-700 border-violet-200",
    "bg-amber-100 text-amber-700 border-amber-200",
  ];

  // Deterministic color selection based on name
  const charCodeSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorStyle = colors[charCodeSum % colors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border ${sizeStyles[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold border shrink-0 ${sizeStyles[size]} ${colorStyle} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
