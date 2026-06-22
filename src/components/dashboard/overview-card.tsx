import { cn } from '@/lib/utils'

interface OverviewCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function OverviewCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: OverviewCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <span
                className={cn(
                  'text-xs font-semibold',
                  trend.isPositive ? 'text-green-600' : 'text-red-600',
                )}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
        </div>
        {icon && <div className="ml-4 text-muted-foreground">{icon}</div>}
      </div>
    </div>
  )
}
