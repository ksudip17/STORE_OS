'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { formatCurrencyShort } from '@/lib/utils'

interface MonthlyData {
  month: string
  sales: number
  payments: number
  net: number
}

interface TopDue {
  name: string
  due: number
}

interface Distribution {
  name: string
  value: number
  color: string
}

interface Props {
  monthlyData: MonthlyData[]
  topDue: TopDue[]
  distribution: Distribution[]
}

// Custom tooltip for bar chart
function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-xs">
      <p className="font-medium text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: ₹{p.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  )
}

export function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        Monthly Sales vs Collections
      </h3>
      <p className="text-xs text-slate-400 mb-4">Last 6 months</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={v => formatCurrencyShort(v)}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CurrencyTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
          <Bar
            dataKey="sales"
            name="Sales (Due added)"
            fill="#ef4444"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="payments"
            name="Payments (Collected)"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TopDueChart({ data }: { data: TopDue[] }) {
  if (!data.length) return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-center h-[280px]">
      <p className="text-slate-400 text-sm">No outstanding dues</p>
    </div>
  )

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        Top Customers by Due
      </h3>
      <p className="text-xs text-slate-400 mb-4">Highest outstanding balances</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={v => formatCurrencyShort(v)}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Due']}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}
          />
          <Bar
            dataKey="due"
            fill="#f87171"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DistributionPieChart({ data }: { data: Distribution[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
        Customer Balance Distribution
      </h3>
      <p className="text-xs text-slate-400 mb-4">
        {total} total customers
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: any, name: any) => [
              `${v} customers (${total ? Math.round(Number(v) / total * 100) : 0}%)`,
              name
            ]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value, entry: any) => (
              `${value}: ${entry.payload.value}`
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}