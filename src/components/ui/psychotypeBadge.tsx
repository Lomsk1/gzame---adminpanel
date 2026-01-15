import { GlassCard } from "../cards/card-glass";
import { PSYCHOTYPE_CONFIG, type Psychotype } from "../../types/user/user";

interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    variant?: "primary" | "accent" | "warning" | "error";
    className?: string;
}

export const MetricCard = ({ label, value, subValue, variant = "primary", className = "" }: MetricCardProps) => {
    const glowColors = {
        primary: "group-hover:shadow-[0_0_20px_rgba(var(--admin-primary-rgb),0.1)] hover:border-admin-primary/40",
        accent: "group-hover:shadow-[0_0_20px_rgba(var(--admin-accent-rgb),0.1)] hover:border-admin-accent/40",
        warning: "group-hover:shadow-[0_0_20px_rgba(var(--admin-warning-rgb),0.1)] hover:border-admin-warning/40",
        error: "group-hover:shadow-[0_0_20px_rgba(var(--admin-error-rgb),0.1)] hover:border-admin-error/40",
    };

    const dotColors = {
        primary: "bg-admin-primary",
        accent: "bg-admin-accent",
        warning: "bg-admin-warning",
        error: "bg-admin-error",
    };

    return (
        <div className="group h-full">
            <GlassCard
                className={`p-4 h-full transition-all duration-500 transform group-hover:-translate-y-1 ${glowColors[variant]} ${className}`}
            >
                <div className="flex justify-between items-start mb-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-admin-text-dim group-hover:text-admin-text transition-colors">
                        {label}
                    </p>
                    <div className={`h-1 w-1 rounded-full animate-pulse ${dotColors[variant]}`} />
                </div>

                <div className="flex items-end gap-2">
                    <p className="text-2xl font-black text-admin-text leading-none tracking-tighter">
                        {value}
                    </p>
                    {subValue && (
                        <p className="text-[9px] font-bold pb-1 text-admin-success flex items-center gap-0.5">
                            <span className="animate-bounce">↑</span>{subValue}
                        </p>
                    )}
                </div>
                <div className="mt-3 h-px w-full bg-linear-to-r from-transparent via-admin-border/40 to-transparent group-hover:via-admin-primary/40 transition-all" />
            </GlassCard>
        </div>
    );
};

export const PsychotypeBadge = ({ type }: { type: Psychotype }) => {
    const config = PSYCHOTYPE_CONFIG[type];
    return (
        <span className={`
            px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider
            border transition-all duration-300
            ${config?.color || 'text-gray-400'} 
            ${config?.border || 'border-gray-400/20'} 
            bg-current/5 hover:brightness-125
        `}>
            {type}
        </span>
    );
};