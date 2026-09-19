import { useId, useState, type ReactNode } from "react";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="tooltip-wrap"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span tabIndex={0} aria-describedby={visible ? id : undefined} className="tooltip-trigger">
        {children}
      </span>
      {visible && (
        <span role="tooltip" id={id} className="tooltip-bubble">
          {label}
        </span>
      )}
    </span>
  );
}
