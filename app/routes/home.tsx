import type { ReactElement } from "react";
import { useNavigate } from "react-router";
import { PageLayout } from "../components/layout/PageLayout";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

// Sample data for demonstration
const metrics = [
  {
    label: "Total Revenue (Demo)",
    value: "$124,590",
    change: "+12.5%",
    trend: "up" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "New Leads (Demo)",
    value: "48",
    change: "+24%",
    trend: "up" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "Active Orders (Demo)",
    value: "23",
    change: "-3.4%",
    trend: "down" as const,
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
];

const revenueData = [
  { month: "Jan", value: 35000 },
  { month: "Feb", value: 42000 },
  { month: "Mar", value: 38000 },
  { month: "Apr", value: 55000 },
  { month: "May", value: 48000 },
  { month: "Jun", value: 62000 },
];

function RevenueGraph(): ReactElement {
  const max = 70000;
  return (
    <div className="relative h-64 w-full mt-6">
      {/* Y-Axis Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between text-xs text-surface-400 dark:text-surface-500 pointer-events-none z-0">
        {[70, 52.5, 35, 17.5, 0].map((val, i) => (
          <div key={i} className="flex items-center w-full">
            <span className="w-8 text-right mr-3 opacity-60">${Math.round(val)}k</span>
            <div className="flex-1 h-px bg-surface-100 dark:bg-surface-800/60 dashed" />
          </div>
        ))}
      </div>
      
      {/* Chart Area */}
      <div className="absolute inset-0 ml-11 mb-6 z-10">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" className="text-primary-500" stopOpacity="0.2" />
              <stop offset="100%" stopColor="currentColor" className="text-primary-500" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <path
            d={`M0,100 ${revenueData.map((d, i) => {
              const x = (i / (revenueData.length - 1)) * 100;
              const y = 100 - (d.value / max) * 100;
              return `L${x},${y}`;
            }).join(" ")} L100,100 Z`}
            fill="url(#chartGradient)"
            className="transition-all duration-500 ease-out"
          />
          
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={revenueData.map((d, i) => {
              const x = (i / (revenueData.length - 1)) * 100;
              const y = 100 - (d.value / max) * 100;
              return `${x},${y}`;
            }).join(" ")}
            className="text-primary-500 transition-all duration-500 ease-out vector-effect-non-scaling-stroke"
          />
        </svg>

        {/* HTML Overlay for Dots (Prevents distortion) */}
        <div className="absolute inset-0 pointer-events-none">
          {revenueData.map((d, i) => {
            const x = (i / (revenueData.length - 1)) * 100;
            const y = 100 - (d.value / max) * 100;
            return (
              <div 
                key={i}
                className="absolute w-3 h-3 bg-white dark:bg-surface-900 border-2 border-primary-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform cursor-pointer pointer-events-auto group"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                 {/* Tooltip */}
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface-900 text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                    ${(d.value / 1000).toFixed(1)}k
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="absolute bottom-0 left-11 right-0 flex justify-between z-0">
        {revenueData.map((d) => (
          <span key={d.month} className="text-xs text-surface-500 dark:text-surface-400 font-medium translate-x-[-50%] last:translate-x-[-100%] first:translate-x-0 w-8 text-center">
            {d.month}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard(): ReactElement {
  const navigate = useNavigate();

  return (
    <PageLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <PageHeader
        title="Dashboard (Demo)"
        description="Welcome to the demo! Explore working CRUD with Customers & Invoices."
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <Card
            key={metric.label}
            className="relative overflow-hidden hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
            style={{ animationDelay: `${0.1 + index * 0.05}s`, animationFillMode: 'both' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">{metric.label}</p>
                <p className="text-3xl font-bold text-surface-900 dark:text-surface-100 tracking-tight mb-2">{metric.value}</p>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-sm font-semibold ${
                      metric.trend === "up" ? "text-primary-600 dark:text-primary-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {metric.change}
                  </span>
                  <span className="text-xs text-surface-500 dark:text-surface-400">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                {metric.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card className="animate-fade-up flex flex-col" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100 tracking-tight">Revenue Trend</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400">Monthly revenue performance</p>
            </div>
            <div className="flex gap-2">
               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium border border-green-100 dark:border-green-800">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  +12.5%
               </span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
             <RevenueGraph />
          </div>
        </Card>

        {/* Sales Pipeline Placeholder */}
        <Card className="animate-fade-up" style={{ animationDelay: '0.35s', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100 tracking-tight">Sales Pipeline (Demo)</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400">Current opportunities by stage</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/sales/leads")}>
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {[
              { stage: "Qualified", count: 12, value: "$45,300", color: "bg-teal-500" },
              { stage: "Proposal", count: 8, value: "$32,100", color: "bg-primary-500" },
              { stage: "Negotiation", count: 5, value: "$28,900", color: "bg-amber-500" },
              { stage: "Closed Won", count: 15, value: "$124,500", color: "bg-primary-600" },
            ].map((stage) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-surface-700 dark:text-surface-300">{stage.stage}</span>
                  <span className="text-sm text-surface-600 dark:text-surface-400">{stage.count} deals · {stage.value}</span>
                </div>
                <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stage.color}`}
                    style={{ width: `${(stage.count / 40) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          className="hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 cursor-pointer animate-fade-up"
          style={{ animationDelay: '0.45s', animationFillMode: 'both' }}
          onClick={() => navigate("/sales/customers/new")}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">Add Customer</h4>
              <p className="text-sm text-surface-600 dark:text-surface-400">Create a new customer record</p>
            </div>
          </div>
        </Card>

        <Card
          className="hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200 animate-fade-up"
          style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-surface-900 dark:text-surface-100 mb-1">Create Quote</h4>
              <p className="text-sm text-surface-600 dark:text-surface-400">Generate a new quotation</p>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
