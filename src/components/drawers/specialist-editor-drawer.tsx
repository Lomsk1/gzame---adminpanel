import { useState, useRef, useEffect, useMemo } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import type { Specialist, SpecialistCategory } from "../../types/specialist/specialist";
import {
  AvatarUploadField,
  ChipToggleGroup,
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  FormSection,
  KYC_OPTIONS,
  LANGUAGE_OPTIONS,
  LIFE_SPHERES,
} from "../specialists";

function categoryIds(spec: Specialist): string[] {
  return (spec.categories || []).map((c) => (typeof c === "string" ? c : c._id));
}

export type SpecialistFormData = {
  avatarFile?: File | null;
  avatar?: string;
  name: string;
  bio: string;
  categoryIds: string[];
  link: string;
  booking: string;
  order: number;
  tags: string[];
  specialty: string;
  isActive: boolean;
  portalEmail?: string;
  suggestedSpheres?: string[];
  serviceTitle?: string;
  serviceDuration?: number;
  servicePrice?: number | string;
  serviceCurrency?: string;
  kycStatus?: Specialist["kyc_status"];
  monthlyClientLimit?: number;
  countries?: string[];
  languages?: string[];
};

type EditorTab = "profile" | "reach" | "links" | "portal";

interface Props {
  specialist: Specialist | null;
  categories: SpecialistCategory[];
  onClose: () => void;
  onSave: (data: SpecialistFormData) => void;
  isSubmitting?: boolean;
}

const TAB_LABELS: { id: EditorTab; label: string; short: string }[] = [
  { id: "profile", label: "Profile", short: "Profile" },
  { id: "reach", label: "Reach", short: "Reach" },
  { id: "links", label: "Links", short: "Links" },
  { id: "portal", label: "Portal", short: "Portal" },
];

const inputLabelClass = "text-[11px] font-black text-admin-text-dim uppercase tracking-widest block mb-1.5";
const inputFieldClass =
  "w-full rounded-xl border border-admin-border bg-admin-panel/40 p-3 text-sm text-admin-text outline-none transition-colors focus:border-admin-primary no-spinner";

