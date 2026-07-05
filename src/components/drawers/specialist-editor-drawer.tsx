import { useState, useRef, useEffect, useMemo } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import { useAdminT } from "../../store/locale/locale";
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
  TRUST_TIER_OPTIONS,
  type TrustTierValue,
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
  isAmbassador?: boolean;
  ambassadorCountryCode?: string;
  referredBySpecialistId?: string;
  applyReferralCode?: string;
  regenerateAmbassadorCode?: boolean;
  trustTier?: Specialist["trust_tier"];
  legalName?: string;
  entityType?: string;
  taxId?: string;
  taxCountry?: string;
  addressLine1?: string;
  addressCity?: string;
  addressPostalCode?: string;
  addressCountry?: string;
};

type EditorTab = "profile" | "reach" | "links" | "portal";

interface Props {
  specialist: Specialist | null;
  categories: SpecialistCategory[];
  allSpecialists?: Specialist[];
  onClose: () => void;
  onSave: (data: SpecialistFormData) => void;
  isSubmitting?: boolean;
}

const EDITOR_TABS: EditorTab[] = ["profile", "reach", "links", "portal"];

const inputLabelClass = "text-[11px] font-black text-admin-text-dim uppercase tracking-widest block mb-1.5";
const inputFieldClass =
  "w-full rounded-xl border border-admin-border bg-admin-panel/40 p-3 text-sm text-admin-text outline-none transition-colors focus:border-admin-primary no-spinner";

