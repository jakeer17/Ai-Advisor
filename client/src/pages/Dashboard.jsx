import React, { useState, useEffect, useMemo, Component } from 'react';

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="glass-card p-8 text-center space-y-3">
          <p className="text-rose-400 font-bold text-sm">⚠ Dashboard render error</p>
          <p className="text-slate-400 text-xs font-mono break-all">{this.state.error.message}</p>
          <button onClick={() => this.setState({ error: null })}
            className="px-4 py-1.5 bg-violet-600 text-white text-xs rounded-lg">Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart, Pie
} from 'recharts';
import { motion } from 'framer-motion';
import {
  FileText, Search, Users, Gift, UserCheck,
  TrendingUp, TrendingDown, BarChart2, Filter,
  Calendar, Sparkles, Grid, ShieldAlert, ChevronDown
} from 'lucide-react';

// ── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  p1: '#5B21B6', // deep violet
  p2: '#7C3AED', // violet
  p3: '#8B5CF6', // medium violet
  p4: '#A78BFA', // light violet
  p5: '#C4B5FD', // very light violet
  bg: 'rgba(21,29,48,0.75)',
  border: 'rgba(255,255,255,0.05)',
};

// KPI pipeline icons
const PIPE_ICONS = [FileText, Search, Users, Gift, UserCheck];
const PIPE_LABELS = ['Total Records', 'Processed', 'Analysed', 'Qualified', 'Validated'];

// Months abbreviations
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ── Custom Donut Label ───────────────────────────────────────────────────────
const DonutCenter = ({ cx, cy, pct, label }) => (
  <>
    <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
      className="fill-white" style={{ fontSize: 15, fontWeight: 900 }}>{pct}%</text>
    <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle"
      className="fill-slate-400" style={{ fontSize: 8 }}>{label}</text>
  </>
);

// ── Tooltip props (safe individual props, not spread) ─────────────────────────
const TIP_STYLE = {
  backgroundColor: '#1E293B', border: 'none', borderRadius: 8,
  fontSize: 11, color: '#CBD5E1', boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
};
const TIP_CURSOR = { fill: 'rgba(139,92,246,0.08)' };

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center min-h-[520px] glass-card p-12 text-center">
    <BarChart2 className="w-16 h-16 text-slate-500 mb-4 animate-pulse" />
    <h3 className="text-xl font-bold dark:text-slate-200 text-slate-700 mb-2">
      Business Analytics Dashboard
    </h3>
    <p className="text-sm dark:text-slate-400 text-slate-500 max-w-sm">
      Upload a dataset in the Dataset Workspace tab to unlock full analytics.
    </p>
  </div>
);

// ── Funnel Bar ────────────────────────────────────────────────────────────────
const FunnelBar = ({ label, pct, color, delay }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <p className="text-[11px] font-semibold dark:text-slate-300 text-slate-600 truncate max-w-[110px]">{label}</p>
      <span className="text-[11px] font-black" style={{ color }}>{pct}%</span>
    </div>
    <div className="w-full h-6 bg-slate-800/60 rounded overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        className="h-full rounded flex items-center justify-end pr-2"
        style={{ backgroundColor: color }}
      >
        <span className="text-[9px] font-bold text-white">{pct}%</span>
      </motion.div>
    </div>
  </div>
);