export const SpecialistEditorDrawer = ({
  specialist,
  categories,
  onClose,
  onSave,
  isSubmitting,
}: Props) => {
  const [activeTab, setActiveTab] = useState<EditorTab>("profile");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(specialist?.avatar ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(specialist?.name ?? "");
  const [bio, setBio] = useState(specialist?.bio ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>(specialist ? categoryIds(specialist) : []);
  const [link, setLink] = useState(specialist?.link ?? "");
  const [booking, setBooking] = useState(specialist?.booking ?? "");
  const [order, setOrder] = useState(specialist?.order ?? 0);
  const [tagsText, setTagsText] = useState(
    Array.isArray(specialist?.tags) ? specialist.tags.join(", ") : "",
  );
  const [specialty, setSpecialty] = useState(specialist?.specialty ?? "");
  const [isActive, setIsActive] = useState(specialist?.isActive !== false);
  const [portalEmail, setPortalEmail] = useState(specialist?.portal_user_email ?? "");
  const [kycStatus, setKycStatus] = useState<Specialist["kyc_status"]>(
    specialist?.kyc_status ?? "none",
  );
  const [suggestedSpheres, setSuggestedSpheres] = useState<string[]>(
    specialist?.suggested_spheres ?? [],
  );
  const existingService = specialist?.services?.[0];
  const [serviceTitle, setServiceTitle] = useState(existingService?.title ?? "");
  const [serviceDuration, setServiceDuration] = useState(existingService?.duration_minutes ?? 60);
  const [servicePrice, setServicePrice] = useState<number | string>(
    existingService?.price_cents != null ? existingService.price_cents / 100 : "",
  );
  const [serviceCurrency, setServiceCurrency] = useState(
    existingService?.currency?.toLowerCase() ?? "eur",
  );
  const [monthlyClientLimit, setMonthlyClientLimit] = useState(
    specialist?.monthly_client_limit ?? 10,
  );
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    specialist?.countries ?? [],
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    specialist?.languages ?? [],
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        value: cat._id,
        label: cat.title?.en || cat.title?.ka || cat._id,
        hint: cat.title?.ka,
      })),
    [categories],
  );

  const countryOptions = useMemo(
    () =>
      COUNTRY_OPTIONS.map((c) => ({
        value: c.code,
        label: `${c.name}`,
        hint: c.code,
      })),
    [],
  );

  const languageOptions = useMemo(
    () =>
      LANGUAGE_OPTIONS.map((l) => ({
        value: l.code,
        label: l.label,
        hint: l.short,
      })),
    [],
  );

  const sphereOptions = useMemo(
    () => LIFE_SPHERES.map((s) => ({ value: s.id, label: s.label })),
    [],
  );

  useEffect(() => {
    return () => {
      if (avatarFile && avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarFile, avatarPreviewUrl]);

  const onAvatarFileChange = (file: File) => {
    if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearAvatar = () => {
    if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarFile(null);
    setAvatarPreviewUrl(specialist?.avatar ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({
      avatarFile: avatarFile ?? undefined,
      avatar: !avatarFile && specialist?.avatar ? specialist.avatar : undefined,
      name: name.trim(),
      bio: bio.trim(),
      categoryIds: selectedIds,
      link: link.trim(),
      booking: booking.trim(),
      order: Number(order) || 0,
      tags,
      specialty: specialty.trim(),
      isActive,
      portalEmail: portalEmail.trim() || undefined,
      suggestedSpheres,
      serviceTitle,
      serviceDuration,
      servicePrice,
      serviceCurrency,
      kycStatus,
      monthlyClientLimit,
      countries: selectedCountries,
      languages: selectedLanguages,
    });
  };

  const footer = (
    <button
      type="button"
      disabled={isSubmitting || !name.trim()}
      onClick={handleSave}
      className="w-full rounded-xl bg-admin-primary py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSubmitting ? "Saving…" : specialist ? "Save changes" : "Create specialist"}
    </button>
  );

  return (
    <AdminDrawerShell
      isOpen
      title={specialist ? "Edit specialist" : "New specialist"}
      subtitle={specialist ? specialist.name : "Directory entry"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      footer={footer}
      panelClassName="max-w-2xl sm:max-w-xl md:max-w-2xl"
    >
      <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar sm:flex-wrap sm:overflow-visible">
        {TAB_LABELS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors sm:px-4 ${
              activeTab === tab.id
                ? "border-admin-primary bg-admin-primary text-white shadow-sm"
                : "border-admin-border bg-admin-bg/40 text-admin-text-dim hover:border-admin-primary/30 hover:text-admin-text"
            }`}
          >
            {tab.short}
          </button>
        ))}
      </div>

      {activeTab === "profile" ? (
        <div className="space-y-4">
          <FormSection
            title="Identity"
            description="Photo, name, and public profile copy shown in the app."
            icon="👤"
          >
            <AvatarUploadField
              previewUrl={avatarPreviewUrl}
              onFileChange={onAvatarFileChange}
              onClear={clearAvatar}
            />
            <AdminInput
              label="Full name"
              value={name}
              onChange={(v) => setName(String(v ?? ""))}
              placeholder="Dr. Jane Smith"
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />
            <AdminInput
              label="Specialty"
              value={specialty}
              onChange={(v) => setSpecialty(String(v ?? ""))}
              placeholder="Life coach, therapist…"
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />
            <div>
              <label className={inputLabelClass}>Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short professional bio for the specialist card…"
                className={`${inputFieldClass} min-h-[110px] resize-y`}
                rows={4}
              />
            </div>
            <div>
              <label className={inputLabelClass}>Tags</label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="anxiety, career, couples"
                className={inputFieldClass}
              />
              <p className="mt-1 text-[11px] text-admin-text-muted">Comma-separated keywords for search.</p>
            </div>
          </FormSection>

          <FormSection
            title="Visibility"
            description="Control listing order and whether this specialist appears in the app."
            icon="◎"
            defaultOpen
          >
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? "border-admin-success/40 bg-admin-success/10 text-admin-success"
                    : "border-admin-error/40 bg-admin-error/10 text-admin-error"
                }`}
              >
                {isActive ? "● Listed in app" : "○ Hidden from app"}
              </button>
            </div>
            <AdminInput
              label="Promotion order"
              type="number"
              value={order}
              onChange={(v) => setOrder(v === "" ? 0 : Number(v))}
              placeholder="0 = highest priority"
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />
            <div>
              <label className={inputLabelClass}>Categories</label>
              {categories.length === 0 ? (
                <p className="text-sm italic text-admin-text-dim">Create a category first.</p>
              ) : (
                <ChipToggleGroup
                  options={categoryOptions}
                  selected={selectedIds}
                  onChange={setSelectedIds}
                  columns={1}
                />
              )}
            </div>
          </FormSection>
        </div>
      ) : null}

      {activeTab === "reach" ? (
        <div className="space-y-4">
          <FormSection
            title="Countries"
            description="Where this specialist offers services. Users can filter by country in the app."
            icon="🌍"
          >
            <ChipToggleGroup
              options={countryOptions}
              selected={selectedCountries}
              onChange={setSelectedCountries}
              searchable
              searchPlaceholder="Search country or code…"
              emptyLabel="No countries match your search."
            />
          </FormSection>

          <FormSection
            title="Languages"
            description="Languages the specialist can conduct sessions in."
            icon="🗣"
          >
            <ChipToggleGroup
              options={languageOptions}
              selected={selectedLanguages}
              onChange={setSelectedLanguages}
              columns={1}
            />
          </FormSection>
        </div>
      ) : null}

      {activeTab === "links" ? (
        <div className="space-y-4">
          <FormSection
            title="External links"
            description="Portfolio and booking URLs opened from the mobile app."
            icon="🔗"
          >
            <AdminInput
              label="Portfolio / website"
              value={link}
              onChange={(v) => setLink(String(v ?? ""))}
              placeholder="https://…"
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />
            <AdminInput
              label="Booking link"
              value={booking}
              onChange={(v) => setBooking(String(v ?? ""))}
              placeholder="https://wa.me/… or Calendly"
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />
          </FormSection>
        </div>
      ) : null}

      {activeTab === "portal" ? (
        <div className="space-y-4">
          <FormSection
            title="Specialist portal"
            description="Mobile app access for Life Map, client messaging, and specialist dashboard."
            icon="📱"
          >
            {specialist?.portal_enabled ? (
              <div className="rounded-xl border border-admin-success/30 bg-admin-success/10 px-4 py-3 text-sm text-admin-success">
                Portal enabled — linked user can open <code className="font-mono">/specialist</code> in the app.
              </div>
            ) : (
              <div className="rounded-xl border border-admin-border bg-admin-bg/40 px-4 py-3 text-sm text-admin-text-dim">
                Enter an existing GzaMe user email below to grant portal access on save.
              </div>
            )}
            {specialist?.invite_code ? (
              <p className="text-sm text-admin-text">
                Invite code:{" "}
                <code className="rounded bg-admin-bg px-2 py-0.5 font-mono text-admin-primary">
                  {specialist.invite_code}
                </code>
              </p>
            ) : null}

            <div>
              <label className={inputLabelClass}>KYC status</label>
              <select
                value={kycStatus ?? "none"}
                onChange={(e) => setKycStatus(e.target.value as Specialist["kyc_status"])}
                className={inputFieldClass}
              >
                {KYC_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <AdminInput
              label="Portal user email"
              value={portalEmail}
              onChange={(v) => setPortalEmail(String(v ?? ""))}
              placeholder="specialist@email.com"
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />

            <AdminInput
              label="Monthly client limit"
              type="number"
              value={monthlyClientLimit}
              onChange={(v) => setMonthlyClientLimit(Math.max(1, Number(v) || 1))}
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />

            <div>
              <label className={inputLabelClass}>Suggested Life Map spheres</label>
              <ChipToggleGroup
                options={sphereOptions}
                selected={suggestedSpheres}
                onChange={setSuggestedSpheres}
                columns={1}
              />
            </div>
          </FormSection>

          <FormSection
            title="Default service"
            description="Optional — configure a service title, duration, and price for booking and portal."
            icon="💶"
            defaultOpen
          >
            <AdminInput
              label="Service title (optional)"
              value={serviceTitle}
              onChange={(v) => setServiceTitle(String(v ?? ""))}
              placeholder="e.g. 60 min consultation"
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />
            <AdminInput
              label="Duration (minutes)"
              type="number"
              value={serviceDuration}
              onChange={(v) => setServiceDuration(v === "" ? 60 : Number(v))}
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />
            <div>
              <label className={inputLabelClass}>Price (optional)</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_9rem]">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={servicePrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setServicePrice(val === "" ? "" : Number(val));
                  }}
                  placeholder="80.00"
                  className={inputFieldClass}
                />
                <select
                  value={serviceCurrency}
                  onChange={(e) => setServiceCurrency(e.target.value)}
                  className={inputFieldClass}
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1.5 text-[11px] text-admin-text-muted">
                Enter the full amount (e.g. 80 for €80). Leave blank if no fixed price.
              </p>
            </div>
          </FormSection>
        </div>
      ) : null}
    </AdminDrawerShell>
  );
};
