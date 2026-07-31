import type { ReactNode, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { AdminEmptyState } from "./admin-empty-state";

type AdminTableProps = {
  children: ReactNode;
  className?: string;
};

export function AdminTable({ children, className = "" }: AdminTableProps) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-admin-border bg-admin-card ${className}`}>
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-admin-panel/95 backdrop-blur-md border-b border-admin-border">
      {children}
    </thead>
  );
}

export function AdminTh({ children, className = "", ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...rest}
      className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-admin-text-muted whitespace-nowrap ${className}`}
    >
      {children}
    </th>
  );
}

export function AdminTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-admin-border/60">{children}</tbody>;
}

export function AdminTr({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr {...rest} className={`hover:bg-admin-primary/5 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function AdminTd({ children, className = "", ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td {...rest} className={`px-4 py-3 text-admin-text align-middle ${className}`}>
      {children}
    </td>
  );
}

export function AdminTableEmpty({
  colSpan,
  message,
  icon,
}: {
  colSpan: number;
  message: string;
  icon?: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <AdminEmptyState icon={icon} message={message} />
      </td>
    </tr>
  );
}
