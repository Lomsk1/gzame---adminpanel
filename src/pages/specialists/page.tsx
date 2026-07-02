import { useState, useEffect, useMemo, useCallback } from "react";
import { useLoaderData, useFetcher, useRevalidator, Link } from "react-router";
import { GlassCard } from "../../components/cards/card-glass";
import { CategoryEditorDrawer } from "../../components/drawers/category-editor-drawer";
import { SpecialistEditorDrawer, type SpecialistFormData } from "../../components/drawers/specialist-editor-drawer";
import { ButtonComponent } from "../../components/form/button";
import {
  CategoryRow,
  SpecialistActiveFilters,
  SpecialistCard,
  SpecialistEmptyState,
  SpecialistListItem,
  SpecialistListSkeleton,
  SpecialistMetricTile,
  SpecialistToolbar,
  buildSpecialistServices,
  type SpecialistStatusFilter,
  type SpecialistViewMode,
} from "../../components/specialists";
import { toast } from "sonner";
import axiosAuth from "../../helper/axios";
import { axiosMultipartAuth } from "../../helper/axios";
import type { SpecialistCategory, Specialist } from "../../types/specialist/specialist";
import type { SpecialistCategoryListResponse, SpecialistListResponse } from "../../types/specialist/specialist";
import type { SpecialistsPageActionResponse } from "../../features/specialists/specialists-page.actions";

type PageTab = "specialists" | "categories";

const VIEW_MODE_KEY = "gzame-admin-specialists-view";

function specialistCategoryIds(spec: Specialist): string[] {
  return (spec.categories || []).map((c) => (typeof c === "string" ? c : c._id));
}

function readStoredViewMode(): SpecialistViewMode {
  if (typeof window === "undefined") return "grid";
  const stored = localStorage.getItem(VIEW_MODE_KEY);
  return stored === "list" ? "list" : "grid";
}

