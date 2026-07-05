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
    <div className="flex min-h-screen bg-admin-bg text-admin-text selection:bg-admin-primary/30">
      <AdminLocaleDocumentSync />
      <MainSidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <NavBarMain />

        <main className="flex-1 overflow-y-auto admin-page-enter">
          {navigation.state === "loading" ? (
            <div className="fixed top-0 left-0 right-0 h-0.5 bg-admin-primary/80 z-50 admin-fade-in">
              <div className="h-full w-1/3 bg-admin-primary animate-[admin-shimmer_1.2s_ease-in-out_infinite]" />
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>

      <Toaster
        theme="dark"
        toastOptions={{
          className: "bg-admin-panel border border-admin-border text-admin-text",
          style: {
            background: "#0d143d",
            borderColor: "rgba(59, 130, 246, 0.2)",
          },
        }}
      />
    </div>
  );
}
