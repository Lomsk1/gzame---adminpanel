import type { Specialist, SpecialistCategory } from "../../types/specialist/specialist";
import { AdminConfirmWrapper } from "../wrapper/wrapper";
import { countryToFlag, DEFAULT_AVATAR, getCountryName } from "./constants";
import { SpecialistStatusBadge } from "./specialist-status-badge";

function categoryTitle(c: SpecialistCategory | string): string {
  if (typeof c === "string") return c;
  return c.title?.en || c._id;
}

interface Props {
  specialist: Specialist;
  onInspect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SpecialistTableRow({ specialist, onInspect, onEdit, onDelete }: Props) {
  const countries = (specialist.countries ?? []).slice(0, 3);
  const categories = Array.isArray(specialist.categories) ? specialist.categories : [];

  return (
    <tr
      className="group cursor-pointer border-b border-admin-border/20 transition-colors hover:bg-admin-primary/5"
      onClick={onInspect}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <img
            src={specialist.avatar || DEFAULT_AVATAR}
            alt=""
            className="h-11 w-11 rounded-xl border border-admin-border object-cover"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
          />
          <div className="min-w-0">
            <p className="truncate font-bold text-admin-text">{specialist.name}</p>
            <p className="truncate text-xs text-admin-text-dim">{specialist.specialty || "—"}</p>
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-4 md:table-cell">
        <div className="flex flex-wrap gap-1">
          {categories.slice(0, 2).map((c) => (
            <span key={typeof c === "string" ? c : c._id} className="text-[11px] font-medium text-admin-primary">
              {categoryTitle(c)}
            </span>
          ))}
        </div>
      </td>
      <td className="hidden px-4 py-4 lg:table-cell">
        <p className="line-clamp-2 text-xs text-admin-text-dim">{specialist.bio || "—"}</p>
      </td>
      <td className="hidden px-4 py-4 sm:table-cell">
        <p className="text-xs text-admin-text">
          {countries.length
            ? countries.map((c) => countryToFlag(c)).join(" ")
            : "—"}
        </p>
        <p className="mt-0.5 text-[11px] text-admin-text-muted">
          {countries.map((c) => getCountryName(c)).join(", ") || "No countries"}
        </p>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1">
          {specialist.isActive === false ? (
            <SpecialistStatusBadge variant="inactive">Off</SpecialistStatusBadge>
          ) : (
            <SpecialistStatusBadge variant="active">On</SpecialistStatusBadge>
          )}
          {specialist.portal_enabled ? (
            <SpecialistStatusBadge variant="portal">Portal</SpecialistStatusBadge>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex justify-end gap-2 opacity-90 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-[11px] font-semibold text-admin-primary hover:underline"
          >
            Edit
          </button>
          <AdminConfirmWrapper
            title="Delete specialist?"
            description="This will permanently remove this specialist from the directory."
            onConfirm={onDelete}
            variant="danger"
            className="inline-block w-auto h-auto"
          >
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="text-[11px] font-semibold text-admin-error hover:underline"
            >
              Delete
            </button>
          </AdminConfirmWrapper>
        </div>
      </td>
    </tr>
  );
}
