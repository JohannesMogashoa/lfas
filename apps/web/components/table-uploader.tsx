"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
    formatBytes,
    useFileUpload,
    type FileMetadata,
    type FileWithPreview,
} from "@/hooks/use-file-upload";
import { Alert, AlertDescription, AlertTitle } from "@lfas/ui/components/alert";
import { Badge } from "@lfas/ui/components/r-badge";

import { cn } from "@lfas/ui/lib/utils";
import { Button } from "@lfas/ui/components/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@lfas/ui/components/table";
import {
    CircleAlertIcon,
    CloudUploadIcon,
    FileArchiveIcon,
    FilePlus,
    FileSpreadsheetIcon,
    FileTextIcon,
    HeadphonesIcon,
    ImageIcon,
    RefreshCwIcon,
    Trash2Icon,
    UploadIcon,
    VideoIcon,
} from "lucide-react";

interface FileUploadItem extends FileWithPreview {
    progress: number;
    status: "uploading" | "completed" | "error";
    error?: string;
}

interface TableUploadProps {
    id?: string;
    name?: string;
    maxFiles?: number;
    maxSize?: number;
    accept?: string;
    multiple?: boolean;
    className?: string;
    onFilesChange?: (files: FileWithPreview[]) => void;
    simulateUpload?: boolean;
    onSubmit: (files: FileWithPreview[]) => Promise<void>;
    inputRef?: React.Ref<HTMLInputElement>;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
    if (!ref) return;

    if (typeof ref === "function") {
        ref(value);
        return;
    }

    ref.current = value;
}

