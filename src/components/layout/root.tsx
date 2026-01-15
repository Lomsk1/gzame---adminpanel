import { Outlet, useNavigation } from "react-router";
import LoaderMain from "../loader/main-loader";
import MainSidebar from "../navigation/sidebar/sidebar";
import NavBarMain from "../navigation/navbar/nav";
import { Toaster } from "sonner";

export default function RootLayout() {
    const navigation = useNavigation();

    const isRefreshing = navigation.state === "loading" && !navigation.location;;


    if (isRefreshing) return <LoaderMain />

    return (
        <div className="flex min-h-screen bg-admin-bg text-admin-text selection:bg-admin-primary/30">
            {/* 1. Sidebar is the anchor of the page */}
            <MainSidebar />

            {/* 2. Content wrapper */}
            <div className="flex flex-col flex-1">
                {/* 3. Navbar lives inside the content area */}
                <NavBarMain />

                {/* 4. Scrollable Content Area */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* Global Page Transition Progress Bar */}
                    {navigation.state === "loading" && (
                        <div className="fixed top-0 left-0 right-0 h-1 bg-admin-primary z-50 animate-pulse" />
                    )}
                    <Outlet />
                </main>
            </div>

            <Toaster
                theme="dark"
                toastOptions={{
                    className: "bg-admin-panel border border-admin-border text-admin-text font-mono",
                    style: {
                        background: '#0a0a0b', // Your admin-bg
                        borderColor: 'rgba(var(--admin-primary), 0.2)',
                    }
                }}
            />
        </div>
    )
}

