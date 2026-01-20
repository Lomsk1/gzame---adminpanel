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

export const ChatHeader: React.FC<ChatHeaderProps> = ({ roomName, roomType, isConnected, onRefresh, onDelete }) => {
    return (
        <div className="border-b border-admin-border/40 bg-black/60 backdrop-blur-xl relative overflow-hidden">
            {/* Subtle Scanline Overlay for Header */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-size-[100%_4px] pointer-events-none" />

            <div className="p-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-6">
                    {/* Status Hexagon */}
                    <div className="relative">
                        <div className={`w-10 h-10 flex items-center justify-center border ${isConnected ? 'border-admin-primary' : 'border-admin-error'} rotate-45`}>
                            <span className={`-rotate-45 text-[12px] font-bold ${isConnected ? 'text-admin-primary' : 'text-admin-error'}`}>
                                {isConnected ? 'ON' : 'OFF'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-0.5">
                            <h2 className="text-lg font-black tracking-tighter text-white uppercase italic">
                                {roomName}
                            </h2>
                            <span className="px-2 py-0.5 bg-admin-primary/10 border border-admin-primary/30 text-admin-primary text-[11px] font-bold rounded-sm">
                                {roomType}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-gray-500 font-mono">
                            <span className="flex items-center gap-1">
                                <span className="w-1 h-1 bg-admin-primary rounded-full" />
                                SECURE_CHANNEL: ACTIVE
                            </span>
                            <span>ID: </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={onRefresh} className="p-2 border shrink-0 border-admin-border/20 text-admin-primary hover:bg-admin-primary/10 transition-all text-xs">
                        CMD: RE_SYNC
                    </button>
                    <div className="h-8 w-px bg-admin-border/20 mx-2" />
                    <AdminConfirmWrapper
                        title="TERMINATE_NODE"
                        description={`This will permanently purge "${roomName}" from the database.`}
                        onConfirm={onDelete}
                        variant="danger"
                        isFixed
                        confirmWord='delete'
                    >
                        <button className="p-2 border border-admin-border/20 text-gray-400 hover:text-white transition-all text-xs">
                            TERMINATE
                        </button>
                    </AdminConfirmWrapper>


                </div>
            </div>

            {/* Bottom Telemetry Bar */}
            <div className="bg-admin-primary/5 border-t border-admin-border/10 px-4 py-1 flex justify-between items-center">
                <div className="flex gap-4 text-[10px] font-mono text-admin-primary/60">
                    <span>UPTIME: 12:44:02</span>
                    <span>PACKETS: 1.2k/s</span>
                    <span>BUFFER: 0ms</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-2/3 h-full bg-admin-primary animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
};