import ResearchConsole from '@/components/dashboard/ResearchConsole'

export default function ResearchPage() {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary">AI Research Assistant 🧠</h1>
                <p className="text-text-secondary mt-1">
                    Powered by Gemini 2.0 with Real-time Google Search capabilities.
                </p>
            </div>

            <ResearchConsole />
        </div>
    )
}
