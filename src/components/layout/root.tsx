import { useEffect } from "react";
import { Outlet, useNavigation } from "react-router";
import LoaderMain from "../loader/main-loader";
import MainSidebar from "../navigation/sidebar/sidebar";
import NavBarMain from "../navigation/navbar/nav";
import { Toaster } from "sonner";
import { useAdminLocaleStore } from "../../store/locale/locale";

function AdminLocaleDocumentSync() {
  const locale = useAdminLocaleStore((s) => s.locale);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

export default function RootLayout() {
  const navigation = useNavigation();
  const isRefreshing = navigation.state === "loading" && !navigation.location;

  if (isRefreshing) return <LoaderMain />;

  return (
    <div className="flex min-h-screen bg-admin-bg text-admin-text selection:bg-admin-primary/30 font-sans">
      <AdminLocaleDocumentSync />
      <MainSidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <NavBarMain />

        <main className="flex-1 overflow-y-auto admin-page-enter">
          {navigation.state === "loading" ? (
            <div className="fixed top-0 left-0 right-0 h-0.5 bg-admin-primary/30 z-50 overflow-hidden">
              <div className="h-full w-1/3 bg-admin-primary relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[admin-shimmer_1.2s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/30 to-transparent" />
              </div>
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>

      <Toaster
        theme="dark"
        toastOptions={{
          className:
            "bg-admin-panel! border! border-admin-border! text-admin-text! font-sans!",
        }}
      />
    </div>
  );
}
