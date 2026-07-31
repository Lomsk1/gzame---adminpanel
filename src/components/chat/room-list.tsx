import React from "react";
import type { RoomsTypes } from "../../types/chat/chat";

interface ChatRoomListProps {
    rooms: RoomsTypes['data'];
    activeRoom: string | null;
    onSelectRoom: (roomId: string) => void;
    onCreateRoom?: () => void;
    title?: string;
    description?: string;
    emptyMessage?: string;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({
    rooms = [],
    activeRoom,
    onSelectRoom,
    onCreateRoom,
    title = "Public rooms",
    description = "Monitor and moderate public communities in real time.",
    emptyMessage = "No public rooms available yet."
}) => {
    const safeRooms = Array.isArray(rooms) ? rooms : [];
    const psychotypes = ["STALKER", "WARRIOR", "SHAMAN", "ARCHITECT", "SPARK", "ANOMALY"];

    const getPsychotype = (room: RoomsTypes["data"][number]) => {
        const candidate = (room as RoomsTypes["data"][number] & { psychotype?: string }).psychotype;
        if (!candidate) return null;
        const normalized = candidate.toUpperCase();
        return psychotypes.includes(normalized) ? normalized : null;
    };

    const isGlobal = (room: RoomsTypes["data"][number]) =>
        (room.region?.continent || "").toLowerCase() === "global";

    const globalChatRooms = safeRooms.filter((room) => isGlobal(room) && !getPsychotype(room));
    const globalPsychotypeRooms = safeRooms.filter((room) => isGlobal(room) && !!getPsychotype(room));

    const takenIds = new Set([...globalChatRooms, ...globalPsychotypeRooms].map((room) => room._id));
    const byPsychotype = safeRooms
        .filter((room) => !takenIds.has(room._id))
        .reduce<Record<string, RoomsTypes["data"]>>((acc, room) => {
            const key = getPsychotype(room) || "OTHER";
            if (!acc[key]) acc[key] = [];
            acc[key].push(room);
            return acc;
        }, {});

    const groupedPsychotypeKeys = Object.keys(byPsychotype).sort((a, b) => {
        if (a === "OTHER") return 1;
        if (b === "OTHER") return -1;
        return a.localeCompare(b);
    });

    const renderRoom = (room: RoomsTypes["data"][number]) => {
        const isActive = activeRoom === room._id;
        return (
            <button
                key={room._id}
                type="button"
                onClick={() => onSelectRoom(room._id)}
                className={`w-full rounded-xl border px-3 py-3 text-left transition-all ${isActive
                    ? "border-admin-primary/50 bg-admin-primary/10"
                    : "border-admin-border/20 hover:border-admin-primary/30 hover:bg-admin-panel/20"
                    }`}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className={`truncate text-sm font-bold ${isActive ? "text-admin-primary" : "text-admin-text"}`}>
                            {room.name}
                        </p>
                        <p className="mt-1 truncate text-[11px] text-admin-text-dim">
                            {room.description || "No description"}
                        </p>
                    </div>
                    <span className="rounded border border-admin-border/30 px-1.5 py-0.5 text-[10px] uppercase text-admin-text-dim">
                        {room.type}
                    </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase text-admin-text-dim">
                    <span>{room.region.geo_scope || "global"}</span>
                    <span>{room.region.continent || "global"}</span>
                </div>
            </button>
        );
    };

    return (
        <div className="h-[70vh] min-h-120 flex flex-col overflow-hidden rounded-2xl border border-admin-border/30">
            <div className="p-4 border-b border-admin-border/20 bg-linear-to-b from-admin-primary/10 to-transparent">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-admin-primary uppercase tracking-[0.28em]">
                            {title}
                        </h3>
                        <p className="mt-2 text-xs text-admin-text-dim leading-relaxed">
                            {description}
                        </p>
                    </div>
                    <span className="rounded-md border border-admin-primary/30 px-2 py-1 text-[10px] text-admin-primary">
                        {safeRooms.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {safeRooms.length === 0 && (
                    <div className="rounded-lg border border-admin-border/20 bg-admin-panel/20 px-3 py-4 text-center text-xs text-admin-text-dim">
                        {emptyMessage}
                    </div>
                )}

                {globalChatRooms.length > 0 && (
                    <RoomGroup title="Global chat">
                        {globalChatRooms.map(renderRoom)}
                    </RoomGroup>
                )}

                {globalPsychotypeRooms.length > 0 && (
                    <RoomGroup title="Global psychotypes">
                        {globalPsychotypeRooms.map(renderRoom)}
                    </RoomGroup>
                )}

                {groupedPsychotypeKeys.map((key) => (
                    <RoomGroup key={key} title={key === "OTHER" ? "Other rooms" : `${key} rooms`}>
                        {byPsychotype[key].map(renderRoom)}
                    </RoomGroup>
                ))}
            </div>

            <button
                type="button"
                onClick={onCreateRoom}
                className="m-3 mt-0 rounded-lg border border-dashed border-admin-primary/40 px-3 py-2 text-xs uppercase tracking-widest text-admin-primary transition-colors hover:bg-admin-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!onCreateRoom}
            >
                + Create room
            </button>
        </div>
    );
};

function RoomGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-2">
            <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-admin-text-dim">
                {title}
            </p>
            <div className="space-y-2">
                {children}
            </div>
        </section>
    );
}