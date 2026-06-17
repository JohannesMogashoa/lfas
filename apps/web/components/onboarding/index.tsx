"use client";

import StatementUploader from "./statement-uploader";

import { Button } from "@lfas/ui/components/button";
import { DataTable } from "@lfas/ui/components/data-table";
import { StatementUploadResult } from "@/actions/statement-upload";
import { useState } from "react";
import { type BankTransaction } from "@lfas/bank-statement-parser";
import { ColumnDef } from "@tanstack/react-table";
import Stepper from "./stepper";
import { Card } from "@lfas/ui/components/card";

const columns: ColumnDef<BankTransaction>[] = [
    {
        accessorKey: "date",
        header: "Date",
    },
    {
        accessorKey: "transactionDescription",
        header: "Description",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
    {
        accessorKey: "debitOrCredit",
        header: "Type",
    },
    {
        accessorKey: "balance",
        header: "Running Balance",
    },
];

const OnboardingWizard = () => {
    const [step, setStep] = useState(1);
    const [uploadResult, setUploadResult] = useState<StatementUploadResult>();

    return (
        <Card className="mx-auto max-w-6xl px-4 py-8 md:py-12">
            <div className="mb-10 md:mb-14">
                <Stepper currentStep={step} />
            </div>
            {step === 1 && (
                <StatementUploader
                    onNext={() => setStep(2)}
                    setResult={setUploadResult}
                />
            )}
            {step === 2 && (
                <div className="">
                    {uploadResult ? (
                        <DataTable
                            columns={columns}
                            data={uploadResult.transactions}
                        />
                    ) : (
                        <div></div>
                    )}
                    <div className="mt-6 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => setStep(1)}
                            className="text-muted-foreground"
                        >
                            Back to Uploading
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => setStep(3)}
                            className="font-medium tracking-wider uppercase"
                        >
                            Continue to Analysis
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default OnboardingWizard;