export default function SpecialistsPage() {
  const { categoriesData, specialistsData } = useLoaderData() as {
    categoriesData: SpecialistCategoryListResponse;
    specialistsData: SpecialistListResponse;
  };
  const fetcher = useFetcher<SpecialistsPageActionResponse>();
  const revalidator = useRevalidator();

  const categories = categoriesData?.data ?? [];
  const specialists = specialistsData?.data ?? [];

  const [activeTab, setActiveTab] = useState<PageTab>("specialists");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SpecialistStatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState<SpecialistViewMode>(readStoredViewMode);
  const [reachFilter, setReachFilter] = useState(false);

  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SpecialistCategory | null>(null);
  const [specialistDrawerOpen, setSpecialistDrawerOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<Specialist | null>(null);
  const [isSubmittingSpecialistWithFile, setIsSubmittingSpecialistWithFile] = useState(false);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

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

  const stats = useMemo(() => {
    const total = specialists.length;
    const active = specialists.filter((s) => s.isActive !== false).length;
    const portal = specialists.filter((s) => s.portal_enabled).length;
    const withCountries = specialists.filter((s) => (s.countries?.length ?? 0) > 0).length;
    return { total, active, portal, withCountries, categories: categories.length };
  }, [specialists, categories.length]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const spec of specialists) {
      for (const id of specialistCategoryIds(spec)) {
        map.set(id, (map.get(id) ?? 0) + 1);
      }
    }
    return map;
  }, [specialists]);

  const categoryFilterOptions = useMemo(
    () =>
      categories.map((cat) => ({
        _id: cat._id,
        label: cat.title?.en || cat.title?.ka || cat._id,
        count: categoryCounts.get(cat._id) ?? 0,
      })),
    [categories, categoryCounts],
  );

  const selectedCategoryLabel = categoryFilterOptions.find((c) => c._id === categoryFilter)?.label;

  const filteredSpecialists = useMemo(() => {
    let list = [...specialists].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter((s) => {
        const haystack = [
          s.name,
          s.specialty,
          s.bio,
          ...(s.tags ?? []),
          ...(s.countries ?? []),
          ...(s.languages ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    if (statusFilter === "active") list = list.filter((s) => s.isActive !== false);
    if (statusFilter === "inactive") list = list.filter((s) => s.isActive === false);
    if (statusFilter === "portal") list = list.filter((s) => s.portal_enabled);
    if (reachFilter) list = list.filter((s) => (s.countries?.length ?? 0) > 0);

    if (categoryFilter) {
      list = list.filter((s) => specialistCategoryIds(s).includes(categoryFilter));
    }

    return list;
  }, [specialists, search, statusFilter, categoryFilter, reachFilter]);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("");
    setReachFilter(false);
  }, []);

  const handleSaveCategory = (payload: { title: { en: string; ka: string; ru?: string; ja?: string } }) => {
    fetcher.submit(
      {
        type: "category",
        intent: editingCategory ? "update" : "create",
        id: editingCategory?._id ?? "",
        payload: JSON.stringify(payload),
      },
      { method: "post" },
    );
    setCategoryDrawerOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    fetcher.submit({ type: "category", intent: "delete", id }, { method: "post" });
  };

  const handleSaveSpecialist = async (payload: SpecialistFormData) => {
    const { avatarFile, ...rest } = payload;
    const services = buildSpecialistServices({
      serviceTitle: rest.serviceTitle,
      serviceDuration: rest.serviceDuration,
      servicePrice: rest.servicePrice,
      serviceCurrency: rest.serviceCurrency,
    });
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
      suggested_spheres: rest.suggestedSpheres ?? [],
      services,
      monthly_client_limit: Math.max(1, rest.monthlyClientLimit ?? 10),
      countries: rest.countries ?? [],
      languages: rest.languages ?? [],
    };

    setIsSubmittingSpecialistWithFile(true);
    try {
      let specialistId: string | null = editingSpecialist?._id ?? null;
      if (editingSpecialist) {
        await axiosAuth.patch(`/api/v1/specialists/${editingSpecialist._id}`, body);
      } else {
        const res = await axiosAuth.post<{ data?: { _id?: string }; _id?: string }>(
          "/api/v1/specialists",
          body,
        );
        const created = res.data?.data ?? res.data;
        specialistId =
          created && typeof created === "object" && "_id" in created
            ? (created as { _id: string })._id
            : null;
      }
      if (specialistId && avatarFile) {
        const uploadForm = new FormData();
        uploadForm.append("avatar", avatarFile);
        await axiosMultipartAuth.patch(`/api/v1/specialists/${specialistId}/avatar`, uploadForm);
      }
      if (rest.portalEmail && specialistId) {
        await axiosAuth.post(`/api/v1/specialists/${specialistId}/enable-portal`, {
          email: rest.portalEmail,
          suggested_spheres: rest.suggestedSpheres ?? [],
          services,
          monthly_client_limit: Math.max(1, rest.monthlyClientLimit ?? 10),
        });
      }
      if (
        specialistId &&
        rest.kycStatus &&
        rest.kycStatus !== (editingSpecialist?.kyc_status ?? "none")
      ) {
        await axiosAuth.patch(`/api/v1/specialists/${specialistId}/kyc-status`, {
          kyc_status: rest.kycStatus,
        });
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
  };

  const handleDeleteSpecialist = (id: string) => {
    fetcher.submit({ type: "specialist", intent: "delete", id }, { method: "post" });
  };

  const openNewSpecialist = () => {
    setEditingSpecialist(null);
    setSpecialistDrawerOpen(true);
  };

  const openEditSpecialist = (spec: Specialist) => {
    setEditingSpecialist(spec);
    setSpecialistDrawerOpen(true);
  };

  const isSubmitting = fetcher.state !== "idle";
  const isSubmittingSpecialist = isSubmitting || isSubmittingSpecialistWithFile;
  const isRefreshing = revalidator.state === "loading";

  return (
    <div className="min-h-full animate-in fade-in duration-500">
      <div className="border-b border-admin-primary/10 bg-gradient-to-b from-admin-panel/40 to-transparent px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-admin-primary">
                Directory
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-admin-text sm:text-3xl">
                Specialists
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-admin-text-dim">
                Manage experts for the mobile app — profiles, countries, languages, booking links, and portal access.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/specialists/booking-clicks"
                className="inline-flex items-center justify-center rounded-xl border border-admin-border bg-admin-bg/50 px-4 py-2.5 text-sm font-medium text-admin-text-dim transition-colors hover:border-admin-primary/40 hover:text-admin-primary"
              >
                Booking analytics
              </Link>
              <ButtonComponent
                variant="oracle"
                size="sm"
                onClick={openNewSpecialist}
                className="min-w-[140px] flex-1 sm:flex-none"
              >
                + New specialist
              </ButtonComponent>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-5">
            <SpecialistMetricTile
              label="Total"
              value={stats.total}
              tone="primary"
              active={activeTab === "specialists" && statusFilter === "all" && !reachFilter && !categoryFilter}
              onClick={() => {
                setActiveTab("specialists");
                setStatusFilter("all");
                setReachFilter(false);
                setCategoryFilter("");
              }}
            />
            <SpecialistMetricTile
              label="Active"
              value={stats.active}
              tone="success"
              active={statusFilter === "active"}
              onClick={() => {
                setActiveTab("specialists");
                setStatusFilter("active");
                setReachFilter(false);
              }}
            />
            <SpecialistMetricTile
              label="Portal"
              value={stats.portal}
              tone="accent"
              active={statusFilter === "portal"}
              onClick={() => {
                setActiveTab("specialists");
                setStatusFilter("portal");
                setReachFilter(false);
              }}
            />
            <SpecialistMetricTile
              label="With reach"
              value={stats.withCountries}
              hint="Countries set"
              tone="warning"
              active={reachFilter}
              onClick={() => {
                setActiveTab("specialists");
                setReachFilter(true);
                setStatusFilter("all");
              }}
            />
            <SpecialistMetricTile
              label="Categories"
              value={stats.categories}
              tone="primary"
              active={activeTab === "categories"}
              onClick={() => setActiveTab("categories")}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex gap-1 rounded-xl border border-admin-border/50 bg-admin-panel/30 p-1">
          {([
            { id: "specialists" as const, label: "Specialists", count: stats.total },
            { id: "categories" as const, label: "Categories", count: stats.categories },
          ]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors sm:flex-none sm:px-5 ${
                activeTab === tab.id
                  ? "bg-admin-primary text-white shadow-sm"
                  : "text-admin-text-dim hover:bg-admin-bg/50 hover:text-admin-text"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-mono ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-admin-bg text-admin-text-muted"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "specialists" ? (
          <GlassCard className="overflow-hidden p-0" noContentPadding>
            <div className="border-b border-admin-border/40 bg-admin-panel/20 p-4 sm:p-5">
              <SpecialistToolbar
                search={search}
                onSearchChange={setSearch}
                statusFilter={statusFilter}
                onStatusFilterChange={(v) => {
                  setStatusFilter(v);
                  setReachFilter(false);
                }}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                categories={categoryFilterOptions}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                resultCount={filteredSpecialists.length}
                totalCount={specialists.length}
                onClearFilters={clearAllFilters}
              />
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <SpecialistActiveFilters
                search={search}
                statusFilter={statusFilter}
                categoryFilter={categoryFilter}
                categoryLabel={selectedCategoryLabel}
                onClearSearch={() => setSearch("")}
                onClearStatus={() => setStatusFilter("all")}
                onClearCategory={() => setCategoryFilter("")}
                onClearAll={clearAllFilters}
              />
              {reachFilter ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-admin-warning/30 bg-admin-warning/10 px-2.5 py-1 text-[11px] font-medium text-admin-warning">
                    With countries configured
                    <button type="button" onClick={() => setReachFilter(false)} aria-label="Remove filter">
                      ×
                    </button>
                  </span>
                </div>
              ) : null}

              {isRefreshing ? (
                <SpecialistListSkeleton count={viewMode === "grid" ? 4 : 6} />
              ) : filteredSpecialists.length === 0 ? (
                <SpecialistEmptyState
                  title={specialists.length === 0 ? "No specialists yet" : "No matches found"}
                  description={
                    specialists.length === 0
                      ? "Create categories first, then add your first specialist with photo, countries, and languages."
                      : "Try different search terms or clear your filters."
                  }
                  actionLabel={specialists.length === 0 ? "Add specialist" : "Clear filters"}
                  icon={specialists.length === 0 ? "👤" : "🔍"}
                  onAction={() => {
                    if (specialists.length === 0) openNewSpecialist();
                    else clearAllFilters();
                  }}
                />
              ) : viewMode === "list" ? (
                <div className="space-y-2 sm:space-y-3">
                  {filteredSpecialists.map((spec) => (
                    <SpecialistListItem
                      key={spec._id}
                      specialist={spec}
                      onEdit={() => openEditSpecialist(spec)}
                      onDelete={() => handleDeleteSpecialist(spec._id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredSpecialists.map((spec) => (
                    <SpecialistCard
                      key={spec._id}
                      specialist={spec}
                      onEdit={() => openEditSpecialist(spec)}
                      onDelete={() => handleDeleteSpecialist(spec._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        ) : (
          <GlassCard>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-admin-text">Categories</h2>
                <p className="mt-1 text-sm text-admin-text-dim">
                  Multilingual labels used to group specialists in the app.
                </p>
              </div>
              <ButtonComponent
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryDrawerOpen(true);
                }}
                className="w-full sm:w-auto"
              >
                + Add category
              </ButtonComponent>
            </div>

            {categories.length === 0 ? (
              <SpecialistEmptyState
                title="No categories yet"
                description="Categories help users filter specialists — e.g. Coach, Therapist, Nutritionist."
                actionLabel="Create category"
                icon="🏷"
                onAction={() => {
                  setEditingCategory(null);
                  setCategoryDrawerOpen(true);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {categories.map((cat) => (
                  <CategoryRow
                    key={cat._id}
                    category={cat}
                    specialistCount={categoryCounts.get(cat._id) ?? 0}
                    onEdit={() => {
                      setEditingCategory(cat);
                      setCategoryDrawerOpen(true);
                    }}
                    onDelete={() => handleDeleteCategory(cat._id)}
                  />
                ))}
              </div>
            )}
          </GlassCard>
        )}
      </div>

      {categoryDrawerOpen ? (
        <CategoryEditorDrawer
          category={editingCategory}
          onClose={() => {
            setCategoryDrawerOpen(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
          isSubmitting={isSubmitting}
        />
      ) : null}

      {specialistDrawerOpen ? (
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
      ) : null}
    </div>
  );
}
