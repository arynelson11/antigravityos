
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepCardProps {
    step: number;
    title: string;
    description?: string;
    active?: boolean;
    completed?: boolean;
}

export function StepCard({ step, title, description, active, completed }: StepCardProps) {
    return (
        <div
            className={cn(
                "flex items-start gap-4 p-4 rounded-xl transition-all duration-300",
                active
                    ? "bg-white text-black shadow-lg translate-x-2"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0",
                    active ? "bg-black text-white" : "bg-white/10 text-gray-500",
                    completed && "bg-green-500 text-white"
                )}
            >
                {completed ? <Check size={14} /> : step}
            </div>

            <div className="flex flex-col">
                <span className={cn("font-bold text-sm", active ? "text-black" : "text-gray-300")}>
                    {title}
                </span>
                {description && (
                    <span className={cn("text-xs mt-1", active ? "text-gray-600" : "text-gray-500")}>
                        {description}
                    </span>
                )}
            </div>
        </div>
    );
}
