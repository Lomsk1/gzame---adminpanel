import React from "react";
import { AdminConfirmWrapper } from "../wrapper/wrapper";

interface ChatHeaderProps {
    roomName: string;
    roomType: string;
    participantCount: number;
    isConnected: boolean;
    onBack?: () => void;
    onSettings?: () => void;
    onRefresh?: () => void;
    onDelete: () => void
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ roomName, roomType, participantCount, isConnected, onRefresh, onDelete }) => {
    return (
        <div className="border-b border-admin-border/30 bg-admin-panel/50 px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <h2 className="truncate text-xl font-black tracking-tight text-admin-text">
                            {roomName}
                        </h2>
                        <span className="rounded-md border border-admin-primary/30 bg-admin-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-admin-primary">
                            {roomType}
                        </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-admin-text-dim">
                        <span className="inline-flex items-center gap-1">
                            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-admin-success" : "bg-admin-error"}`} />
                            {isConnected ? "Connected" : "Disconnected"}
                        </span>
                        <span>{participantCount} online now</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onRefresh}
                        className="rounded-lg border border-admin-border bg-admin-bg/40 px-3 py-2 text-xs font-semibold text-admin-text hover:border-admin-primary/40 hover:text-admin-primary transition-colors"
                    >
                        Refresh
                    </button>
                    <AdminConfirmWrapper
                        title="Delete room?"
                        description={`This permanently deletes "${roomName}" and all its messages.`}
                        onConfirm={onDelete}
                        variant="danger"
                        isFixed
                        confirmWord="delete"
                    >
                        <button
                            type="button"
                            className="rounded-lg border border-admin-error/40 bg-admin-error/10 px-3 py-2 text-xs font-semibold text-admin-error hover:bg-admin-error/20 transition-colors"
                        >
                            Delete room
                        </button>
                    </AdminConfirmWrapper>
                </div>
            </div>
        </div>
    );
};