type Variant = "active" | "inactive" | "portal" | "kyc-none" | "kyc-pending" | "kyc-verified" | "kyc-rejected" | "order";

const styles: Record<Variant, string> = {
  active: "bg-admin-success/15 text-admin-success border-admin-success/35",
  inactive: "bg-admin-error/15 text-admin-error border-admin-error/35",
  portal: "bg-admin-accent/15 text-admin-accent border-admin-accent/35",
  "kyc-none": "bg-admin-text-muted/10 text-admin-text-dim border-admin-border",
  "kyc-pending": "bg-admin-warning/15 text-admin-warning border-admin-warning/35",
  "kyc-verified": "bg-admin-success/15 text-admin-success border-admin-success/35",
  "kyc-rejected": "bg-admin-error/15 text-admin-error border-admin-error/35",
  order: "bg-admin-bg text-admin-text-dim border-admin-border font-mono",
};

interface Props {
  variant: Variant;
  children: React.ReactNode;
}

export function SpecialistStatusBadge({ variant, children }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