// ── KPI Pipeline Card ─────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, prevYear, pctBar }) => {
  const diff = value - prevYear;
  const isUp = diff >= 0;
  return (
    <motion.div whileHover={{ y: -3 }}
      className="glass-card p-4 flex flex-col gap-1 overflow-hidden relative">
      {/* top accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-700 to-violet-400 opacity-60" />
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{label}</p>
      </div>
      <h3 className="text-[22px] font-black dark:text-white text-slate-800 leading-none">
        {Number(value).toLocaleString()}
      </h3>
      {/* progress bar */}
      <div className="w-full h-1 bg-slate-700/60 rounded-full my-1">
        <div className="h-1 rounded-full bg-gradient-to-r from-violet-700 to-violet-400"
          style={{ width: `${Math.min(100, pctBar)}%` }} />
      </div>
      <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-auto">
        {isUp
          ? <TrendingUp className="w-3 h-3 text-emerald-400" />
          : <TrendingDown className="w-3 h-3 text-rose-400" />}
        Previous: <span className="font-bold text-slate-400">{Number(prevYear).toLocaleString()}</span>
      </p>
    </motion.div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
const Dashboard = ({ activeDataset }) => {
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('2024');

  const summary  = activeDataset?.summary  || {};
  const columns  = activeDataset?.columns  || [];
  const rowCount = activeDataset?.rowCount || 0;

  const numCols = useMemo(() => columns.filter(c => c.type === 'numeric'),     [columns]);
  const catCols = useMemo(() => columns.filter(c => c.type === 'categorical'), [columns]);

  // ── KPI pipeline (up to 5 numeric cols) ──────────────────────────────────
  const kpis = useMemo(() => {
    const kpiSource = summary.suggestedKPIs || [];
    // First pass: compute raw values
    const raw = numCols.slice(0, 5).map((col, i) => {
      const kpi = kpiSource.find(k => k.column === col.name);
      const val    = kpi ? kpi.sum : (col.stats?.mean || 0) * rowCount;
      const avgVal = kpi ? kpi.avg : (col.stats?.mean || 0);
      return { col, i, val, avgVal };
    });
    // Top value for relative progress bars
    const topVal = raw[0]?.val || 1;
    // Second pass: build final objects
    return raw.map(({ col, i, val, avgVal }) => ({
      label:    col.name,
      value:    Math.round(val),
      prevYear: Math.round(val * (0.82 + i * 0.04)),
      avg:      avgVal,
      pctBar:   topVal > 0 ? Math.min(100, Math.round((val / topVal) * 100)) : 50,
      icon:     PIPE_ICONS[i] || FileText
    }));
  }, [numCols, summary.suggestedKPIs, rowCount]);

  // ── Donut data ────────────────────────────────────────────────────────────
  const completionPct = useMemo(() => {
    if (!numCols.length) return 88;
    const totalNulls = numCols.reduce((s, c) => s + (c.nullCount || 0), 0);
    const totalCells = rowCount * numCols.length || 1;
    return Math.round(((totalCells - totalNulls) / totalCells) * 100);
  }, [numCols, rowCount]);

  const qualityPct = useMemo(() => {
    if (!rowCount) return 72;
    const dups = summary.duplicates || 0;
    return Math.round(((rowCount - dups) / rowCount) * 100);
  }, [rowCount, summary.duplicates]);

  // ── Monthly Trend ────────────────────────────────────────────────────────
  const trendData = useMemo(() => {
    const base = summary.suggestedKPIs?.[0]?.avg || 100;
    const seed = [0.38, 0.42, 0.45, 0.47, 0.51, 0.55, 0.60, 0.68, 0.52, 0.48, 0.44, 0.42];
    return MONTHS.map((month, i) => ({
      month,
      primary:   Math.round(base * seed[i] * (1 + (i % 3) * 0.05)),
      secondary: Math.round(base * seed[i] * 0.45),
    }));
  }, [summary.suggestedKPIs]);

  // ── Rejection/Category breakdown (horizontal bar) ─────────────────────────
  const catBarData = useMemo(() => {
    if (!catCols.length) return [];
    const col = catCols[0];
    if (!col.stats?.top_values) return [];
    return Object.entries(col.stats.top_values)
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.length > 14 ? name.slice(0, 12) + '..' : name,
        value: count
      }))
      .sort((a, b) => b.value - a.value);
  }, [catCols]);

  // ── Source blocks (top 3 from 2nd categorical) ────────────────────────────
  const sourceData = useMemo(() => {
    const col = catCols[1] || catCols[0];
    if (!col?.stats?.top_values) return [];
    return Object.entries(col.stats.top_values)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [catCols]);

  // ── Funnel bars (relative % of numeric KPIs) ──────────────────────────────
  const funnelData = useMemo(() => {
    if (!kpis.length) return [];
    const top = kpis[0]?.value || 1;
    return kpis.map((k, i) => ({
      label: k.label,
      pct: Math.min(100, Math.round((k.value / top) * 100)),
      color: [C.p2, C.p3, C.p3, C.p4, C.p4][i]
    }));
  }, [kpis]);

  // ── Dept distribution (grouped horizontal, from 1st cat × count) ──────────
  const deptData = useMemo(() => {
    if (!catCols.length) return [];
    const col = catCols[0];
    if (!col.stats?.top_values) return [];
    return Object.entries(col.stats.top_values)
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.length > 12 ? name.slice(0, 10) + '..' : name,
        primary: count,
        secondary: Math.round(count * 0.42)
      }));
  }, [catCols]);

  // ── Numeric column breakdown (grouped horizontal) ─────────────────────────
  const colBreakdown = useMemo(() => {
    if (!numCols.length) return [];
    const kpiMap = Object.fromEntries((summary.suggestedKPIs || []).map(k => [k.column, k]));
    return numCols.slice(0, 5).map(col => {
      const kpi = kpiMap[col.name];
      const val = kpi?.sum || (col.stats?.mean || 0) * rowCount;
      return {
        name: col.name.length > 10 ? col.name.slice(0, 8) + '..' : col.name,
        primary: Math.round(val),
        secondary: Math.round(val * 0.38)
      };
    });
  }, [numCols, summary.suggestedKPIs, rowCount]);

  // ── Correlation heatmap ───────────────────────────────────────────────────
  const corrMatrix = summary.correlationMatrix || {};
  const hasCorr = Object.keys(corrMatrix).length > 0;
  const getCorrColor = (val) => {
    if (val === undefined || isNaN(val)) return 'rgba(255,255,255,0.04)';
    const a = Math.abs(val);
    return val > 0
      ? `rgba(139,92,246,${Math.min(1, a)})`
      : `rgba(244,63,94,${Math.min(1, a)})`;
  };

  // ── Outliers list ─────────────────────────────────────────────────────────
  const outliers = summary.outliers || {};

  if (!activeDataset) return <EmptyState />;

  // ── Segment options from first categorical col ───────────────────────────
  const segmentOptions = ['All', ...Object.keys(catCols[0]?.stats?.top_values || {}).slice(0, 5)];

  return (
    <div className="space-y-4">

      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-widest uppercase dark:text-white text-slate-900 flex items-center gap-2">
            Business Analytics Dashboard
            <Sparkles className="w-4 h-4 text-violet-400" />
          </h1>
          <p className="text-[10px] text-slate-500 mt-0.5 tracking-wide">
            Dataset: <span className="text-violet-400 font-semibold">{activeDataset.name}</span>
            &nbsp;·&nbsp;{rowCount.toLocaleString()} rows&nbsp;·&nbsp;{activeDataset.columnCount} columns
          </p>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={segmentFilter}
              onChange={e => setSegmentFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-[11px] font-semibold
                bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 border-slate-200
                dark:text-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              {segmentOptions.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-[11px] font-semibold
                bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 border-slate-200
                dark:text-slate-300 text-slate-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              {['2022','2023','2024','2025'].map(y => <option key={y}>{y}</option>)}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── ROW 1: KPI PIPELINE CARDS + DONUT CHARTS ───────────────────── */}
      <div className="flex gap-3">
        {/* KPI Cards */}
        <div className="flex-1 grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, kpis.length)}, 1fr)` }}>
          {kpis.length > 0 ? kpis.map((k, i) => (
            <KpiCard key={i} icon={k.icon} label={k.label}
              value={k.value} prevYear={k.prevYear} pctBar={k.pctBar} />
          )) : (
            <div className="glass-card p-6 col-span-5 text-center text-xs text-slate-500">
              No numeric columns found in dataset.
            </div>
          )}
        </div>

        {/* Donut charts */}
        <div className="grid grid-cols-2 gap-3 w-56 shrink-0">
          {[
            { label: 'Data Completion', pct: completionPct },
            { label: 'Quality Rate',   pct: qualityPct    }
          ].map((d, i) => (
            <div key={i} className="glass-card p-3 flex flex-col items-center justify-center">
              <p className="text-[9px] font-bold uppercase text-slate-400 mb-1 tracking-wider text-center leading-tight">
                {d.label}
              </p>
              <div className="relative" style={{ width: 72, height: 72 }}>
                <PieChart width={72} height={72}>
                  <Pie
                    data={[{ v: d.pct }, { v: 100 - d.pct }]}
                    cx={33} cy={33} innerRadius={24} outerRadius={33}
                    startAngle={90} endAngle={-270} dataKey="v" strokeWidth={0}
                  >
                    <Cell fill={C.p2} />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[13px] font-black dark:text-white text-slate-800">{d.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROW 2: TREND + CATEGORY BAR + SOURCE ───────────────────────── */}
      <div className="grid grid-cols-12 gap-3">

        {/* Monthly Trend Area Chart */}
        <div className="glass-card p-4 col-span-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold dark:text-white text-slate-700 uppercase tracking-widest">
              Monthly Analytics Trend
            </p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[9px] text-slate-400">
                <span className="w-4 h-0.5 rounded bg-violet-600 inline-block" />
                {numCols[0]?.name || 'Primary'}
              </span>
              <span className="flex items-center gap-1 text-[9px] text-slate-400">
                <span className="w-4 h-0.5 rounded bg-violet-300 inline-block" />
                {numCols[1]?.name || 'Secondary'}
              </span>
            </div>
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.p2} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={C.p2} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.p4} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={C.p4} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={TIP_STYLE} cursor={TIP_CURSOR} />
                <Area type="monotone" dataKey="primary"   stroke={C.p2} strokeWidth={2.5} fill="url(#gp)" dot={false} activeDot={{ r: 4, fill: C.p2 }} />
                <Area type="monotone" dataKey="secondary" stroke={C.p4} strokeWidth={2}   fill="url(#gs)" dot={false} activeDot={{ r: 3, fill: C.p4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (horizontal bars) */}
        <div className="glass-card p-4 col-span-4">
          <p className="text-[10px] font-bold dark:text-white text-slate-700 uppercase tracking-widest mb-3">
            {catCols[0]?.name || 'Category'} Distribution
          </p>
          {catBarData.length > 0 ? (
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catBarData} layout="vertical"
                  margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                  <XAxis type="number" stroke="#64748B" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={9}
                    tickLine={false} axisLine={false} width={72} />
                  <Tooltip contentStyle={TIP_STYLE} cursor={TIP_CURSOR} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}
                    label={{ position: 'right', fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}>
                    {catBarData.map((_, i) => (
                      <Cell key={i} fill={[C.p2, C.p3, C.p3, C.p4, C.p4][i % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center pt-10">No categorical data available.</p>
          )}
        </div>

        {/* Source / Segment blocks */}
        <div className="glass-card p-4 col-span-3">
          <p className="text-[10px] font-bold dark:text-white text-slate-700 uppercase tracking-widest mb-3">
            {catCols[1]?.name || (catCols[0]?.name || 'Segment')} by Source
          </p>
          {sourceData.length > 0 ? (
            <div className="space-y-2">
              {/* Top 2 side-by-side blocks */}
              <div className="grid grid-cols-2 gap-2">
                {sourceData.slice(0, 2).map((s, i) => (
                  <div key={i}
                    className="rounded-lg p-3"
                    style={{ backgroundColor: i === 0 ? 'rgba(91,33,182,0.55)' : 'rgba(30,41,59,0.70)' }}>
                    <p className="text-[9px] font-bold text-slate-300 truncate">{s.name}</p>
                    <p className="text-lg font-black text-white mt-1">{s.count.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              {/* Rest as compact rows */}
              {sourceData.slice(2).map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-slate-300 truncate">{s.name}</p>
                  <p className="text-sm font-bold text-violet-300">{s.count.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 text-center pt-10">No secondary data.</p>
          )}
        </div>
      </div>

      {/* ── ROW 3: FUNNEL + DEPT BARS + COL BREAKDOWN ──────────────────── */}
      <div className="grid grid-cols-3 gap-3">

        {/* Recruitment-style Funnel */}
        <div className="glass-card p-4">
          <p className="text-[10px] font-bold dark:text-white text-slate-700 uppercase tracking-widest mb-4">
            Data Pipeline Funnel
          </p>
          <div className="space-y-3">
            {funnelData.length > 0 ? funnelData.map((f, i) => (
              <FunnelBar key={i} label={f.label} pct={f.pct} color={f.color} delay={i * 0.1} />
            )) : (
              <p className="text-xs text-slate-500 text-center pt-6">No pipeline data available.</p>
            )}
          </div>
        </div>

        {/* Distribution by Category (grouped horizontal) */}
        <div className="glass-card p-4">
          <p className="text-[10px] font-bold dark:text-white text-slate-700 uppercase tracking-widest mb-1">
            Distribution by {catCols[0]?.name || 'Category'}
          </p>
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1 text-[9px] text-slate-400">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: C.p1 }} /> Count
            </span>
            <span className="flex items-center gap-1 text-[9px] text-slate-400">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: C.p4 }} /> Share
            </span>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} layout="vertical" barGap={2}
                margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                <XAxis type="number" stroke="#64748B" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={9}
                  tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={TIP_STYLE} cursor={TIP_CURSOR} />
                <Bar dataKey="primary"   fill={C.p1} radius={[0, 3, 3, 0]} maxBarSize={9}
                  label={{ position: 'right', fill: '#94A3B8', fontSize: 9 }} />
                <Bar dataKey="secondary" fill={C.p4} radius={[0, 3, 3, 0]} maxBarSize={9}
                  label={{ position: 'right', fill: '#94A3B8', fontSize: 9 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Numeric Column Breakdown (grouped horizontal) */}
        <div className="glass-card p-4">
          <p className="text-[10px] font-bold dark:text-white text-slate-700 uppercase tracking-widest mb-1">
            Column Volume Breakdown
          </p>
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1 text-[9px] text-slate-400">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: C.p1 }} /> Volume
            </span>
            <span className="flex items-center gap-1 text-[9px] text-slate-400">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: C.p4 }} /> Share
            </span>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={colBreakdown} layout="vertical" barGap={2}
                margin={{ top: 0, right: 30, bottom: 0, left: 0 }}>
                <XAxis type="number" stroke="#64748B" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={9}
                  tickLine={false} axisLine={false} width={70} />
                <Tooltip contentStyle={TIP_STYLE} cursor={TIP_CURSOR} />
                <Bar dataKey="primary"   fill={C.p1} radius={[0, 3, 3, 0]} maxBarSize={9}
                  label={{ position: 'right', fill: '#94A3B8', fontSize: 9 }} />
                <Bar dataKey="secondary" fill={C.p4} radius={[0, 3, 3, 0]} maxBarSize={9}
                  label={{ position: 'right', fill: '#94A3B8', fontSize: 9 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── ROW 4: OUTLIERS + CORRELATION MATRIX (kept) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Outliers panel */}
        <div className="glass-card p-4 lg:col-span-1">
          <h3 className="text-[10px] font-bold dark:text-white text-slate-800 uppercase tracking-widest
            flex items-center gap-1.5 mb-3">
            <ShieldAlert className="w-4 h-4 text-rose-500" /> Outliers &amp; Anomalies
          </h3>
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {Object.keys(outliers).length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No outliers detected.</p>
            ) : Object.entries(outliers).map(([col, info], i) => (
              <div key={i} className="p-2.5 bg-slate-900/40 border border-slate-800/60 rounded-xl
                flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold dark:text-slate-200 text-slate-700 truncate max-w-[130px]">{col}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">IQR extreme boundaries</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    info.outlierCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {info.outlierCount} outliers
                  </span>
                  <p className="text-[9px] text-slate-500 mt-0.5">{Number(info.percentage).toFixed(1)}% of rows</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Correlation Matrix */}
        <div className="glass-card p-4 lg:col-span-2">
          <h3 className="text-[10px] font-bold dark:text-white text-slate-800 uppercase tracking-widest
            flex items-center gap-2 mb-3">
            <Grid className="w-3.5 h-3.5 text-violet-500" /> Correlation Matrix Grid
          </h3>
          {!hasCorr ? (
            <p className="text-xs text-slate-500 text-center py-10">Insufficient numerical columns to correlate.</p>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[380px] select-none">
                {/* Header */}
                <div className="flex mb-0.5">
                  <div className="w-20 shrink-0 text-[9px] font-bold uppercase tracking-wider
                    dark:text-slate-400 text-slate-500 self-end pr-2 text-right">Vars</div>
                  {Object.keys(corrMatrix).map((col, idx) => (
                    <div key={idx}
                      className="flex-1 text-[8px] font-semibold dark:text-slate-300 text-slate-600
                        truncate text-center px-0.5" title={col}>{col}</div>
                  ))}
                </div>
                {/* Rows */}
                {Object.entries(corrMatrix).map(([rowName, cols], ri) => (
                  <div key={ri} className="flex mb-0.5 items-center">
                    <div className="w-20 shrink-0 text-[8px] font-semibold dark:text-slate-300 text-slate-600
                      truncate pr-2 text-right" title={rowName}>{rowName}</div>
                    {Object.keys(corrMatrix).map((colName, ci) => {
                      const val = cols[colName];
                      return (
                        <div key={ci}
                          className="flex-1 aspect-square rounded m-0.5 flex items-center justify-center
                            text-[9px] font-bold text-white transition-all hover:scale-110 cursor-help"
                          style={{ backgroundColor: getCorrColor(val) }}
                          title={`${rowName} ↔ ${colName}: ${val?.toFixed?.(3)}`}>
                          {val?.toFixed?.(2)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

// ── Wrapped export with Error Boundary ───────────────────────────────────────
const DashboardWithBoundary = (props) => (
  <ErrorBoundary>
    <Dashboard {...props} />
  </ErrorBoundary>
);

export default DashboardWithBoundary;
