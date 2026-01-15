import { Suspense } from "react";
import { useLoaderData, Form, useNavigation, useActionData, Await, useNavigate } from "react-router";
import { ButtonComponent } from "../../components/form/button";
import { GlassTextArea } from "../../components/form/textarea-glass";
import type { AIInstructionType } from "../../types/ai/ai";

export default function AIGeminiPage() {
    // 1. Get deferred data from loader
    const { instructionData } = useLoaderData<{ instructionData: Promise<AIInstructionType['data']> }>();
    const actionData = useActionData() as { status?: string; error?: string };
    const navigation = useNavigation();
    const navigate = useNavigate();

    const isSaving = navigation.state === "submitting";

    return (
        <Form method="post" className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${actionData?.error ? 'bg-admin-error' : 'bg-admin-success'}`} />
                        <span className="text-[10px] font-bold text-admin-text-dim uppercase tracking-widest">
                            {actionData?.error ? "Sync Failed" : "Neural Link Active"}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-admin-text tracking-tighter uppercase italic">
                        Gemini <span className="text-admin-primary">Oracle</span>
                    </h1>
                </div>

                <div className="flex gap-4">
                    <ButtonComponent type="button" variant="secondary" className="w-auto! px-8" onClick={() => navigate("logs")}>
                        View Logs
                    </ButtonComponent>
                    <ButtonComponent
                        type="submit" // Triggers geminiAction
                        variant="oracle"
                        className="w-auto! px-8"
                        isLoading={isSaving}
                    >
                        Sync Protocols
                    </ButtonComponent>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Primary Editor with Suspense for Deferred Data */}
                <div className="lg:col-span-3 h-150">
                    <Suspense fallback={<div className="w-full h-full bg-admin-card/50 animate-pulse rounded-2xl border border-admin-border" />}>
                        <Await resolve={instructionData}>
                            {(resolvedData) => {
                                const activeInstruction = resolvedData?.[0]; // Safe access
                                return (
                                    <>
                                        <input type="hidden" name="instruction_id" value={activeInstruction?._id} />
                                        <GlassTextArea
                                            name="instruction"
                                            label="System Instruction Protocol"
                                            defaultValue={activeInstruction?.text || ""}
                                            error={actionData?.error}
                                            placeholder="Enter the Prime Directive..."
                                        />
                                    </>
                                );
                            }}
                        </Await>
                    </Suspense>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Suspense fallback={<div className="h-32 bg-admin-panel rounded-2xl animate-pulse" />}>
                        <Await resolve={instructionData}>
                            {(resolvedData) => (
                                <div className="p-6 rounded-2xl bg-admin-panel border border-admin-border shadow-xl">
                                    <h3 className="text-xs font-bold text-admin-text mb-4 uppercase italic">Active Version</h3>
                                    <div className="text-3xl font-black text-admin-primary tracking-tighter uppercase">
                                        {resolvedData[0]?._id.slice(-6) || "N/A"}
                                    </div>
                                    <p className="text-[10px] text-admin-text-dim mt-2 leading-relaxed">
                                        Last Updated: <br />
                                        <span className="text-admin-text">
                                            {resolvedData[0] ? new Date(resolvedData[0].updated_at).toLocaleString() : "Never"}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </Await>
                    </Suspense>

                    <div className="p-6 rounded-2xl bg-admin-primary/5 border border-admin-primary/20">
                        <h3 className="text-xs font-bold text-admin-primary mb-3 uppercase tracking-widest">Model Behavior</h3>
                        <ul className="space-y-3">
                            {['Psychotype Analysis', 'Combined Class Detection', 'Sub-type Scoring'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-xs text-admin-text-dim font-medium">
                                    <div className="w-1 h-1 rounded-full bg-admin-primary" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {!isSaving && actionData?.status === "success" && (
                        <div className="p-4 rounded-xl bg-admin-success/10 border border-admin-success/20 text-admin-success text-xs font-bold animate-bounce text-center">
                            PROTOCOLS SYNCED SUCCESSFULLY
                        </div>
                    )}
                </div>
            </div>
        </Form>
    );
}