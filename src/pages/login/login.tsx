import { Form, useActionData, useNavigation } from "react-router";
import { InputComponent } from "../../components/form/input";
import { ButtonComponent } from "../../components/form/button";
import { AdminLanguageSwitcher } from "../../components/admin/admin-language-switcher";
import { AdminFadeIn, AdminScaleIn } from "../../components/admin/admin-animated";
import { useAdminT } from "../../store/locale/locale";

export default function LoginPage() {
  const actionData = (useActionData() as { error?: string }) || {};
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const { t } = useAdminT();

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-admin-bg relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-admin-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-admin-accent/10 rounded-full blur-[120px]" />

      <AdminFadeIn className="absolute top-6 right-6 z-20">
        <AdminLanguageSwitcher />
      </AdminFadeIn>

      <section className="w-full max-w-md px-6 z-10">
        <AdminScaleIn>
          <div className="bg-admin-panel/50 backdrop-blur-xl border border-admin-border p-8 rounded-3xl shadow-2xl">
            <div className="text-center mb-10 admin-fade-up" style={{ animationDelay: "80ms" }}>
              <div className="w-16 h-16 bg-admin-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-admin-primary/30">
                <span className="text-admin-primary text-3xl font-bold">A</span>
              </div>
              <h1 className="text-3xl font-extrabold text-admin-text tracking-tight">
                {t("login.title")}
              </h1>
              <p className="text-admin-text-dim mt-2 text-sm">{t("login.subtitle")}</p>
            </div>

            <Form method="post" className="space-y-2 admin-fade-up" style={{ animationDelay: "140ms" }}>
              <InputComponent
                label={t("login.loginLabel")}
                name="login"
                type="text"
                required
                autoComplete="login"
              />

              <InputComponent
                label={t("login.passwordLabel")}
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />

              {actionData?.error ? (
                <div className="bg-admin-error/10 border border-admin-error/20 py-2 px-4 rounded-lg admin-scale-in">
                  <p className="text-admin-error text-xs font-medium text-center">{actionData.error}</p>
                </div>
              ) : null}

              <div className="pt-4">
                <ButtonComponent type="submit" isLoading={isSubmitting}>
                  {t("login.submit")}
                </ButtonComponent>
              </div>
            </Form>

            <footer className="mt-8 text-center admin-fade-up" style={{ animationDelay: "200ms" }}>
              <a
                href="#"
                className="text-xs text-admin-text-dim hover:text-admin-primary transition-colors"
              >
                {t("login.forgotPassword")}
              </a>
            </footer>
          </div>
        </AdminScaleIn>

        <p className="text-center mt-8 text-admin-text-dim/50 text-xs admin-fade-in" style={{ animationDelay: "260ms" }}>
          {t("app.copyright", { year: new Date().getFullYear() })}
        </p>
      </section>
    </main>
  );
}
