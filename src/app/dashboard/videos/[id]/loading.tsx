export default function VideoDetailLoading() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-pulse">
            {/* Breadcrumb Skeleton */}
            <div className="flex items-center gap-2">
                <div className="h-4 w-16 bg-background-elevated rounded"></div>
                <span>/</span>
                <div className="h-4 w-24 bg-background-elevated rounded"></div>
                <span>/</span>
                <div className="h-4 w-12 bg-background-elevated rounded"></div>
            </div>

            {/* Header Skeleton */}
            <div className="space-y-3">
                <div className="h-10 w-3/4 bg-background-elevated rounded mb-4"></div>

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-32 bg-background-elevated rounded-lg"></div>
                        <div className="h-8 w-24 bg-background-elevated rounded-lg"></div>
                    </div>
                    <div className="h-10 w-10 bg-background-elevated rounded-lg"></div>
                </div>
            </div>

            {/* SEO Info Skeleton */}
            <div className="space-y-6">
                <div className="h-8 w-48 bg-background-elevated rounded"></div>

                {/* Content Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass p-6 rounded-xl space-y-4">
                            <div className="h-6 w-32 bg-background-elevated rounded"></div>
                            <div className="space-y-2">
                                <div className="h-4 w-full bg-background-elevated rounded"></div>
                                <div className="h-4 w-5/6 bg-background-elevated rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
