import React from "react";

function Button({
  children,
  onClick,
  type,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type={type ? type : "button"}
      className="h-12 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900  focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-500"
    >
      {children}
    </button>
  );
}

export default Button;
