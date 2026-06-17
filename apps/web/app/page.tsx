import OnboardingWizard from "@/components/onboarding";

export default function Page() {
    return (
        <div className="flex min-h-svh p-6">
            <div className="mx-auto flex max-w-lg min-w-0 flex-col items-center justify-center gap-4 text-sm leading-loose">
                <div>
                    <OnboardingWizard />
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                    (Press <kbd>d</kbd> to toggle dark mode)
                </div>
            </div>
        </div>
    );
}
