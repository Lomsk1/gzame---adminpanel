import type { Specialist, SpecialistCategory } from "../../types/specialist/specialist";
import { AdminConfirmWrapper } from "../wrapper/wrapper";
import {
  countryToFlag,
  DEFAULT_AVATAR,
  formatServicePrice,
  getCountryName,
  LANGUAGE_OPTIONS,
} from "./constants";
import { SpecialistStatusBadge } from "./specialist-status-badge";

function categoryTitle(c: SpecialistCategory | string): string {
  if (typeof c === "string") return c;
  return c.title?.en || c.title?.ka || c._id;
}

interface Props {
  specialist: Specialist;
  onEdit: () => void;
  onDelete: () => void;
}

export function SpecialistCard({ specialist, onEdit, onDelete }: Props) {
  const inactive = specialist.isActive === false;
  const tags = Array.isArray(specialist.tags) ? specialist.tags : [];
  const categories = Array.isArray(specialist.categories) ? specialist.categories : [];
  const countries = specialist.countries ?? [];
  const languages = specialist.languages ?? [];
  const service = specialist.services?.[0];
  const kyc = specialist.kyc_status ?? "none";
  const servicePriceLabel = service ? formatServicePrice(service) : "";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-admin-panel/50 transition-all duration-200 hover:border-admin-primary/40 hover:shadow-lg ${
        inactive ? "border-admin-border/40 opacity-80" : "border-admin-border/60"
      }`}
    >
      <button
        type="button"
        onClick={onEdit}
        className="block w-full p-4 text-left sm:p-5"
      >
        <div className="flex gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <img
              src={specialist.avatar || DEFAULT_AVATAR}
              alt=""
              className="h-16 w-16 rounded-xl border border-admin-border object-cover sm:h-[72px] sm:w-[72px] sm:rounded-2xl"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
            {(specialist.order ?? 0) > 0 ? (
              <span className="absolute -left-1.5 -top-1.5 rounded-md border border-admin-border bg-admin-bg px-1.5 py-0.5 text-[10px] font-mono font-bold text-admin-text-dim">
                #{specialist.order}
              </span>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-base font-bold text-admin-text sm:text-lg">{specialist.name || "—"}</h3>
              {inactive ? (
                <SpecialistStatusBadge variant="inactive">Inactive</SpecialistStatusBadge>
              ) : (
                <SpecialistStatusBadge variant="active">Active</SpecialistStatusBadge>
              )}
              {specialist.portal_enabled ? (
                <SpecialistStatusBadge variant="portal">Portal</SpecialistStatusBadge>
              ) : null}
              {kyc !== "none" ? (
                <SpecialistStatusBadge variant={`kyc-${kyc}` as "kyc-pending"}>
                  KYC {kyc}
                </SpecialistStatusBadge>
              ) : null}
            </div>

            {specialist.specialty ? (
              <p className="mt-0.5 text-sm font-medium text-admin-primary">{specialist.specialty}</p>
            ) : null}

            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-admin-text-dim">
              {specialist.bio || "No bio yet."}
            </p>
          </div>
        </div>

        {(categories.length > 0 || tags.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {categories.slice(0, 3).map((c) => (
              <span
                key={typeof c === "string" ? c : c._id}
                className="rounded-md border border-admin-primary/20 bg-admin-primary/10 px-2 py-0.5 text-[10px] font-semibold text-admin-primary"
              >
                {categoryTitle(c)}
              </span>
            ))}
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-admin-border bg-admin-bg/60 px-2 py-0.5 text-[10px] text-admin-text-dim"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:gap-3">
          <div className="rounded-lg border border-admin-border/50 bg-admin-bg/30 p-2.5 sm:rounded-xl sm:p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-admin-text-muted">Countries</p>
            <p className="mt-1 font-medium text-admin-text">
              {countries.length
                ? countries.slice(0, 3).map((c) => `${countryToFlag(c)} ${getCountryName(c)}`).join(" · ")
                : "Not set"}
              {countries.length > 3 ? ` +${countries.length - 3}` : ""}
            </p>
          </div>
          <div className="rounded-lg border border-admin-border/50 bg-admin-bg/30 p-2.5 sm:rounded-xl sm:p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-admin-text-muted">Languages</p>
            <p className="mt-1 font-medium text-admin-text">
              {languages.length
                ? languages
                    .map((l) => LANGUAGE_OPTIONS.find((o) => o.code === l)?.short ?? l.toUpperCase())
                    .join(" · ")
                : "Not set"}
            </p>
          </div>
        </div>

        {(service || specialist.invite_code) && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-admin-text-dim">
            {service ? (
              <span>
                {service.title} · {service.duration_minutes}m
                {servicePriceLabel ? ` · ${servicePriceLabel}` : ""}
              </span>
            ) : null}
            {specialist.invite_code ? (
              <span className="font-mono text-admin-primary">Invite: {specialist.invite_code}</span>
            ) : null}
          </div>
        )}
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-admin-border/40 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap gap-3">
          {specialist.link ? (
            <a
              href={specialist.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold text-admin-primary hover:underline"
            >
              Portfolio ↗
            </a>
          ) : null}
          {specialist.booking ? (
            <a
              href={specialist.booking}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold text-admin-accent hover:underline"
            >
              Booking ↗
            </a>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border border-admin-primary/30 bg-admin-primary/10 px-3 py-1.5 text-xs font-semibold text-admin-primary transition-colors hover:bg-admin-primary/20"
          >
            Edit
          </button>
          <AdminConfirmWrapper
            title="Delete specialist?"
            description="This will permanently remove this specialist from the directory."
            onConfirm={onDelete}
            variant="danger"
          >
            <button
              type="button"
              className="rounded-lg border border-admin-error/30 bg-admin-error/10 px-3 py-1.5 text-xs font-semibold text-admin-error transition-colors hover:bg-admin-error/20"
            >
              Delete
            </button>
          </AdminConfirmWrapper>
        </div>
      </div>
    </article>
  );
}
