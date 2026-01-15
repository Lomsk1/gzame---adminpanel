import { toast } from "sonner";

interface AdminToastProps {
    intent: string;
    description?: string;
    id?: string;
    formData?: FormData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetcher?: any; // To allow for the RE-SYNC action
}

export const adminToast = {
    error: ({ intent, description, id, formData, fetcher }: AdminToastProps) => {
        toast.error(`SYSTEM_INTERRUPT: ${intent.toUpperCase()}`, {
            id,
            duration: 8000,
            description: (
                <div className="flex flex-col gap-1 mt-1 font-mono">
                    <span className="text-admin-text/90 font-bold uppercase tracking-tighter leading-tight">
                        {description || "An unknown exception occurred."}
                    </span>
                    <div className="flex items-center gap-2 text-[9px] opacity-60">
                        <span className="bg-admin-error/20 px-1 border border-admin-border">TRACE_ID: {id?.slice(-6) || 'GLOBAL'}</span>
                        <span>0xNODE_FAIL</span>
                    </div>
                </div>
            ),
            className: "!border-admin-error/50 !bg-[#150505] !text-admin-error shadow-[0_0_15px_rgba(239,68,68,0.1)] !font-mono !rounded-none",
            style: { borderLeft: '4px solid #ef4444' },
            // If we pass a fetcher, we provide an automatic Retry button
            action: fetcher && formData ? {
                label: "RE-SYNC",
                onClick: () => fetcher.submit(formData, { method: "post" }),
            } : undefined,
        });
    },

    loading: (message: string, id?: string) => {
        return toast.loading(message.toUpperCase(), {
            id,
            className: "!border-admin-border/50 !bg-admin-panel !text-admin-text !font-mono !rounded-none",
        });
    }
};