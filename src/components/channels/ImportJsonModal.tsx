'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import { importBulkVideos, BulkImportResult } from '@/app/actions/import'

interface ImportJsonModalProps {
    isOpen: boolean
    onClose: () => void
    channelId: string
}

export default function ImportJsonModal({
    isOpen,
    onClose,
    channelId,
}: ImportJsonModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<BulkImportResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    if (!isOpen) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
            setError('Please select a JSON file')
            return
        }

        setFile(selectedFile)
        setError(null)
        setResult(null)

        // Read and preview
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const json = JSON.parse(content)

                // DATA NORMALIZATION
                // 1. Handle { results: [...] } wrapper
                let items = Array.isArray(json) ? json : (json.results || [])

                if (!Array.isArray(items)) {
                    console.error('JSON is not an array:', json)
                    setError('Invalid JSON: Root must be an array or have a "results" array')
                    setFile(null)
                    return
                }

                // 2. Normalize Keys (snake_case -> Title Case for internal logic)
                // The server action expects specific keys, so we map them here for preview
                // Actual mapping will happen in server action too, but let's just show raw for now
                // or Map it to preview format
                const previewItems = items.slice(0, 3).map((item: any) => ({
                    'Video ID': item['Video ID'] || item.video_id,
                    'Title Variant 1': item['Title Variant 1'] || item.title_variants?.[0] || item.title
                }))

                setPreview(previewItems)

                // Store the NORMALIZED content back to file if possible, or handle in action?
                // Better: Update handleImport to send the originally parsed/normalized array
                // But we can't easily modify the File object.
                // WE WILL UPDATE THE SERVER ACTION TO HANDLE BOTH FORMATS.
                // For now, just pass validation here.

            } catch (err) {
                console.error('JSON parse error:', err)
                setError('Invalid JSON syntax')
                setFile(null)
            }
        }
        reader.readAsText(selectedFile)
    }

    const handleImport = async () => {
        if (!file) return

        setIsLoading(true)
        setError(null)

        try {
            const content = await file.text()
            const importResult = await importBulkVideos(channelId, content)
            setResult(importResult)
        } catch (err) {
            console.error(err)
            setError('Import failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const reset = () => {
        setFile(null)
        setPreview([])
        setResult(null)
        setError(null)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={reset}
            />

            {/* Modal */}
            <div className="relative glass rounded-xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="space-y-1">
                    <h3 className="text-xl font-medium text-text-primary">
                        Import Videos from JSON
                    </h3>
                    <p className="text-sm text-text-secondary">
                        Upload a JSON file to bulk upload videos.
                    </p>
                </div>

                {/* File Input */}
                {!result && (
                    <div className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                                ${file ? 'border-success/30 bg-success/5' : 'border-border hover:border-text-tertiary cursor-pointer'}
                            `}
                            onClick={() => !file && fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {file ? (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="font-medium text-text-primary">{file.name}</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setFile(null)
                                            setPreview([])
                                        }}
                                        className="text-xs text-text-tertiary hover:text-danger"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-background-elevated text-text-tertiary flex items-center justify-center mx-auto">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <p className="font-medium text-text-primary">Click to upload JSON</p>
                                    <p className="text-xs text-text-tertiary">or drag and drop</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <p className="text-sm text-danger text-center">{error}</p>
                        )}
                    </div>
                )}

                {/* Preview Table */}
                {!result && preview.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-text-tertiary uppercase">Preview (First 3 rows)</p>
                        <div className="bg-background-elevated rounded-lg overflow-hidden border border-border">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-background-surface text-text-secondary font-medium">
                                    <tr>
                                        <th className="p-2 border-b border-border">Row</th>
                                        <th className="p-2 border-b border-border">Video ID</th>
                                        <th className="p-2 border-b border-border">Title</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {preview.map((row, i) => (
                                        <tr key={i}>
                                            <td className="p-2 text-text-tertiary">{i + 1}</td>
                                            <td className="p-2 font-mono text-text-primary">{row['Video ID']}</td>
                                            <td className="p-2 text-text-secondary truncate max-w-[200px]">{row['Title Variant 1']}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Results View */}
                {result && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-background-elevated p-4 rounded-lg text-center border border-border">
                                <p className="text-2xl font-bold text-text-primary">{result.total}</p>
                                <p className="text-xs text-text-tertiary">Total Rows</p>
                            </div>
                            <div className="bg-success/5 p-4 rounded-lg text-center border border-success/20">
                                <p className="text-2xl font-bold text-success">{result.created}</p>
                                <p className="text-xs text-success/80">Created</p>
                            </div>
                            <div className="bg-background-elevated p-4 rounded-lg text-center border border-border">
                                <p className="text-2xl font-bold text-text-secondary">{result.skipped}</p>
                                <p className="text-xs text-text-tertiary">Skipped</p>
                            </div>
                        </div>

                        {result.errors.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-text-tertiary uppercase">Skipped Items</p>
                                <div className="bg-background-elevated rounded-lg p-3 max-h-40 overflow-y-auto space-y-1 border border-border">
                                    {result.errors.map((err, i) => (
                                        <div key={i} className="text-xs flex gap-2">
                                            <span className="font-mono text-text-tertiary w-8">#{err.row}</span>
                                            <span className="text-text-secondary">{err.reason}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    {!result ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={reset}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleImport}
                                disabled={!file || isLoading}
                            >
                                {isLoading ? 'Importing...' : 'Import JSON'}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={reset}
                        >
                            Done
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
