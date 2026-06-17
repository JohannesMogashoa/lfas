"use client";

import { Check } from "lucide-react";
import { cn } from "@lfas/ui/lib/utils";

interface Step {
    number: number;
    label: string;
}

const steps: Step[] = [
    { number: 1, label: "Upload" },
    { number: 2, label: "Review" },
    { number: 3, label: "Analyse" },
];

const Stepper = ({ currentStep }: { currentStep: number }) => {
    return (
        <nav
            aria-label="Statement Analysis"
            className="w-full"
        >
            <ol className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.number;
                    const isCurrent = currentStep === step.number;
                    const isUpcoming = currentStep < step.number;

                    return (
                        <li
                            key={step.number}
                            className="flex items-center"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-sm font-bold transition-all duration-300",
                                        isCompleted &&
                                            "border-[hsl(var(--success))] bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]",
                                        isCurrent &&
                                            "border-primary bg-primary text-primary-foreground",
                                        isUpcoming &&
                                            "border-muted-foreground/30 bg-transparent text-muted-foreground/50"
                                    )}
                                    aria-current={
                                        isCurrent ? "step" : undefined
                                    }
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-medium tracking-widest uppercase transition-colors duration-300",
                                        isCompleted &&
                                            "text-[hsl(var(--success))]",
                                        isCurrent && "text-foreground",
                                        isUpcoming && "text-muted-foreground/50"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "mx-2 h-0.5 flex-1 transition-colors duration-300 md:mx-4",
                                        currentStep > step.number + 1
                                            ? "bg-[hsl(var(--success))]"
                                            : currentStep > step.number
                                              ? "bg-[hsl(var(--success))]"
                                              : "bg-muted"
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Stepper;
