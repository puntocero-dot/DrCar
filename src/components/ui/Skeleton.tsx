export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-800/50 rounded-xl ${className}`} />
  );
}

export function CarCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
      <Skeleton className="h-48 rounded-none" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-12 w-full mt-6" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
