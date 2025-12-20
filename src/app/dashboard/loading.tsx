export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Greetings Skeleton */}
            <div className="mb-8">
                <div className="h-8 w-48 bg-background-elevated rounded mb-2"></div>
                <div className="h-6 w-96 bg-background-elevated rounded opacity-60"></div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass p-6 rounded-xl flex items-start justify-between h-32">
                        <div className="space-y-3 w-full">
                            <div className="h-4 w-24 bg-background-elevated rounded"></div>
                            <div className="h-8 w-16 bg-background-elevated rounded"></div>
                        </div>
                        <div className="h-12 w-12 bg-background-elevated rounded-lg"></div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Skeleton */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="h-6 w-32 bg-background-elevated rounded"></div>
                    <div className="h-4 w-16 bg-background-elevated rounded"></div>
                </div>

                <div className="glass rounded-xl overflow-hidden">
                    <div className="divide-y divide-border">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-background-elevated"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 w-48 bg-background-elevated rounded"></div>
                                            <div className="h-3 w-32 bg-background-elevated rounded opacity-60"></div>
                                        </div>
                                    </div>
                                    <div className="h-6 w-16 bg-background-elevated rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
