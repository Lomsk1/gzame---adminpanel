import { useState, useRef, useEffect } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import type { Specialist, SpecialistCategory } from "../../types/specialist/specialist";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/identicon/svg?seed=spec";

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
  servicePriceCents?: number;
  kycStatus?: Specialist['kyc_status'];
  monthlyClientLimit?: number;
};

interface Props {
  specialist: Specialist | null;
  categories: SpecialistCategory[];
  onClose: () => void;
  onSave: (data: SpecialistFormData) => void;
  isSubmitting?: boolean;
}

export const SpecialistEditorDrawer = ({ specialist, categories, onClose, onSave, isSubmitting }: Props) => {
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
    Array.isArray(specialist?.tags) ? specialist.tags.join(", ") : ""
  );
  const [specialty, setSpecialty] = useState(specialist?.specialty ?? "");
  const [isActive, setIsActive] = useState(specialist?.isActive !== false);
  const [portalEmail, setPortalEmail] = useState(specialist?.portal_user_email ?? "");
  const [kycStatus, setKycStatus] = useState<Specialist['kyc_status']>(
    specialist?.kyc_status ?? 'none',
  );
  const [suggestedSpheres, setSuggestedSpheres] = useState<string[]>(
    specialist?.suggested_spheres ?? [],
  );
  const [serviceTitle, setServiceTitle] = useState(
    specialist?.services?.[0]?.title ?? "Consultation",
  );
  const [serviceDuration, setServiceDuration] = useState(
    specialist?.services?.[0]?.duration_minutes ?? 60,
  );
  const [servicePriceCents, setServicePriceCents] = useState(
    specialist?.services?.[0]?.price_cents ?? 8000,
  );
  const [monthlyClientLimit, setMonthlyClientLimit] = useState(
    specialist?.monthly_client_limit ?? 10,
  );

  const LIFE_SPHERES = [
    "finance",
    "relationships",
    "energy",
    "health",
    "self_realization",
    "environment",
    "skills",
  ] as const;

  useEffect(() => {
    return () => {
      if (avatarFile && avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarFile, avatarPreviewUrl]);

  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  };

  const clearAvatar = () => {
    if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(avatarPreviewUrl);
    setAvatarFile(null);
    setAvatarPreviewUrl(specialist?.avatar ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = () => {
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({
      avatarFile: avatarFile ?? undefined,
      avatar: !avatarFile && (specialist?.avatar) ? specialist.avatar : undefined,
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
      servicePriceCents,
      kycStatus,
      monthlyClientLimit,
    });
  };

  const footer = (
    <button
      type="button"
      disabled={isSubmitting}
      onClick={handleSave}
      className="w-full py-4 bg-admin-primary font-black uppercase tracking-widest text-sm text-admin-bg hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
    >
      {isSubmitting ? "Saving..." : "Save specialist"}
    </button>
  );

  return (
    <AdminDrawerShell
      isOpen
      title={specialist ? "Edit specialist" : "New specialist"}
      onClose={onClose}
      isSubmitting={isSubmitting}
      footer={footer}
    >
      <div className="space-y-6">
        <div>
          <label className="text-sm font-black text-admin-text-dim uppercase tracking-widest block mb-2">Avatar</label>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-lg border border-admin-border overflow-hidden bg-admin-panel/40 shrink-0">
              <img
                src={avatarPreviewUrl || DEFAULT_AVATAR}
                alt="Avatar preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onAvatarFileChange}
                className="hidden"
                id="specialist-avatar-upload"
              />
              <label
                htmlFor="specialist-avatar-upload"
                className="cursor-pointer py-2.5 px-4 border border-admin-border text-sm font-bold text-admin-text hover:border-admin-primary hover:bg-admin-primary/5 transition-colors inline-block"
              >
                Upload image
              </label>
              <button
                type="button"
                onClick={clearAvatar}
                className="text-sm text-admin-text-dim hover:text-admin-error transition-colors text-left"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
        <AdminInput
          label="Name"
          value={name}
          onChange={(v) => setName(String(v ?? ""))}
          placeholder="Full name"
          labelClassName="text-sm font-black text-admin-text-dim uppercase tracking-widest block"
          inputClassName="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
        />
        <AdminInput
          label="Order (promotion)"
          type="number"
          value={order}
          onChange={(v) => setOrder(v === "" ? 0 : Number(v))}
          placeholder="0 = highest"
          labelClassName="text-sm font-black text-admin-text-dim uppercase tracking-widest block"
          inputClassName="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
        />
        <AdminInput
          label="Specialty"
          value={specialty}
          onChange={(v) => setSpecialty(String(v ?? ""))}
          placeholder="e.g. Life Coach"
          labelClassName="text-sm font-black text-admin-text-dim uppercase tracking-widest block"
          inputClassName="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
        />
        <div>
          <label className="text-sm font-black text-admin-text-dim uppercase tracking-widest block mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="tag1, tag2, tag3"
            className="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-black text-admin-primary uppercase mb-1 block">Active</label>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`py-2.5 px-4 border text-sm font-black transition-all ${isActive ? "border-admin-primary text-admin-primary bg-admin-primary/5" : "border-admin-error text-admin-error bg-admin-error/5"}`}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </button>
        </div>
        <div>
          <label className="text-sm font-black text-admin-text-dim uppercase tracking-widest block mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short bio..."
            className="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors min-h-[100px] resize-y"
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-black text-admin-text-dim uppercase tracking-widest block mb-2">Categories</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(cat._id)}
                  onChange={() => toggleCategory(cat._id)}
                  className="rounded border-admin-border bg-admin-panel/40 text-admin-primary focus:ring-admin-primary w-4 h-4"
                />
                <span className="text-sm text-admin-text">{cat.title?.en || cat.title?.ka || cat._id}</span>
              </label>
            ))}
            {categories.length === 0 && (
              <span className="text-sm text-admin-text-dim italic">Add categories first.</span>
            )}
          </div>
        </div>
        <AdminInput
          label="Link (portfolio, etc.)"
          value={link}
          onChange={(v) => setLink(String(v ?? ""))}
          placeholder="https://..."
          labelClassName="text-sm font-black text-admin-text-dim uppercase tracking-widest block"
          inputClassName="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
        />
        <AdminInput
          label="Booking link (e.g. WhatsApp)"
          value={booking}
          onChange={(v) => setBooking(String(v ?? ""))}
          placeholder="https://wa.me/..."
          labelClassName="text-sm font-black text-admin-text-dim uppercase tracking-widest block"
          inputClassName="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
        />
        <div className="border-t border-admin-border pt-4 mt-4">
          <p className="text-sm font-black text-admin-primary uppercase tracking-widest mb-3">
            Specialist portal (mobile app)
          </p>
          {specialist?.portal_enabled ? (
            <p className="text-sm text-admin-success mb-2 font-bold">Portal enabled — linked user can open /specialist in the app.</p>
          ) : (
            <p className="text-sm text-admin-text-dim mb-2">Portal not enabled yet. Enter an existing user email below to link access.</p>
          )}
          {specialist?.invite_code ? (
            <p className="text-sm text-admin-text mb-2">
              Invite code: <code className="text-admin-primary">{specialist.invite_code}</code>
            </p>
          ) : null}
          <label className="text-sm font-black text-admin-text-dim uppercase tracking-widest block mb-1 mt-2">
            KYC status
          </label>
          <select
            value={kycStatus ?? 'none'}
            onChange={(e) => setKycStatus(e.target.value as Specialist['kyc_status'])}
            className="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors mb-3"
          >
            <option value="none">None</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <AdminInput
            label="Portal user email (existing GzaMe account)"
            value={portalEmail}
            onChange={(v) => setPortalEmail(String(v ?? ""))}
            placeholder="specialist@email.com"
            labelClassName="text-sm font-black text-admin-text-dim uppercase tracking-widest block"
            inputClassName="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
          />
          <AdminInput
            label="Monthly client limit (min 1)"
            type="number"
            value={monthlyClientLimit}
            onChange={(v) => setMonthlyClientLimit(Math.max(1, Number(v) || 1))}
            labelClassName="text-sm font-black text-admin-text-dim uppercase tracking-widest block"
            inputClassName="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
          />
          <label className="text-sm font-black text-admin-text-dim uppercase tracking-widest block mb-2 mt-3">
            Suggested spheres
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {LIFE_SPHERES.map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={suggestedSpheres.includes(s)}
                  onChange={() =>
                    setSuggestedSpheres((prev) =>
                      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                    )
                  }
                  className="rounded border-admin-border"
                />
                <span className="text-xs text-admin-text">{s}</span>
              </label>
            ))}
          </div>
          <AdminInput
            label="Service title"
            value={serviceTitle}
            onChange={(v) => setServiceTitle(String(v ?? ""))}
            placeholder="60 min consultation"
            labelClassName="text-sm font-black text-admin-text-dim uppercase tracking-widest block"
            inputClassName="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
          />
          <div className="grid grid-cols-2 gap-3 mt-2">
            <AdminInput
              label="Duration (min)"
              type="number"
              value={serviceDuration}
              onChange={(v) => setServiceDuration(Number(v) || 60)}
              labelClassName="text-sm font-black text-admin-text-dim uppercase tracking-widest block"
              inputClassName="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
            />
            <AdminInput
              label="Price (cents)"
              type="number"
              value={servicePriceCents}
              onChange={(v) => setServicePriceCents(Number(v) || 0)}
              labelClassName="text-sm font-black text-admin-text-dim uppercase tracking-widest block"
              inputClassName="w-full bg-admin-panel/40 border border-admin-border p-3 text-base text-admin-text outline-none focus:border-admin-primary transition-colors no-spinner"
            />
          </div>
        </div>
      </div>
    </AdminDrawerShell>
  );
};
