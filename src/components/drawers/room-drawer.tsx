/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { AdminDrawerShell } from "./admin-drawer-shell";
import { AdminInput } from "../ui/input-form";
import { AdminTextArea } from "../ui/text-area-form";
import type { Psychotype } from "../../types/user/user";

// Types matching your ChatRoom Schema
export interface ChatRoomFormData {
    _id?: string;
    name: string;
    description: string;
    type: "class" | "guild" | "mission" | "leadership" | "mastermind" | "private";
    psychotype?: Psychotype | null;
    region: {
        continent: "americas" | "europe" | "asia" | "africa" | "oceania" | "global" | "private";
        subregion?: string;
        country?: string;
        timezone?: string;
        language: string;
        geo_scope: "global" | "continental" | "subregional" | "national" | "local" | "private";
    };
    min_level: number;
    required_consistency?: number;
    max_participants?: number;
    is_public: boolean;
}

interface Props {
    config: ChatRoomFormData | null;
    onClose: () => void;
    onSave: (data: ChatRoomFormData) => void;
    isSubmitting?: boolean;
}

const ROOM_TYPES = ["class", "guild", "mission", "leadership", "mastermind", "private"];
const CONTINENTS = ["americas", "europe", "asia", "africa", "oceania", "global", "private"];
const GEO_SCOPES = ["global", "continental", "subregional", "national", "local", "private"];
const PSYCHOTYPES: Psychotype[] = ["WARRIOR", "SHAMAN", "ARCHITECT", "STALKER", "SPARK"];

export const ChatRoomEditorDrawer = ({ config, onClose, onSave, isSubmitting }: Props) => {
    const [form, setForm] = useState<ChatRoomFormData>({
        name: config?.name || "",
        description: config?.description || "",
        type: config?.type || "class",
        psychotype: config?.psychotype || null,
        region: {
            continent: config?.region?.continent || "global",
            subregion: config?.region?.subregion || "",
            country: config?.region?.country || "",
            timezone: config?.region?.timezone || "",
            language: config?.region?.language || "en",
            geo_scope: config?.region?.geo_scope || "global",
        },
        min_level: config?.min_level ?? 1,
        required_consistency: config?.required_consistency ?? 0,
        max_participants: config?.max_participants ?? 50,
        is_public: config?.is_public ?? true,
    });

    const handleSave = () => {
        if (!form.name) {
            alert("VALIDATION_ERROR: ROOM_NAME_REQUIRED");
            return;
        }
        onSave(form);
    };

    const footer = (
        <button
            disabled={isSubmitting}
            onClick={handleSave}
            className="group relative w-full py-4 bg-admin-primary font-black uppercase tracking-widest text-xs overflow-hidden transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 text-admin-bg cursor-pointer"
        >
            <span className="relative z-10">{isSubmitting ? "ESTABLISHING_COMM_LINK..." : "DEPLOY_CHAT_NODE"}</span>
            <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
        </button>
    );

    return (
        <AdminDrawerShell
            isOpen={true}
            title={config ? "RECONFIGURING_ROOM_CHANNELS" : "INITIALIZING_NEW_ROOM_NODE"}
            onClose={onClose}
            isSubmitting={isSubmitting}
            footer={footer}
        >
            <div className="space-y-8 pb-10">
                {/* 1. Availability & Identity */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-admin-primary uppercase mb-1">Access_Protocol</label>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, is_public: !form.is_public })}
                            className={`py-2 border text-[10px] font-black transition-all ${form.is_public ? 'border-admin-primary text-admin-primary bg-admin-primary/5' : 'border-admin-error text-admin-error bg-admin-error/5'}`}
                        >
                            {form.is_public ? "ENCRYPTED_PUBLIC" : "HIDDEN_PRIVATE"}
                        </button>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-black text-admin-accent uppercase mb-1">Room_Type</label>
                        <select
                            value={form.type}
                            onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                            className="bg-admin-bg border border-admin-border text-admin-text text-[10px] font-black py-2 px-1 outline-none focus:border-admin-accent uppercase"
                        >
                            {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                {/* 2. Core Identity */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">Channel_Identity</h4>
                    <AdminInput label="Room_Name" value={form.name} onChange={(val) => setForm({ ...form, name: val as string })} />
                    <AdminTextArea label="Channel_Purpose_Description" value={form.description} onChange={(val) => setForm({ ...form, description: val as string })} />
                </div>

                {/* 3. Psychotype Lock */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-admin-text-dim uppercase">Psychotype_Gate</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, psychotype: null })}
                            className={`py-2 text-[9px] font-black border transition-all ${form.psychotype === null ? 'border-admin-text text-admin-text bg-white/10' : 'border-admin-border/50 text-admin-text-dim'}`}
                        >
                            UNIVERSAL
                        </button>
                        {PSYCHOTYPES.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setForm({ ...form, psychotype: p })}
                                className={`py-2 text-[9px] font-black border transition-all ${form.psychotype === p ? 'border-admin-primary text-admin-primary bg-admin-primary/20' : 'border-admin-border/50 text-admin-text-dim'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Geographic Grid */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">Regional_Geo_Matrix</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-admin-text-dim uppercase">Continent</label>
                            <select
                                value={form.region.continent}
                                onChange={(e) => setForm({ ...form, region: { ...form.region, continent: e.target.value as any } })}
                                className="w-full bg-admin-bg border border-admin-border text-admin-text text-[10px] font-black py-2 px-1 outline-none"
                            >
                                {CONTINENTS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-admin-text-dim uppercase">Scope</label>
                            <select
                                value={form.region.geo_scope}
                                onChange={(e) => setForm({ ...form, region: { ...form.region, geo_scope: e.target.value as any } })}
                                className="w-full bg-admin-bg border border-admin-border text-admin-text text-[10px] font-black py-2 px-1 outline-none"
                            >
                                {GEO_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput label="Subregion_ID" value={form.region.subregion} onChange={(val) => setForm({ ...form, region: { ...form.region, subregion: val as string } })} placeholder="e.g. east_asia" />
                        <AdminInput label="Country_Code" value={form.region.country} onChange={(val) => setForm({ ...form, region: { ...form.region, country: val as string } })} placeholder="e.g. GE" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <AdminInput label="Timezone_Matrix" value={form.region.timezone} onChange={(val) => setForm({ ...form, region: { ...form.region, timezone: val as string } })} placeholder="UTC+4" />
                        <AdminInput label="System_Language" value={form.region.language} onChange={(val) => setForm({ ...form, region: { ...form.region, language: val as string } })} />
                    </div>
                </div>

                {/* 5. Logic Requirements */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-admin-primary uppercase tracking-widest border-l-2 border-admin-primary pl-2">System_Thresholds</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <AdminInput label="Min_Level" type="number" value={form.min_level} onChange={(val) => setForm({ ...form, min_level: Number(val) })} />
                        <AdminInput label="Consistency %" type="number" value={form.required_consistency} onChange={(val) => setForm({ ...form, required_consistency: Number(val) })} />
                        <AdminInput label="Max_Nodes" type="number" value={form.max_participants} onChange={(val) => setForm({ ...form, max_participants: Number(val) })} />
                    </div>
                </div>
            </div>
        </AdminDrawerShell>
    );
};