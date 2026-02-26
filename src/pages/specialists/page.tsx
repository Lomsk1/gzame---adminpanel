import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, useRevalidator } from "react-router";
import { GlassCard } from "../../components/cards/card-glass";
import { CategoryEditorDrawer } from "../../components/drawers/category-editor-drawer";
import { SpecialistEditorDrawer, type SpecialistFormData } from "../../components/drawers/specialist-editor-drawer";
import { AdminConfirmWrapper } from "../../components/wrapper/wrapper";
import { ButtonComponent } from "../../components/form/button";
import { toast } from "sonner";
import axiosAuth from "../../helper/axios";
import { axiosMultipartAuth } from "../../helper/axios";
import type { SpecialistCategory, Specialist } from "../../types/specialist/specialist";
import type { SpecialistCategoryListResponse, SpecialistListResponse } from "../../types/specialist/specialist";
import type { SpecialistsPageActionResponse } from "../../features/specialists/specialists-page.actions";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/identicon/svg?seed=spec";

export default function SpecialistsPage() {
  const { categoriesData, specialistsData } = useLoaderData() as {
    categoriesData: SpecialistCategoryListResponse;
    specialistsData: SpecialistListResponse;
  };
  const fetcher = useFetcher<SpecialistsPageActionResponse>();
  const revalidator = useRevalidator();

  const categories = categoriesData?.data ?? [];
  const specialists = specialistsData?.data ?? [];

  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SpecialistCategory | null>(null);
  const [specialistDrawerOpen, setSpecialistDrawerOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(null);
  const [isSubmittingSpecialistWithFile, setIsSubmittingSpecialistWithFile] = useState(false);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      const d = fetcher.data;
      if (d.success) {
        toast.success(d.message);
        revalidator.revalidate();
      } else {
        toast.error(d.error || "Action failed");
      }
      fetcher.reset();
    }
  }, [fetcher.state, fetcher.data, revalidator, fetcher]);

  const handleSaveCategory = (payload: { title: { en: string; ka: string } }) => {
    fetcher.submit(
      {
        type: "category",
        intent: editingCategory ? "update" : "create",
        id: editingCategory?._id ?? "",
        payload: JSON.stringify(payload),
      },
      { method: "post" }
    );
    setCategoryDrawerOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    fetcher.submit({ type: "category", intent: "delete", id }, { method: "post" });
  };

  const handleSaveSpecialist = async (payload: SpecialistFormData) => {
    const { avatarFile, ...rest } = payload;
    const body = {
      avatar: payload.avatar || undefined,
      name: rest.name,
      bio: rest.bio,
      categories: rest.categoryIds,
      link: rest.link,
      booking: rest.booking,
      order: rest.order ?? 0,
      tags: rest.tags ?? [],
      specialty: rest.specialty || undefined,
      isActive: rest.isActive !== false,
    };

    if (avatarFile) {
      setIsSubmittingSpecialistWithFile(true);
      try {
        let specialistId: string | null = editingSpecialist?._id ?? null;
        if (editingSpecialist) {
          await axiosAuth.patch(`/api/v1/specialists/${editingSpecialist._id}`, body);
        } else {
          const res = await axiosAuth.post<{ data?: { _id?: string }; _id?: string }>("/api/v1/specialists", body);
          const created = res.data?.data ?? res.data;
          specialistId =
            created && typeof created === "object" && "_id" in created
              ? (created as { _id: string })._id
              : null;
        }
        if (specialistId) {
          const uploadForm = new FormData();
          uploadForm.append("avatar", avatarFile);
          await axiosMultipartAuth.patch(`/api/v1/specialists/${specialistId}/avatar`, uploadForm);
        }
        toast.success(editingSpecialist ? "Specialist updated." : "Specialist created.");
        revalidator.revalidate();
        setSpecialistDrawerOpen(false);
        setEditingSpecialist(null);
      } catch (err: unknown) {
        const msg =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
            : "Request failed.";
        toast.error(msg ?? "Request failed.");
      } finally {
        setIsSubmittingSpecialistWithFile(false);
      }
      return;
    }

    const formData = new FormData();
    formData.append("type", "specialist");
    formData.append("intent", editingSpecialist ? "update" : "create");
    formData.append("id", editingSpecialist?._id ?? "");
    formData.append("payload", JSON.stringify({ ...rest, avatar: payload.avatar }));
    fetcher.submit(formData, { method: "post" });
    setSpecialistDrawerOpen(false);
    setEditingSpecialist(null);
  };

  const handleDeleteSpecialist = (id: string) => {
    fetcher.submit({ type: "specialist", intent: "delete", id }, { method: "post" });
  };

  const isSubmitting = fetcher.state !== "idle";
  const isSubmittingSpecialist =
    isSubmitting || isSubmittingSpecialistWithFile;

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* --- CATEGORIES --- */}
      <section>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-admin-primary/20 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-black text-admin-text uppercase italic tracking-tighter">
              Categories
            </h1>
            <p className="text-sm text-admin-text-dim mt-1">Manage specialist categories (EN / KA titles).</p>
          </div>
          <ButtonComponent
            variant="oracle"
            size="sm"
            onClick={() => {
              setEditingCategory(null);
              setCategoryDrawerOpen(true);
            }}
            className="px-4 py-2"
          >
            + Add category
          </ButtonComponent>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <GlassCard key={cat._id} className="flex flex-row items-center justify-between gap-4">
              <div>
                <p className="text-base font-bold text-admin-text">{cat.title?.en || "—"}</p>
                <p className="text-sm text-admin-text-dim">{cat.title?.ka || "—"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(cat);
                    setCategoryDrawerOpen(true);
                  }}
                  className="text-sm font-bold text-admin-primary hover:underline uppercase"
                >
                  Edit
                </button>
                <AdminConfirmWrapper
                  title="Delete category?"
                  description="This will remove the category. Specialists using it may need to be updated."
                  onConfirm={() => handleDeleteCategory(cat._id)}
                  variant="danger"
                >
                  <button type="button" className="text-sm font-bold text-admin-error hover:underline uppercase">
                    Delete
                  </button>
                </AdminConfirmWrapper>
              </div>
            </GlassCard>
          ))}
          {categories.length === 0 && (
            <p className="text-base text-admin-text-dim col-span-full italic">No categories yet. Add one to get started.</p>
          )}
        </div>
      </section>

      {/* --- SPECIALISTS --- */}
      <section>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-admin-primary/20 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-black text-admin-text uppercase italic tracking-tighter">
              Specialists
            </h1>
            <p className="text-sm text-admin-text-dim mt-1">Name, order, specialty, tags, bio, link, booking.</p>
          </div>
          <ButtonComponent
            variant="oracle"
            size="sm"
            onClick={() => {
              setEditingSpecialist(null);
              setSpecialistDrawerOpen(true);
            }}
            className="px-4 py-2"
          >
            + Add specialist
          </ButtonComponent>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...specialists]
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .map((spec) => (
            <GlassCard
              key={spec._id}
              className={`flex flex-col overflow-hidden ${spec.isActive === false ? "opacity-60" : ""}`}
            >
              <div className="flex gap-4">
                <img
                  src={spec.avatar || DEFAULT_AVATAR}
                  alt=""
                  className="w-20 h-20 rounded-xl border border-admin-border object-cover shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-lg font-bold text-admin-text truncate">{spec.name || "—"}</p>
                    {spec.isActive === false && (
                      <span className="text-xs px-2 py-0.5 bg-admin-error/20 text-admin-error rounded border border-admin-error/30">INACTIVE</span>
                    )}
                    {(spec.order ?? 0) > 0 && (
                      <span className="text-xs text-admin-text-dim font-mono">#{spec.order}</span>
                    )}
                  </div>
                  {spec.specialty ? (
                    <p className="text-sm text-admin-primary font-medium">{spec.specialty}</p>
                  ) : null}
                  <p className="text-sm text-admin-text-dim line-clamp-2 mt-0.5">{spec.bio || "—"}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(Array.isArray(spec.tags) ? spec.tags : []).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-admin-bg border border-admin-border text-admin-text-dim rounded">
                        {tag}
                      </span>
                    ))}
                    {(Array.isArray(spec.categories) ? spec.categories : []).map((c) => (
                      <span
                        key={typeof c === "string" ? c : c._id}
                        className="text-xs px-2 py-0.5 bg-admin-primary/10 border border-admin-primary/20 text-admin-primary rounded"
                      >
                        {typeof c === "string" ? c : (c as SpecialistCategory).title?.en ?? c._id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-admin-border/50 flex flex-wrap gap-2 justify-between items-center">
                {spec.link ? (
                  <a href={spec.link} target="_blank" rel="noopener noreferrer" className="text-sm text-admin-primary hover:underline truncate max-w-[160px]">
                    Link
                  </a>
                ) : null}
                {spec.booking ? (
                  <a href={spec.booking} target="_blank" rel="noopener noreferrer" className="text-sm text-admin-accent hover:underline truncate max-w-[160px]">
                    Booking
                  </a>
                ) : null}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSpecialist(spec);
                      setSpecialistDrawerOpen(true);
                    }}
                    className="text-sm font-bold text-admin-primary hover:underline uppercase"
                  >
                    Edit
                  </button>
                  <AdminConfirmWrapper
                    title="Delete specialist?"
                    description="This will permanently remove this specialist."
                    onConfirm={() => handleDeleteSpecialist(spec._id)}
                    variant="danger"
                  >
                    <button type="button" className="text-sm font-bold text-admin-error hover:underline uppercase">
                      Delete
                    </button>
                  </AdminConfirmWrapper>
                </div>
              </div>
            </GlassCard>
          ))}

          {specialists.length === 0 && (
            <p className="text-base text-admin-text-dim col-span-full italic">No specialists yet. Add categories first, then add specialists.</p>
          )}
        </div>
      </section>

      {categoryDrawerOpen && (
        <CategoryEditorDrawer
          category={editingCategory}
          onClose={() => {
            setCategoryDrawerOpen(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
          isSubmitting={isSubmitting}
        />
      )}

      {specialistDrawerOpen && (
        <SpecialistEditorDrawer
          specialist={editingSpecialist}
          categories={categories}
          onClose={() => {
            setSpecialistDrawerOpen(false);
            setEditingSpecialist(null);
          }}
          onSave={handleSaveSpecialist}
          isSubmitting={isSubmittingSpecialist}
        />
      )}
    </div>
  );
}
