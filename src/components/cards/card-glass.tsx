import React from "react";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    glow?: boolean; // Adds a subtle primary-colored glow behind the card
    hoverable?: boolean; // Adds lift and increased brightness on hover
    title?: string,
    onClick?: () => void
}

/* Change bg opacity from 40 to 60 for better readability */

export const GlassCard = ({ children, className = "", glow = false, hoverable = false, title, onClick }: GlassCardProps) => {

    return (
        <div className={`relative bg-admin-panel/60 backdrop-blur-md border border-admin-border/50 rounded-2xl shadow-2xl ${glow ? 'shadow-[0_0_40px_rgba(59,130,246,0.15)]' : ''} ${hoverable ? 'transition-all duration-300 hover:bg-admin-panel/80 hover:border-admin-primary/40' : ''} ${className}`} title={title} onClick={onClick}>
            <div className="absolute inset-0 bg-admin-bg/20 rounded-2xl pointer-events-none" />
            <div className="relative z-20 p-6">
                {children}
            </div>
        </div>
    );
};