export function TableUploader({
    id,
    name,
    maxFiles = 10,
    maxSize = 50 * 1024 * 1024, // 50MB
    accept = "*",
    multiple = true,
    className,
    onFilesChange,
    simulateUpload = true,
    inputRef,
    onSubmit,
}: TableUploadProps) {
    const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([]);

    const [
        { isDragging, errors },
        {
            removeFile,
            clearFiles,
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            openFileDialog,
            getInputProps,
        },
    ] = useFileUpload({
        maxFiles,
        maxSize,
        accept,
        multiple,
        onFilesChange: (newFiles) => {
            onFilesChange?.(newFiles);

            // Convert to upload items when files change, preserving existing status
            const newUploadFiles = [...newFiles, ...uploadFiles].map((file) => {
                // Check if this file already exists in uploadFiles
                const existingFile = uploadFiles.find(
                    (existing) => existing.id === file.id
                );

                if (existingFile) {
                    // Preserve existing file status and progress
                    return {
                        ...existingFile,
                        ...file, // Update any changed properties from the file
                    };
                } else {
                    // New file - set to uploading
                    return {
                        ...file,
                        progress: 0,
                        status: "uploading" as const,
                    };
                }
            });
            setUploadFiles(newUploadFiles);
        },
    });

    const inputProps = getInputProps({ id, name });

    const setInputRef = useCallback(
        (node: HTMLInputElement | null) => {
            assignRef(inputProps.ref, node);
            assignRef(inputRef, node);
        },
        [inputProps.ref, inputRef]
    );

    // Simulate upload progress
    useEffect(() => {
        if (!simulateUpload) return;

        const interval = setInterval(() => {
            setUploadFiles((prev) =>
                prev.map((file) => {
                    if (file.status !== "uploading") return file;

                    const increment = Math.random() * 15 + 5; // 5-20% increment
                    const newProgress = Math.min(
                        file.progress + increment,
                        100
                    );

                    if (newProgress >= 100) {
                        // Randomly decide if upload succeeds or fails
                        const shouldFail = Math.random() < 0.1; // 10% chance to fail
                        return {
                            ...file,
                            progress: 100,
                            status: shouldFail
                                ? ("error" as const)
                                : ("completed" as const),
                            error: shouldFail
                                ? "Upload failed. Please try again."
                                : undefined,
                        };
                    }

                    return { ...file, progress: newProgress };
                })
            );
        }, 500);

        return () => clearInterval(interval);
    }, [simulateUpload]);

    const removeUploadFile = (fileId: string) => {
        setUploadFiles((prev) => prev.filter((file) => file.id !== fileId));
        removeFile(fileId);
    };

    const retryUpload = (fileId: string) => {
        setUploadFiles((prev) =>
            prev.map((file) =>
                file.id === fileId
                    ? {
                          ...file,
                          progress: 0,
                          status: "uploading" as const,
                          error: undefined,
                      }
                    : file
            )
        );
    };

    const getFileIcon = (file: File | FileMetadata) => {
        const type = file instanceof File ? file.type : file.type;
        if (type.startsWith("image/")) return <ImageIcon className="size-4" />;
        if (type.startsWith("video/")) return <VideoIcon className="size-4" />;
        if (type.startsWith("audio/"))
            return <HeadphonesIcon className="size-4" />;
        if (type.includes("pdf")) return <FileTextIcon className="size-4" />;
        if (type.includes("word") || type.includes("doc"))
            return <FileTextIcon className="size-4" />;
        if (type.includes("excel") || type.includes("sheet"))
            return <FileSpreadsheetIcon className="size-4" />;
        if (type.includes("zip") || type.includes("rar"))
            return <FileArchiveIcon className="size-4" />;
        return <FileTextIcon className="size-4" />;
    };

    const getFileTypeLabel = (file: File | FileMetadata) => {
        const type = file instanceof File ? file.type : file.type;
        if (type.startsWith("image/")) return "Image";
        if (type.startsWith("video/")) return "Video";
        if (type.startsWith("audio/")) return "Audio";
        if (type.includes("pdf")) return "PDF";
        if (type.includes("word") || type.includes("doc")) return "Word";
        if (type.includes("excel") || type.includes("sheet")) return "Excel";
        if (type.includes("zip") || type.includes("rar")) return "Archive";
        if (type.includes("json")) return "JSON";
        if (type.includes("text")) return "Text";
        return "File";
    };

    const handleSubmit = useCallback(async () => {
        if (uploadFiles.length === 0) {
            console.log("Upload files are empty");
            return;
        }

        await onSubmit(uploadFiles);
    }, [onSubmit, uploadFiles]);

    return (
        <div className={cn("w-full space-y-4", className)}>
            {/* Upload Area */}
            <div
                className={cn(
                    "relative rounded-lg border border-dashed p-6 text-center transition-colors",
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    {...inputProps}
                    ref={setInputRef}
                    className="sr-only"
                />

                <div className="flex flex-col items-center gap-4">
                    <div
                        className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full bg-muted transition-colors",
                            isDragging
                                ? "border-primary bg-primary/10"
                                : "border-muted-foreground/25"
                        )}
                    >
                        <UploadIcon className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium">
                            Drop files here or{" "}
                            <button
                                type="button"
                                onClick={openFileDialog}
                                className="cursor-pointer text-primary underline-offset-4 hover:underline"
                            >
                                browse files
                            </button>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Maximum file size: {formatBytes(maxSize)} • Maximum
                            files: {maxFiles}
                        </p>
                    </div>
                </div>
            </div>

            {/* Files Table */}
            {uploadFiles.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                            Files ({uploadFiles.length})
                        </h3>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                onClick={openFileDialog}
                                variant="outline"
                                size="sm"
                            >
                                <FilePlus className="h-4 w-4" />
                                Add files
                            </Button>
                            <Button
                                type="button"
                                onClick={clearFiles}
                                variant="outline-destructive"
                                size="sm"
                            >
                                <Trash2Icon className="h-4 w-4" />
                                Remove all
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow className="text-xs">
                                    <TableHead className="h-9 ps-4">
                                        Name
                                    </TableHead>
                                    <TableHead className="h-9">Type</TableHead>
                                    <TableHead className="h-9">Size</TableHead>
                                    <TableHead className="h-9 w-[100px] ps-4">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {uploadFiles.map((fileItem) => (
                                    <TableRow key={fileItem.id}>
                                        <TableCell className="py-2 ps-1.5">
                                            <div className="flex items-center gap-1">
                                                <div
                                                    className={cn(
                                                        "relative flex size-8 shrink-0 items-center justify-center text-muted-foreground/80"
                                                    )}
                                                >
                                                    {fileItem.status ===
                                                    "uploading" ? (
                                                        <div className="relative">
                                                            {/* Circular progress background */}
                                                            <svg
                                                                className="size-8 -rotate-90"
                                                                viewBox="0 0 32 32"
                                                            >
                                                                <circle
                                                                    cx="16"
                                                                    cy="16"
                                                                    r="14"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    className="text-muted-foreground/20"
                                                                />
                                                                {/* Progress circle */}
                                                                <circle
                                                                    cx="16"
                                                                    cy="16"
                                                                    r="14"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeDasharray={`${2 * Math.PI * 14}`}
                                                                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - fileItem.progress / 100)}`}
                                                                    className="text-primary transition-all duration-300"
                                                                    strokeLinecap="round"
                                                                />
                                                            </svg>
                                                            {/* File icon in center */}
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                {getFileIcon(
                                                                    fileItem.file
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="not-[]:size-8 flex items-center justify-center">
                                                            {getFileIcon(
                                                                fileItem.file
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="flex items-center gap-1 truncate text-sm font-medium">
                                                    {fileItem.file.name}
                                                    {fileItem.status ===
                                                        "error" && (
                                                        <Badge
                                                            variant="destructive-light"
                                                            size="sm"
                                                        >
                                                            Error
                                                        </Badge>
                                                    )}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {getFileTypeLabel(
                                                    fileItem.file
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-2 text-sm text-muted-foreground">
                                            {formatBytes(fileItem.file.size)}
                                        </TableCell>
                                        <TableCell className="py-2">
                                            <div className="flex items-center gap-1">
                                                {fileItem.status === "error" ? (
                                                    <Button
                                                        type="button"
                                                        onClick={() =>
                                                            retryUpload(
                                                                fileItem.id
                                                            )
                                                        }
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-destructive/80 hover:text-destructive"
                                                    >
                                                        <RefreshCwIcon className="size-3.5" />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        onClick={() =>
                                                            removeUploadFile(
                                                                fileItem.id
                                                            )
                                                        }
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                    >
                                                        <Trash2Icon className="size-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                variant="outline"
                                size="sm"
                            >
                                <CloudUploadIcon className="h-4 w-4" />
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
                <Alert
                    variant="destructive"
                    className="mt-5"
                >
                    <CircleAlertIcon />
                    <AlertTitle>File upload error(s)</AlertTitle>
                    <AlertDescription>
                        {errors.map((error, index) => (
                            <p
                                key={index}
                                className="last:mb-0"
                            >
                                {error}
                            </p>
                        ))}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
