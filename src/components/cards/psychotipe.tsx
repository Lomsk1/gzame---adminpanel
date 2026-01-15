import { GlassCard } from "../cards/card-glass";
import { PSYCHOTYPE_CONFIG, type Psychotype } from "../../types/user/user";

// Mapping the exact data structure from your StatsUserTypes
interface DistributionItem {
    _id: Psychotype;
    count: number;
}

interface NeuralDistributionProps {
    primary: DistributionItem[];
    totalUsers: number;
    totalSubPsichotypeUsers: number,
    subPsychotypeDistribution: DistributionItem[]
}

export const NeuralDistributionCard = ({
    primary,
    totalUsers,
    totalSubPsichotypeUsers,
    subPsychotypeDistribution
}: NeuralDistributionProps) => {
    return (
        <GlassCard className="h-full" glow>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-3 bg-admin-primary animate-pulse" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-admin-primary">
                    Neural_Distribution
                </h3>
            </div>

            <div className="space-y-8">
                {/* 1. Global Cohort Section */}
                <section className="space-y-3">
                    <div className="flex justify-between items-end border-b border-admin-border/30 pb-1">
                        <p className="text-[9px] font-mono text-admin-text-dim uppercase tracking-widest">Main_Psychotype</p>
                        <p className="text-[10px] font-mono text-admin-text-dim/50">{totalUsers} UNITS</p>
                    </div>
                    <div className="space-y-4">
                        {primary.map((item) => (
                            <ProgressBar
                                key={`primary-${item._id}`}
                                id={item._id}
                                count={item.count}
                                total={totalUsers}
                            />
                        ))}
                    </div>
                </section>

                {/* 2. Subscriber Core Section */}
                <section className="space-y-3">
                    <div className="flex justify-between items-end border-b border-admin-accent/30 pb-1">
                        <p className="text-[9px] font-mono text-admin-accent uppercase tracking-widest">Sub_Psychotype</p>
                        <p className="text-[10px] font-mono text-admin-accent/50">{totalSubPsichotypeUsers} ACTIVE</p>
                    </div>
                    <div className="space-y-4">
                        {subPsychotypeDistribution.length > 0 ? (
                            subPsychotypeDistribution.map((item) => (
                                <ProgressBar
                                    key={`sub-${item._id}`}
                                    id={item._id}
                                    count={item.count}
                                    total={totalSubPsichotypeUsers}
                                    isSubCard
                                />
                            ))
                        ) : (
                            <div className="py-4 border border-dashed border-admin-border/20 rounded flex items-center justify-center">
                                <p className="text-[9px] italic text-admin-text-dim/40 uppercase tracking-tighter">
                                    No subscriber signatures detected
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </GlassCard>
    );
};

// --- Type-Safe Progress Bar ---

interface ProgressBarProps {
    id: Psychotype;
    count: number;
    total: number;
    isSubCard?: boolean;
}

const ProgressBar = ({ id, count, total, isSubCard }: ProgressBarProps) => {
    // Type-safe lookup with fallback to prevent runtime crashes
    const config = PSYCHOTYPE_CONFIG[id] || {
        bg: 'bg-gray-500',
        color: 'text-gray-500',
        border: 'border-gray-500/20'
    };

    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="group cursor-default">
            <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-tight transition-colors group-hover:text-white ${isSubCard ? 'text-admin-accent' : 'text-admin-text'}`}>
                        {id}
                    </span>
                    {/* Activity Indicator */}
                    <div className={`w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 animate-ping ${config.bg}`} />
                </div>
                <div className="flex items-center gap-2 font-mono">
                    <span className="text-[9px] text-admin-text-dim group-hover:text-admin-text transition-colors">
                        {count.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-admin-primary">
                        {percentage}%
                    </span>
                </div>
            </div>

            {/* Tactical Bar Track */}
            <div className="h-1.5 w-full bg-admin-bg border border-admin-border/30 rounded-sm overflow-hidden p-px relative">
                <div
                    className={`h-full ${config.bg} transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                    style={{ width: `${percentage}%` }}
                >
                    {/* Scanning light shimmer effect */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                </div>
            </div>

            {/* Meta Data shown on hover */}
            <div className="h-0 group-hover:h-3 transition-all duration-300 overflow-hidden">
                <p className="text-[7px] uppercase tracking-[0.2em] text-admin-text-dim/60 font-bold mt-1">
                    Signature_Match: stable // Node_{id?.slice(0, 3)}_Active
                </p>
            </div>
        </div>
    );
};