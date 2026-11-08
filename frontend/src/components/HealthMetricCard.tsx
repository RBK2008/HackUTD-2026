import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { Metric, MonthlyRecord } from "@/data/types";
import { DebtToIncomeTrend } from "@/components/DebtToIncomeTrend";
import { formatPercent, formatCurrency, formatMonths } from "@/lib/format";
import { ProgressRing } from "@/components/ProgressRing";
import { STATUS, StatusPill } from "@/components/Status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function metricValue(metric: Metric) {
  if (metric.unit === "percent") return formatPercent(metric.value);
  if (metric.unit === "dollars") return formatCurrency(metric.value);
  return formatMonths(metric.value);
}

function EmergencyFundVisual({ metric }: { metric: Metric }) {
  const progress = metric.goalProgress ?? 0;

  return (
    <>
      <ProgressRing progress={progress} offset={metric.ringOffset ?? 0} color="var(--primary)">
        <span className="font-serif text-3xl font-semibold tabular-nums">{metric.value}</span>
        <span className="font-serif text-sm text-muted-foreground">{metric.unit}</span>
      </ProgressRing>
      <p className="font-serif text-base font-semibold">{formatPercent(progress)} of your goal</p>
      <StatusPill status={metric.status} />
      <p className="font-serif text-sm font-medium text-muted-foreground">Target: {metric.target}</p>
    </>
  );
}

function DebtToIncomeVisual({ metric }: { metric: Metric }) {

  return (
    <>
      <div
        className="relative mx-auto h-32 w-full max-w-40"
        role="img"
        aria-label={`${formatPercent(metric.value)} of monthly income goes to debt payments`}
      >
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={metric.pieData ?? []}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              innerRadius={42}
              outerRadius={58}
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={STATUS[metric.status].stroke} />
              <Cell fill="var(--muted)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center leading-tight">
          <div>
            <p className="font-serif text-3xl font-semibold tabular-nums">{formatPercent(metric.value)}</p>
            <p className="font-serif text-xs text-muted-foreground">of income</p>
          </div>
        </div>
      </div>
      <StatusPill status={metric.status} />
      <p className="font-serif text-sm font-medium text-muted-foreground">Target: {metric.target}</p>
    </>
  );
}

function CreditUseVisual({ metric }: { metric: Metric }) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-3 whitespace-nowrap">
      <p className="font-serif text-4xl font-semibold tracking-tight tabular-nums">{formatPercent(metric.value)}</p>
      <StatusPill status={metric.status} />
    </div>
  );
}

function CashFlowVisual({ metric }: { metric: Metric }) {
  const axis = metric.cashAxis;
  if (!axis) return null;
  const zeroX = 160;

  return (
    <>
      <svg
        viewBox="0 0 320 120"
        className="h-32 w-full"
        role="img"
        aria-label={`Monthly cash flow is ${formatCurrency(metric.value)} on an axis from negative ${formatCurrency(axis.bound)} to positive ${formatCurrency(axis.bound)}`}
      >
        <line x1={zeroX} y1={20} x2={zeroX} y2={84} stroke="var(--muted-foreground)" strokeWidth={1.5} />
        <rect
          x={axis.barX}
          y={32}
          width={axis.barWidth}
          height={22}
          rx={4}
          fill={axis.tone === "bad" ? "var(--risk)" : "var(--good)"}
        />
        <text
          x={axis.labelX}
          y={43}
          dominantBaseline="middle"
          textAnchor={axis.negative ? "end" : "start"}
          fill="var(--foreground)"
          fontFamily="var(--font-serif)"
          fontSize={16}
          fontWeight={600}
        >
          {formatCurrency(metric.value)}
        </text>
        <line x1={30} y1={84} x2={290} y2={84} stroke="var(--subtle-foreground)" strokeOpacity={0.5} />
        {axis.ticks.map((tick) => (
          <g key={tick.x}>
            <line x1={tick.x} y1={80} x2={tick.x} y2={88} stroke="var(--border)" />
            <text
              x={tick.x}
              y={105}
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontFamily="var(--font-serif)"
              fontSize={13}
            >
              {tick.label}
            </text>
          </g>
        ))}
      </svg>
      <StatusPill status={metric.status} />
      <p className="font-serif text-sm font-medium text-muted-foreground">Target: {metric.target}</p>
    </>
  );
}

function MetricVisual({ metric }: { metric: Metric }) {
  switch (metric.id) {
    case "emergency_fund":
      return <EmergencyFundVisual metric={metric} />;
    case "debt_to_income":
      return <DebtToIncomeVisual metric={metric} />;
    case "credit_utilization":
      return <CreditUseVisual metric={metric} />;
    case "monthly_cash_flow":
      return <CashFlowVisual metric={metric} />;
    default:
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <p className="font-serif text-4xl font-semibold tracking-tight tabular-nums">{metricValue(metric)}</p>
          <StatusPill status={metric.status} />
          <p className="font-serif text-sm font-medium text-muted-foreground">Target: {metric.target}</p>
        </div>
      );
  }
}

export function HealthMetricCard({ metric, months, highlight = false }: { metric: Metric; months: MonthlyRecord[]; highlight?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`${metric.label}: ${metricValue(metric)}. View details`}
          className={cn("flex min-h-64 w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center shadow-soft transition-all hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:p-6", highlight && "border-primary bg-accent ring-2 ring-primary/40")}
        >
          <span className="flex w-full items-center justify-center gap-2 text-center font-serif text-base font-medium text-muted-foreground">
            <span>{metric.label}</span>
            <Info className="h-4 w-4 shrink-0 text-subtle-foreground" aria-hidden="true" />
          </span>
          <MetricVisual metric={metric} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl bg-card">
        <DialogHeader className="text-center sm:text-center">
          <div className="mb-1 flex justify-center">
            <StatusPill status={metric.status} />
          </div>
          <DialogTitle className="font-serif text-xl">{metric.label}</DialogTitle>
          <DialogDescription className="pt-2 text-base leading-relaxed text-foreground">
            {metric.explanation}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted p-4 text-center">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Current</p>
            <p className="mt-1 font-serif text-2xl font-semibold tabular-nums">{metricValue(metric)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Target</p>
            <p className="mt-1 font-serif text-lg font-semibold">{metric.target}</p>
          </div>
        </div>
        {metric.id === "debt_to_income" && <DebtToIncomeTrend months={months} />}
      </DialogContent>
    </Dialog>
  );
}
