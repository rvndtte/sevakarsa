import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface EmptyStateProps {
  icon: string;
  children: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ icon, children, action }: EmptyStateProps) {
  return (
    <div className="px-5 py-9 text-center text-muted">
      <Icon name={icon} className="mb-2 block text-[34px] text-[#b9c4bc]" />
      <div>{children}</div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
