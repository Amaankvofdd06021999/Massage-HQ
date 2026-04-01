"use client"

import { Calendar, DollarSign, Users, Star } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, AreaChart, Area } from "recharts"
import { StatusBadge, bookingStatusVariant } from "@/components/shared/status-badge"
import { StaffAvatar } from "@/components/shared/staff-avatar"
import { useShopData } from "@/lib/data/shop-data"
import { formatPrice } from "@/lib/utils/formatters"
import { useLanguage } from "@/lib/i18n/language-context"
import { cn } from "@/lib/utils"

function StatCard({
  label, value, subtitle, icon: Icon, color,
}: {
  label: string; value: string; subtitle?: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="rounded-2xl border border-brand-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-brand-text-tertiary">{label}</span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", color)}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-brand-text-primary">{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-brand-text-tertiary">{subtitle}</p>}
    </div>
  )
}

function TodayBookings() {
  const { t } = useLanguage()
  const { bookings } = useShopData()
  const todayBookings = bookings.filter((b) => b.date === "2026-02-23")

  return (
    <div className="rounded-2xl border border-brand-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-brand-text-primary">{t("todaysBookings")}</h2>
        <span className="rounded-full bg-brand-primary/15 px-2.5 py-0.5 text-xs font-medium text-brand-primary">
          {todayBookings.length} {t("sessions")}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {todayBookings.map((b) => (
          <div key={b.id} className="flex items-center gap-3 rounded-xl bg-brand-bg-tertiary/50 p-3">
            <StaffAvatar src={b.staffAvatar} name={b.staffName} size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-brand-text-primary">{b.customerName}</p>
                <StatusBadge variant={bookingStatusVariant(b.status)} dot>{b.status}</StatusBadge>
              </div>
              <div className="flex items-center gap-2 text-xs text-brand-text-tertiary">
                <span>{b.startTime} - {b.endTime}</span>
                <span>{t("with")} {b.staffName}</span>
                <span className="font-medium text-brand-text-secondary">{formatPrice(b.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeeklyChart() {
  const { t } = useLanguage()
  const { dashboardStats } = useShopData()
  return (
    <div className="rounded-2xl border border-brand-border bg-card p-4">
      <h2 className="text-sm font-semibold text-brand-text-primary">{t("weeklyRevenue")}</h2>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dashboardStats.weeklyBookings}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
            <XAxis dataKey="day" stroke="var(--brand-text-tertiary)" fontSize={11} />
            <YAxis stroke="var(--brand-text-tertiary)" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              contentStyle={{
                background: "var(--brand-bg-secondary)",
                border: "1px solid var(--brand-border)",
                borderRadius: "8px",
                color: "var(--brand-text-primary)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [formatPrice(value), t("revenue")]}
            />
            <Bar dataKey="revenue" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function MonthlyTrend() {
  const { t } = useLanguage()
  const { dashboardStats } = useShopData()
  return (
    <div className="rounded-2xl border border-brand-border bg-card p-4">
      <h2 className="text-sm font-semibold text-brand-text-primary">{t("monthlyRevenueTrend")}</h2>
      <div className="mt-3 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dashboardStats.monthlyRevenue}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--brand-border)" />
            <XAxis dataKey="month" stroke="var(--brand-text-tertiary)" fontSize={11} />
            <YAxis stroke="var(--brand-text-tertiary)" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              contentStyle={{
                background: "var(--brand-bg-secondary)",
                border: "1px solid var(--brand-border)",
                borderRadius: "8px",
                color: "var(--brand-text-primary)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [formatPrice(value), t("revenue")]}
            />
            <Area type="monotone" dataKey="revenue" stroke="var(--brand-primary)" fill="url(#colorRevenue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function TopPerformers() {
  const { t } = useLanguage()
  const { dashboardStats, staffMembers } = useShopData()
  return (
    <div className="rounded-2xl border border-brand-border bg-card p-4">
      <h2 className="text-sm font-semibold text-brand-text-primary">{t("topPerformers")}</h2>
      <div className="mt-3 space-y-2">
        {dashboardStats.topStaff.map((s, i) => {
          const staff = staffMembers.find((m) => m.nickname === s.name)
          return (
            <div key={s.name} className="flex items-center gap-3 rounded-xl bg-brand-bg-tertiary/50 p-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary/15 text-xs font-bold text-brand-primary">
                {i + 1}
              </span>
              {staff && <StaffAvatar src={staff.avatar} name={staff.name} size="sm" />}
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-text-primary">{s.name}</p>
                <p className="text-xs text-brand-text-tertiary">{s.bookings} {t("bookingsCount")}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star size={12} className="fill-brand-yellow text-brand-yellow" />
                <span className="text-sm font-medium text-brand-text-primary">{s.rating}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { t } = useLanguage()
  const { dashboardStats } = useShopData()
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text-primary">{t("dashboard")}</h1>
      <p className="mt-1 text-sm text-brand-text-secondary">
        {t("todaysOverview")} -{" "}
        {new Date().toLocaleDateString("en", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("todaysBookings")} value={dashboardStats.todayBookings.toString()} subtitle={t("confirmedStat")} icon={Calendar} color="bg-brand-primary/15 text-brand-primary" />
        <StatCard label={t("todaysRevenue")} value={formatPrice(dashboardStats.todayRevenue)} subtitle={t("revenueStat")} icon={DollarSign} color="bg-brand-green/15 text-brand-green" />
        <StatCard label={t("occupancyRate")} value={`${dashboardStats.occupancyRate}%`} subtitle={t("staffActiveStat")} icon={Users} color="bg-brand-blue/15 text-brand-blue" />
        <StatCard label={t("avgRating")} value={dashboardStats.avgRating.toFixed(2)} subtitle={t("last30Days")} icon={Star} color="bg-brand-yellow/15 text-brand-yellow" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <WeeklyChart />
        <MonthlyTrend />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <TodayBookings />
        <TopPerformers />
      </div>
    </div>
  )
}
