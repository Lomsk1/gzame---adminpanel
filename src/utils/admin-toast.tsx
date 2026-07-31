import { toast } from "sonner";

interface AdminToastProps {
  intent: string;
  description?: string;
  id?: string;
  formData?: FormData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetcher?: any;
}

export const adminToast = {
  error: ({ intent, description, id, formData, fetcher }: AdminToastProps) => {
    toast.error(`SYSTEM_INTERRUPT: ${intent.toUpperCase()}`, {
      id,
      duration: 8000,
      description: (
        <div className="flex flex-col gap-1 mt-1 font-mono">
          <span className="text-admin-text/90 font-semibold tracking-tight leading-tight">
            {description || "An unknown exception occurred."}
          </span>
          <div className="flex items-center gap-2 text-[11px] opacity-60">
            <span className="bg-admin-error/20 px-1.5 rounded border border-admin-border">
              TRACE_ID: {id?.slice(-6) || "GLOBAL"}
            </span>
            <span>0xNODE_FAIL</span>
          </div>
        </div>
      ),
      className:
        "!border-admin-error/40 !bg-admin-panel !text-admin-error !font-mono !rounded-xl",
      style: { borderLeft: "4px solid var(--color-admin-error)" },
      action:
        fetcher && formData
          ? {
              label: "RE-SYNC",
              onClick: () => fetcher.submit(formData, { method: "post" }),
            }
          : undefined,
    });
  },

  loading: (message: string, id?: string) => {
    return toast.loading(message.toUpperCase(), {
      id,
      className: "!border-admin-border !bg-admin-panel !text-admin-text !font-mono !rounded-xl",
    });
  },
};
