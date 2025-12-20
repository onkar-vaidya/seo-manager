export default function VideosLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-64 bg-background-elevated rounded-lg"></div>
                    <div className="h-10 w-24 bg-background-elevated rounded-lg"></div>
                </div>
            </div>

            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="glass p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-16 h-10 bg-background-elevated rounded-lg"></div>
                            <div className="space-y-2 flex-1 max-w-md">
                                <div className="h-5 w-3/4 bg-background-elevated rounded"></div>
                                <div className="h-4 w-1/2 bg-background-elevated rounded opacity-60"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-20 bg-background-elevated rounded-lg"></div>
                            <div className="h-8 w-8 bg-background-elevated rounded-lg"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
