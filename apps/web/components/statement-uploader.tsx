"use client"

import React, { startTransition, useRef, useState } from "react"
import { TableUploader } from "./table-uploader"
import {
  type StatementUploadResult,
  uploadFileAction,
} from "@/actions/statement-upload"
import { type FileWithPreview } from "@/hooks/use-file-upload"
import { type BankTransaction } from "@lfas/bank-statement-parser"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@lfas/ui/components/data-table"

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
]

const StatementUploader = () => {
  const statementsFormRef = useRef<HTMLFormElement>(null)
  const statementsInputRef = useRef<HTMLInputElement>(null)
  const [uploadResult, setUploadResult] = useState<StatementUploadResult>()
  const [failed, setFailed] = useState<string[]>([])

  const submitStatements = (dataTransfer: DataTransfer) => {
    if (statementsFormRef.current && statementsInputRef.current) {
      statementsInputRef.current.files = dataTransfer.files

      const formData = new FormData(statementsFormRef.current)

      startTransition(async () => {
        const response = await uploadFileAction(formData)

        if (response.success) {
          setUploadResult(response)
        }
      })
    }
  }

  const handleSubmission = async (files: FileWithPreview[]) => {
    const dataTransfer = new DataTransfer()
    const failedFiles: string[] = []

    files.forEach(({ file }) => {
      if (file instanceof File) {
        dataTransfer.items.add(file)
      } else {
        failedFiles.push(file.name)
      }
    })

    setFailed(failedFiles)
    submitStatements(dataTransfer)
  }

  return (
    <div>
      <form ref={statementsFormRef}>
        <TableUploader
          simulateUpload={false}
          onSubmit={handleSubmission}
          id="statements"
          name="statements"
          inputRef={statementsInputRef}
        />
      </form>

      {uploadResult && uploadResult.transactions.length > 0 && (
        <DataTable columns={columns} data={uploadResult.transactions} />
      )}

      {failed.length > 0 && (
        <div>
          {failed.map((f) => (
            <p key={f}>{f}</p>
          ))}
        </div>
      )}
    </div>
  )
}

export default StatementUploader
