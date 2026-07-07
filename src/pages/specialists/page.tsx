import { useState, useEffect, useMemo, useCallback } from "react";
import { useLoaderData, useFetcher, useRevalidator, Link } from "react-router";
import { GlassCard } from "../../components/cards/card-glass";
import { CategoryEditorDrawer } from "../../components/drawers/category-editor-drawer";
import { SpecialistDetailDrawer } from "../../components/drawers/specialist-detail-drawer";
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
  SpecialistTableRow,
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
import { AdminPageHeader, AdminPageShell } from "../../components/admin";
import { useAdminT } from "../../store/locale/locale";

type PageTab = "specialists" | "categories";

const VIEW_MODE_KEY = "gzame-admin-specialists-view";

function specialistCategoryIds(spec: Specialist): string[] {
  return (spec.categories || []).map((c) => (typeof c === "string" ? c : c._id));
}

function readStoredViewMode(): SpecialistViewMode {
  if (typeof window === "undefined") return "table";
  const stored = localStorage.getItem(VIEW_MODE_KEY);
  if (stored === "list" || stored === "grid" || stored === "table") return stored;
  return "table";
}

export default function SpecialistsPage() {
  const { t } = useAdminT();
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
  const [inspectingSpecialist, setInspectingSpecialist] = useState<Specialist | null>(null);
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
        toast.error(d.error || t("common.actionFailed"));
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
      is_ambassador: rest.isAmbassador === true,
      ambassador_country_code: rest.ambassadorCountryCode || undefined,
      ambassador_recruit_ids: rest.isAmbassador ? (rest.ambassadorRecruitIds ?? []) : undefined,
      referred_by_specialist_id: !rest.isAmbassador
        ? rest.referredBySpecialistId?.trim()
          ? rest.referredBySpecialistId.trim()
          : null
        : undefined,
      apply_referral_code: rest.applyReferralCode || undefined,
      regenerate_ambassador_code: rest.regenerateAmbassadorCode === true,
      legal_name: rest.legalName || undefined,
      entity_type: rest.entityType || undefined,
      tax_id: rest.taxId || undefined,
      tax_country: rest.taxCountry || undefined,
      address_line1: rest.addressLine1 || undefined,
      address_city: rest.addressCity || undefined,
      address_postal_code: rest.addressPostalCode || undefined,
      address_country: rest.addressCountry || undefined,
      trust_tier: rest.trustTier || undefined,
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
      toast.success(editingSpecialist ? t("specialists.toast.updated") : t("specialists.toast.created"));
      revalidator.revalidate();
      setSpecialistDrawerOpen(false);
      setEditingSpecialist(null);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Request failed.";
      toast.error(msg ?? t("specialists.toast.failed"));
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

  const openInspectSpecialist = (spec: Specialist) => {
    setInspectingSpecialist(spec);
  };

  const openEditSpecialist = (spec: Specialist) => {
    setEditingSpecialist(spec);
    setSpecialistDrawerOpen(true);
  };

  const isSubmitting = fetcher.state !== "idle";
  const isSubmittingSpecialist = isSubmitting || isSubmittingSpecialistWithFile;
  const isRefreshing = revalidator.state === "loading";

  return (
    <AdminPageShell className="space-y-6">
      <AdminPageHeader
        title={t("pages.specialists.title")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              to="/specialists/booking-clicks"
              className="inline-flex items-center justify-center rounded-xl border border-admin-border bg-admin-bg/50 px-4 py-2.5 text-sm font-medium text-admin-text-dim transition-colors hover:border-admin-primary/40 hover:text-admin-primary"
            >
              {t("specialists.bookingAnalytics")}
            </Link>
            <ButtonComponent
              variant="oracle"
              size="sm"
              onClick={openNewSpecialist}
              className="min-w-[140px] flex-1 sm:flex-none"
            >
              {t("specialists.newSpecialist")}
            </ButtonComponent>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 xl:grid-cols-5 admin-fade-up" style={{ animationDelay: "80ms" }}>
            <SpecialistMetricTile
              label={t("specialists.metric.total")}
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
              label={t("specialists.metric.active")}
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
              label={t("specialists.metric.portal")}
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
              label={t("specialists.metric.withReach")}
              value={stats.withCountries}
              hint={t("specialists.metric.countriesHint")}
              tone="warning"
              active={reachFilter}
              onClick={() => {
                setActiveTab("specialists");
                setReachFilter(true);
                setStatusFilter("all");
              }}
            />
            <SpecialistMetricTile
              label={t("specialists.metric.categories")}
              value={stats.categories}
              tone="primary"
              active={activeTab === "categories"}
              onClick={() => setActiveTab("categories")}
            />
          </div>

      <div className="space-y-4 sm:space-y-6 admin-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="flex gap-1 rounded-xl border border-admin-border/50 bg-admin-panel/30 p-1">
          {([
            { id: "specialists" as const, label: t("specialists.tab.specialists"), count: stats.total },
            { id: "categories" as const, label: t("specialists.tab.categories"), count: stats.categories },
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
                    {t("specialists.filter.withCountries")}
                    <button type="button" onClick={() => setReachFilter(false)} aria-label={t("specialists.filter.remove")}>
                      ×
                    </button>
                  </span>
                </div>
              ) : null}

              {isRefreshing ? (
                <SpecialistListSkeleton count={viewMode === "grid" ? 4 : 6} />
              ) : filteredSpecialists.length === 0 ? (
                <SpecialistEmptyState
                  title={specialists.length === 0 ? t("specialists.empty.noSpecialists") : t("specialists.empty.noMatches")}
                  description={
                    specialists.length === 0
                      ? t("specialists.empty.noSpecialistsDesc")
                      : t("specialists.empty.noMatchesDesc")
                  }
                  actionLabel={specialists.length === 0 ? t("specialists.empty.addSpecialist") : t("specialists.empty.clearFilters")}
                  icon={specialists.length === 0 ? "👤" : "🔍"}
                  onAction={() => {
                    if (specialists.length === 0) openNewSpecialist();
                    else clearAllFilters();
                  }}
                />
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left">
                    <thead className="border-b border-admin-border/40 bg-admin-panel/30 text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-dim">
                      <tr>
                        <th className="px-4 py-3">{t("specialists.table.specialist")}</th>
                        <th className="hidden px-4 py-3 md:table-cell">{t("specialists.table.categories")}</th>
                        <th className="hidden px-4 py-3 lg:table-cell">{t("specialists.table.bio")}</th>
                        <th className="hidden px-4 py-3 sm:table-cell">{t("specialists.table.reach")}</th>
                        <th className="px-4 py-3">{t("common.status")}</th>
                        <th className="px-4 py-3 text-right">{t("specialists.table.ops")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSpecialists.map((spec) => (
                        <SpecialistTableRow
                          key={spec._id}
                          specialist={spec}
                          onInspect={() => openInspectSpecialist(spec)}
                          onEdit={() => openEditSpecialist(spec)}
                          onDelete={() => handleDeleteSpecialist(spec._id)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
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
                <h2 className="text-lg font-bold text-admin-text">{t("specialists.categories.title")}</h2>
                <p className="mt-1 text-sm text-admin-text-dim">
                  {t("specialists.categories.desc")}
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
                {t("specialists.categories.add")}
              </ButtonComponent>
            </div>

            {categories.length === 0 ? (
              <SpecialistEmptyState
                title={t("specialists.categories.empty")}
                description={t("specialists.categories.emptyDesc")}
                actionLabel={t("specialists.categories.create")}
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

      {inspectingSpecialist ? (
        <SpecialistDetailDrawer
          specialist={inspectingSpecialist}
          onClose={() => setInspectingSpecialist(null)}
          onEdit={() => {
            openEditSpecialist(inspectingSpecialist);
            setInspectingSpecialist(null);
          }}
          onDeleted={() => {
            setInspectingSpecialist(null);
            revalidator.revalidate();
          }}
        />
      ) : null}

      {specialistDrawerOpen ? (
        <SpecialistEditorDrawer
          specialist={editingSpecialist}
          categories={categories}
          allSpecialists={specialists}
          onClose={() => {
            setSpecialistDrawerOpen(false);
            setEditingSpecialist(null);
          }}
          onSave={handleSaveSpecialist}
          isSubmitting={isSubmittingSpecialist}
        />
      ) : null}
    </AdminPageShell>
  );
}
