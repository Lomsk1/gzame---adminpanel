import React from "react";
import type { RoomsTypes } from "../../types/chat/chat";

interface ChatRoomListProps {
    rooms: RoomsTypes['data'];
    activeRoom: string | null;
    onSelectRoom: (roomId: string) => void;
    onCreateRoom?: () => void;
}

export const ChatRoomList: React.FC<ChatRoomListProps> = ({ rooms, activeRoom, onSelectRoom, onCreateRoom }) => {
    return (
        <div className="w-72 border-r border-admin-border/30 bg-black p-0 flex flex-col">
            {/* Terminal Header */}
            <div className="p-4 border-b border-admin-border/20 bg-admin-primary/5">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-admin-primary uppercase tracking-[0.4em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-admin-primary rounded-full animate-ping" />
                        Network_Nodes
                    </h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {rooms.map((room) => {
                    const isActive = activeRoom === room._id;
                    return (
                        <button
                            key={room._id}
                            onClick={() => onSelectRoom(room._id)}
                            className={`w-full text-left transition-all duration-150 relative group ${isActive
                                ? "bg-admin-primary/10 border-l-2 border-admin-primary"
                                : "hover:bg-white/5 border-l-2 border-transparent"
                                }`}
                        >
                            <div className="p-3 border-y border-r border-admin-border/10 group-hover:border-admin-border/30">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[13px] font-bold tracking-tighter uppercase ${isActive ? "text-admin-primary" : "text-gray-400"}`}>
                                        {isActive && <span className="mr-1">{'>'}</span>}
                                        {room.name}
                                    </span>
                                    <span className="text-[11px] opacity-40 font-mono">
                                        [{room.type.substring(0, 3)}]
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className={`w-1 h-2 ${i <= 3 ? 'bg-admin-primary/40' : 'bg-white/10'}`} />
                                        ))}
                                    </div>
                                    <span className="text-[11px] text-admin-text-muted lowercase font-mono italic opacity-60">
                                        /root/nodes/{room._id.substring(0, 4)}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Terminal Footer Action */}
            <button
                onClick={onCreateRoom}
                className="m-4 border border-dashed border-admin-primary/30 p-2 text-[11px] cursor-pointer text-admin-primary hover:bg-admin-primary/10 transition-all uppercase tracking-widest"
            >
                + Initialize_New_Channel
            </button>
        </div>
    );
};