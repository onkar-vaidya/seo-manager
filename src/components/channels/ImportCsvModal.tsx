'use client'

import { useState, useRef } from 'react'
import Button from '@/components/ui/Button'
import { importBulkVideos, BulkImportResult } from '@/app/actions/import'

interface ImportCsvModalProps {
    isOpen: boolean
    onClose: () => void
    channelId: string
}

export default function ImportCsvModal({
    isOpen,
    onClose,
    channelId,
}: ImportCsvModalProps) {
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

        if (!selectedFile.name.endsWith('.csv') && selectedFile.type !== 'text/csv') {
            setError('Please select a CSV file')
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
                const lines = content.split(/\r?\n/).filter(line => line.trim())

                if (lines.length > 1) {
                    // Simple parsing for preview (first few rows)
                    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))

                    const previewItems = lines.slice(1, 4).map(line => {
                        const values: string[] = []
                        let inQuote = false
                        let val = ''
                        for (let i = 0; i < line.length; i++) {
                            const char = line[i]
                            if (char === '"' && line[i + 1] === '"') {
                                val += '"'; i++;
                            } else if (char === '"') {
                                inQuote = !inQuote
                            } else if (char === ',' && !inQuote) {
                                values.push(val.trim()); val = ''
                            } else {
                                val += char
                            }
                        }
                        values.push(val.trim())

                        const row: any = {}
                        headers.forEach((h, i) => {
                            row[h] = values[i]?.replace(/^"|"$/g, '') || ''
                        })
                        return row
                    })
                    setPreview(previewItems)
                }
            } catch (err) {
                console.error('CSV parse error:', err)
                setError('Invalid CSV file')
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
            const importResult = await importBulkVideos(channelId, content, 'csv')
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
            <div className="relative glass rounded-xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="space-y-1">
                    <h3 className="text-xl font-medium text-text-primary">
                        Import Videos from CSV
                    </h3>
                    <p className="text-sm text-text-secondary">
                        Upload a CSV file to bulk upload videos.
                    </p>
                </div>

                {/* Table Schema Info */}
                {!result && !file && (
                    <div className="p-4 bg-background-elevated rounded-lg border border-border space-y-2">
                        <p className="text-xs font-semibold text-text-secondary uppercase">Supported Headers (Table Names)</p>
                        <div className="flex flex-wrap gap-2">
                            {['Video ID*', 'Old Title*', 'Description', 'Title Variant 1', 'Title Variant 2', 'Title Variant 3', 'Tags'].map(tag => (
                                <span key={tag} className="px-2 py-1 bg-background-surface rounded text-xs font-mono text-text-primary border border-border">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <p className="text-[10px] text-text-tertiary">* Required fields. Headers are case-insensitive and support snake_case (e.g., video_id, old_title).</p>
                    </div>
                )}

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
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {file ? (
                                <div className="space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                                    <p className="font-medium text-text-primary">Click to upload CSV</p>
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
                                        <th className="p-2 border-b border-border">Raw</th>
                                        <th className="p-2 border-b border-border">Parsed ID</th>
                                        <th className="p-2 border-b border-border">Parsed Title</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {preview.map((row, i) => (
                                        <tr key={i}>
                                            <td className="p-2 text-text-tertiary">{i + 1}</td>
                                            <td className="p-2 font-mono text-text-primary">
                                                {row['Video ID'] || row['video_id'] || row['id']}
                                            </td>
                                            <td className="p-2 text-text-secondary truncate max-w-[200px]">
                                                {row['Old Title'] || row['old_title'] || row['title']}
                                            </td>
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

                        <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success text-center">
                            {result.message}
                        </div>
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
                                {isLoading ? 'Importing...' : 'Import CSV'}
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
