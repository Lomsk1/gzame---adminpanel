import type { Specialist, SpecialistCategory } from "../../types/specialist/specialist";
import { AdminConfirmWrapper } from "../wrapper/wrapper";
import { countryToFlag, DEFAULT_AVATAR, formatServicePrice, getCountryName } from "./constants";
import { SpecialistStatusBadge } from "./specialist-status-badge";

function categoryTitle(c: SpecialistCategory | string): string {
  if (typeof c === "string") return c;
  return c.title?.en || c._id;
}

interface Props {
  specialist: Specialist;
  onEdit: () => void;
  onDelete: () => void;
}

export function SpecialistListItem({ specialist, onEdit, onDelete }: Props) {
  const inactive = specialist.isActive === false;
  const categories = Array.isArray(specialist.categories) ? specialist.categories : [];
  const countries = specialist.countries ?? [];
  const service = specialist.services?.[0];

  return (
    <div
      className={`group flex flex-col gap-3 rounded-2xl border bg-admin-panel/40 p-4 transition-all hover:border-admin-primary/35 hover:bg-admin-primary/5 sm:flex-row sm:items-center sm:gap-4 ${
        inactive ? "border-admin-border/40 opacity-80" : "border-admin-border/50"
      }`}
    >
      <button
        type="button"
        onClick={onEdit}
        className="flex min-w-0 flex-1 items-start gap-3 text-left sm:items-center"
      >
        <img
          src={specialist.avatar || DEFAULT_AVATAR}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl border border-admin-border object-cover sm:h-11 sm:w-11"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-bold text-admin-text sm:text-base">
              {specialist.name || "—"}
            </p>
            {inactive ? (
              <SpecialistStatusBadge variant="inactive">Inactive</SpecialistStatusBadge>
            ) : (
              <SpecialistStatusBadge variant="active">Active</SpecialistStatusBadge>
            )}
            {specialist.portal_enabled ? (
              <SpecialistStatusBadge variant="portal">Portal</SpecialistStatusBadge>
            ) : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-admin-primary">{specialist.specialty || "No specialty"}</p>
          <p className="mt-1 line-clamp-1 text-xs text-admin-text-dim sm:line-clamp-none sm:max-w-md">
            {specialist.bio || "No bio"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-admin-text-muted">
            {categories.slice(0, 2).map((c) => (
              <span key={typeof c === "string" ? c : c._id} className="text-admin-primary">
                {categoryTitle(c)}
              </span>
            ))}
            {countries.length > 0 ? (
              <span title={countries.map((c) => getCountryName(c)).join(", ")}>
                {countries.slice(0, 4).map((c) => countryToFlag(c)).join(" ")}
              </span>
            ) : (
              <span>No countries</span>
            )}
            {service && formatServicePrice(service) ? (
              <span className="hidden md:inline">· {formatServicePrice(service)}</span>
            ) : null}
          </div>
        </div>
      </button>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-admin-border/30 pt-3 sm:border-t-0 sm:pt-0">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-admin-primary/30 bg-admin-primary/10 px-3 py-2 text-xs font-semibold text-admin-primary transition-colors hover:bg-admin-primary/20"
        >
          Edit
        </button>
        <AdminConfirmWrapper
          title="Delete specialist?"
          description="This will permanently remove this specialist from the directory."
          onConfirm={onDelete}
          variant="danger"
          className="inline-block h-auto w-auto"
        >
          <button
            type="button"
            className="rounded-lg border border-admin-error/30 bg-admin-error/10 px-3 py-2 text-xs font-semibold text-admin-error transition-colors hover:bg-admin-error/20"
          >
            Delete
          </button>
        </AdminConfirmWrapper>
      </div>
    </div>
  );
}
