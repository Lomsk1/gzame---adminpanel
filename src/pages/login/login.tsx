import { Form, useActionData, useNavigation } from "react-router";
import { InputComponent } from "../../components/form/input";
import { ButtonComponent } from "../../components/form/button";

export default function LoginPage() {
    const actionData = (useActionData() as { error?: string }) || {};
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-admin-bg relative overflow-hidden">
            {/* Background Decorative Blurs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-admin-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-admin-accent/10 rounded-full blur-[120px]" />

            <section className="w-full max-w-md px-6 z-10">
                <div className="bg-admin-panel/50 backdrop-blur-xl border border-admin-border p-8 rounded-3xl shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-admin-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-admin-primary/30">
                            <span className="text-admin-primary text-3xl font-bold">A</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-admin-text tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-admin-text-dim mt-2 text-sm">
                            Please enter your credentials to continue
                        </p>
                    </div>

                    <Form method="post" className="space-y-2">
                        <InputComponent
                            label="Login"
                            name="login"
                            type="text"
                            required
                            autoComplete="login"
                        />

                        <InputComponent
                            label="Password"
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                        />

                        {actionData?.error && (
                            <div className="bg-admin-error/10 border border-admin-error/20 py-2 px-4 rounded-lg">
                                <p className="text-admin-error text-xs font-medium text-center">
                                    {actionData.error}
                                </p>
                            </div>
                        )}

                        <div className="pt-4">
                            <ButtonComponent type="submit" isLoading={isSubmitting}>
                                Sign In
                            </ButtonComponent>
                        </div>
                    </Form>

                    {/* Footer */}
                    <footer className="mt-8 text-center">
                        <a href="#" className="text-xs text-admin-text-dim hover:text-admin-primary transition-colors">
                            Forgot your password?
                        </a>
                    </footer>
                </div>

                <p className="text-center mt-8 text-admin-text-dim/50 text-xs">
                    &copy; 2026 Admin Panel UI. All rights reserved.
                </p>
            </section>
        </main>
    );
}