export const SpecialistEditorDrawer = ({
  specialist,
  categories,
  allSpecialists = [],
  onClose,
  onSave,
  isSubmitting,
}: Props) => {
  const { t } = useAdminT();
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
  const [trustTier, setTrustTier] = useState<TrustTierValue>(
    (specialist?.trust_tier as TrustTierValue) ?? "T0",
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
  const [isAmbassador, setIsAmbassador] = useState(specialist?.is_ambassador ?? false);
  const [ambassadorCountryCode, setAmbassadorCountryCode] = useState(
    specialist?.ambassador_country_code ?? "",
  );
  const [referredBySpecialistId, setReferredBySpecialistId] = useState(
    specialist?.referred_by_specialist_id ?? "",
  );
  const [applyReferralCode, setApplyReferralCode] = useState("");
  const [regenerateAmbassadorCode, setRegenerateAmbassadorCode] = useState(false);
  const [legalName, setLegalName] = useState((specialist as { legal_name?: string })?.legal_name ?? "");
  const [entityType, setEntityType] = useState((specialist as { entity_type?: string })?.entity_type ?? "");
  const [taxId, setTaxId] = useState((specialist as { tax_id?: string })?.tax_id ?? "");
  const [taxCountry, setTaxCountry] = useState((specialist as { tax_country?: string })?.tax_country ?? "");
  const [addressLine1, setAddressLine1] = useState((specialist as { address_line1?: string })?.address_line1 ?? "");
  const [addressCity, setAddressCity] = useState((specialist as { address_city?: string })?.address_city ?? "");
  const [addressPostalCode, setAddressPostalCode] = useState(
    (specialist as { address_postal_code?: string })?.address_postal_code ?? "",
  );
  const [addressCountry, setAddressCountry] = useState(
    (specialist as { address_country?: string })?.address_country ?? "",
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
      trustTier,
      monthlyClientLimit,
      countries: selectedCountries,
      languages: selectedLanguages,
      isAmbassador,
      ambassadorCountryCode: ambassadorCountryCode.trim() || undefined,
      referredBySpecialistId: referredBySpecialistId || undefined,
      applyReferralCode: applyReferralCode.trim() || undefined,
      regenerateAmbassadorCode: regenerateAmbassadorCode || undefined,
      legalName: legalName.trim() || undefined,
      entityType: entityType.trim() || undefined,
      taxId: taxId.trim() || undefined,
      taxCountry: taxCountry.trim() || undefined,
      addressLine1: addressLine1.trim() || undefined,
      addressCity: addressCity.trim() || undefined,
      addressPostalCode: addressPostalCode.trim() || undefined,
      addressCountry: addressCountry.trim() || undefined,
    });
  };

  const footer = (
    <button
      type="button"
      disabled={isSubmitting || !name.trim()}
      onClick={handleSave}
      className="w-full rounded-xl bg-admin-primary py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isSubmitting
        ? t("drawer.saving")
        : specialist
          ? t("specialists.editor.saveChanges")
          : t("specialists.editor.create")}
    </button>
  );

  return (
    <AdminDrawerShell
      isOpen
      title={specialist ? t("specialists.editor.editTitle") : t("specialists.editor.newTitle")}
      subtitle={specialist ? specialist.name : t("specialists.editor.directoryEntry")}
      onClose={onClose}
      isSubmitting={isSubmitting}
      footer={footer}
      panelClassName="max-w-2xl sm:max-w-xl md:max-w-2xl"
    >
      <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar sm:flex-wrap sm:overflow-visible">
        {EDITOR_TABS.map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors sm:px-4 ${
              activeTab === tabId
                ? "border-admin-primary bg-admin-primary text-white shadow-sm"
                : "border-admin-border bg-admin-bg/40 text-admin-text-dim hover:border-admin-primary/30 hover:text-admin-text"
            }`}
          >
            {t(`specialists.editor.tab.${tabId}`)}
          </button>
        ))}
      </div>

      {activeTab === "profile" ? (
        <div className="space-y-4">
          <FormSection
            title={t("specialists.editor.identity")}
            description="Photo, name, and public profile copy shown in the app."
            icon="👤"
          >
            <AvatarUploadField
              previewUrl={avatarPreviewUrl}
              onFileChange={onAvatarFileChange}
              onClear={clearAvatar}
            />
            <AdminInput
              label={t("specialists.editor.fullName")}
              value={name}
              onChange={(v) => setName(String(v ?? ""))}
              placeholder="Dr. Jane Smith"
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />
            <AdminInput
              label={t("specialists.editor.specialty")}
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
            title={t("specialists.editor.visibility")}
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
              label={t("specialists.editor.promotionOrder")}
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
            title={t("specialists.editor.countries")}
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
              columns={1}
              listClassName="max-h-64 overflow-y-auto pr-1 custom-scrollbar"
            />
          </FormSection>

          <FormSection
            title={t("specialists.editor.languages")}
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
            title={t("specialists.editor.externalLinks")}
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
              label={t("specialists.editor.bookingLink")}
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
            title={t("specialists.editor.portal")}
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

            <div>
              <label className={inputLabelClass}>Payout trust tier</label>
              <select
                value={trustTier}
                onChange={(e) => setTrustTier(e.target.value as TrustTierValue)}
                className={inputFieldClass}
              >
                {TRUST_TIER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-admin-text-muted">
                {TRUST_TIER_OPTIONS.find((o) => o.value === trustTier)?.hint ??
                  "Controls rolling reserve % and bank payout clearance for new releases."}
              </p>
              <p className="mt-1 text-[11px] text-admin-text-dim">
                Admin override for QA — nightly cron may recalculate tier from booking volume unless you
                change it again.
              </p>
            </div>

            <AdminInput
              label={t("specialists.editor.portalEmail")}
              value={portalEmail}
              onChange={(v) => setPortalEmail(String(v ?? ""))}
              placeholder="specialist@email.com"
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />

            <AdminInput
              label={t("specialists.editor.monthlyLimit")}
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
            title={t("specialists.editor.ambassador")}
            description="Mark ambassadors who recruit specialists. They earn 5% on recruited specialists' bookings (14-day clawback, then Stripe transfer)."
            icon="🤝"
          >
            <label className="flex items-center gap-2 text-sm text-admin-text cursor-pointer">
              <input
                type="checkbox"
                checked={isAmbassador}
                onChange={(e) => setIsAmbassador(e.target.checked)}
                className="rounded border-admin-border"
              />
              This specialist is an ambassador (can recruit others)
            </label>
            {isAmbassador && specialist?.ambassador_referral_code ? (
              <div className="rounded-xl border border-admin-border bg-admin-panel/30 p-3">
                <p className={inputLabelClass}>Referral code</p>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-lg font-bold tracking-widest text-admin-primary">
                    {specialist.ambassador_referral_code}
                  </code>
                  <button
                    type="button"
                    className="text-xs font-bold text-admin-primary hover:underline"
                    onClick={() => {
                      void navigator.clipboard.writeText(specialist.ambassador_referral_code ?? "");
                    }}
                  >
                    Copy
                  </button>
                </div>
                <label className="mt-3 flex items-center gap-2 text-xs text-admin-text-dim cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regenerateAmbassadorCode}
                    onChange={(e) => setRegenerateAmbassadorCode(e.target.checked)}
                    className="rounded border-admin-border"
                  />
                  Regenerate code on save
                </label>
              </div>
            ) : null}
            <div>
              <label className={inputLabelClass}>Ambassador territory (country)</label>
              <select
                value={ambassadorCountryCode}
                onChange={(e) => setAmbassadorCountryCode(e.target.value)}
                className={inputFieldClass}
              >
                <option value="">— None —</option>
                {countryOptions.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={inputLabelClass}>Referred by specialist</label>
              <select
                value={referredBySpecialistId}
                onChange={(e) => setReferredBySpecialistId(e.target.value)}
                className={inputFieldClass}
              >
                <option value="">— None —</option>
                {allSpecialists
                  .filter((s) => s._id !== specialist?._id)
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                      {s.is_ambassador ? " (ambassador)" : ""}
                    </option>
                  ))}
              </select>
            </div>
            <AdminInput
              label={t("specialists.editor.referralCode")}
              value={applyReferralCode}
              onChange={(v) => setApplyReferralCode(String(v ?? "").toUpperCase())}
              placeholder="GZ12345678"
              labelClassName={inputLabelClass}
              inputClassName={inputFieldClass}
            />
          </FormSection>

          <FormSection
            title="DAC7 tax identity"
            description="Legal name and tax ID for yearly DAC7 marketplace reporting."
            icon="📋"
          >
            <AdminInput label={t("specialists.editor.legalName")} value={legalName} onChange={(v) => setLegalName(String(v ?? ""))} labelClassName={inputLabelClass} inputClassName={inputFieldClass} />
            <AdminInput label={t("specialists.editor.entityType")} value={entityType} onChange={(v) => setEntityType(String(v ?? ""))} placeholder={t("specialists.editor.entityPlaceholder")} labelClassName={inputLabelClass} inputClassName={inputFieldClass} />
            <AdminInput label={t("specialists.editor.taxId")} value={taxId} onChange={(v) => setTaxId(String(v ?? ""))} labelClassName={inputLabelClass} inputClassName={inputFieldClass} />
            <AdminInput label="Tax country (ISO)" value={taxCountry} onChange={(v) => setTaxCountry(String(v ?? ""))} labelClassName={inputLabelClass} inputClassName={inputFieldClass} />
            <AdminInput label="Address line 1" value={addressLine1} onChange={(v) => setAddressLine1(String(v ?? ""))} labelClassName={inputLabelClass} inputClassName={inputFieldClass} />
            <AdminInput label={t("specialists.editor.city")} value={addressCity} onChange={(v) => setAddressCity(String(v ?? ""))} labelClassName={inputLabelClass} inputClassName={inputFieldClass} />
            <AdminInput label={t("specialists.editor.postalCode")} value={addressPostalCode} onChange={(v) => setAddressPostalCode(String(v ?? ""))} labelClassName={inputLabelClass} inputClassName={inputFieldClass} />
            <AdminInput label="Address country (ISO)" value={addressCountry} onChange={(v) => setAddressCountry(String(v ?? ""))} labelClassName={inputLabelClass} inputClassName={inputFieldClass} />
          </FormSection>

          <FormSection
            title={t("specialists.editor.defaultService")}
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
