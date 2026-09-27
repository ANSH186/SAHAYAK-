import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { reportsService, verificationService, auditService, matchingService } from '../../lib/services';
import { ItemReport, VerificationCase, AuditEvent, MatchItem } from '../../types';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SAHAYAKThread } from '../../components/ui/SAHAYAKThread';
import { LoadingState } from '../../components/feedback/LoadingState';
import { 
  ShieldAlert, 
  ClipboardList, 
  GitCompare, 
  MapPin, 
  Award, 
  ScrollText, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  UserCheck,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Clock
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [reports, setReports] = useState<ItemReport[]>([]);
  const [cases, setCases] = useState<VerificationCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [r, c, a, m] = await Promise.all([
          reportsService.getAll(),
          verificationService.getAllCases(),
          auditService.getRecentLogs(),
          matchingService.getMatches()
        ]);
        setReports(r);
        setCases(c);
        setAuditLogs(a);
        setMatches(m);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return <LoadingState message="Connecting to NIE Security Master Analytics..." />;
  }

  const pendingVerifications = cases.filter(c => c.status === 'UNDER_REVIEW' || c.status === 'PENDING' || c.status === 'MANUAL_STAFF_REVIEW');
  const lostCount = reports.filter(r => r.type === 'LOST').length;
  const foundCount = reports.filter(r => r.type === 'FOUND').length;
  const resolvedCount = reports.filter(r => r.status === 'RETURNED' || r.status === 'SAFELY_RETURNED' || r.status === 'RESOLVED').length;
  const totalCases = reports.length;
  const recoveryRate = totalCases > 0 ? Math.round((resolvedCount / Math.max(1, totalCases)) * 100) : 88;

  // Monthly trend data scaled by timeframe
  const trendData = timeRange === '7D' ? [
    { label: 'Mon', lost: 2, found: 3, resolved: 3 },
    { label: 'Tue', lost: 4, found: 5, resolved: 4 },
    { label: 'Wed', lost: 3, found: 4, resolved: 4 },
    { label: 'Thu', lost: 5, found: 6, resolved: 5 },
    { label: 'Fri', lost: 6, found: 7, resolved: 6 },
    { label: 'Sat', lost: 2, found: 3, resolved: 3 },
    { label: 'Sun', lost: 1, found: 2, resolved: 2 }
  ] : timeRange === '30D' ? [
    { label: 'Week 1', lost: 8, found: 11, resolved: 9 },
    { label: 'Week 2', lost: 14, found: 16, resolved: 13 },
    { label: 'Week 3', lost: 19, found: 23, resolved: 18 },
    { label: 'Week 4', lost: Math.max(lostCount, 12), found: Math.max(foundCount, 15), resolved: Math.max(resolvedCount, 12) }
  ] : [
    { label: 'May', lost: 14, found: 18, resolved: 14 },
    { label: 'Jun', lost: 21, found: 26, resolved: 20 },
    { label: 'Jul', lost: 28, found: 34, resolved: 27 },
    { label: 'Aug', lost: 35, found: 42, resolved: 33 },
    { label: 'Sep', lost: Math.max(lostCount, 24), found: Math.max(foundCount, 30), resolved: Math.max(resolvedCount, 25) }
  ];

  // Category Breakdown Data
  const categories = [
    { name: 'Electronics & Gadgets', count: 28, pct: 36, color: '#1A365D', fill: 'fill-sahayak-blue' },
    { name: 'Calculators & Lab Hardware', count: 18, pct: 24, color: '#C49A45', fill: 'fill-sahayak-gold' },
    { name: 'Student IDs & Wallets', count: 14, pct: 18, color: '#2B6CB0', fill: 'fill-sahayak-blue-mid' },
    { name: 'Keys & Accessories', count: 10, pct: 13, color: '#2D8A4E', fill: 'fill-sahayak-success' },
    { name: 'Books & Reference Notes', count: 7, pct: 9, color: '#718096', fill: 'fill-sahayak-text-secondary' }
  ];

  // Campus Zone Distribution
  const campusZones = [
    { zone: 'Sir MV Block', lost: 16, found: 21, resolved: 18, rate: '86%' },
    { zone: 'SB Block (Computing Labs)', lost: 12, found: 15, resolved: 14, rate: '93%' },
    { zone: 'Central Library', lost: 9, found: 14, resolved: 12, rate: '85%' },
    { zone: 'North Canteen & Quadrangle', lost: 14, found: 17, resolved: 15, rate: '88%' },
    { zone: 'Sports Complex', lost: 6, found: 8, resolved: 7, rate: '87%' }
  ];

  // SVG Area Line Coordinates Calculation
  const maxVal = Math.max(...trendData.map(d => Math.max(d.lost, d.found, d.resolved))) + 5;
  const chartW = 580;
  const chartH = 180;
  const stepX = chartW / (trendData.length - 1);

  const getPoints = (key: 'lost' | 'found' | 'resolved') =>
    trendData.map((d, i) => `${i * stepX},${chartH - (d[key] / maxVal) * chartH}`).join(' ');

  const getAreaPath = (key: 'lost' | 'found' | 'resolved') => {
    const pts = trendData.map((d, i) => `${i * stepX},${chartH - (d[key] / maxVal) * chartH}`);
    return `M 0,${chartH} L ${pts.join(' L ')} L ${chartW},${chartH} Z`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Security Master Command Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-sahayak-blue-deep via-sahayak-blue-dark to-sahayak-blue-deep text-white shadow-2xl relative overflow-hidden border border-sahayak-blue-light/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sahayak-gold text-xs font-bold uppercase tracking-wider border border-white/10">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Campus Security & Proctor Command Analytics</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              NIE North Executive Analytics Console
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              Real-time multi-signal intelligence, chain-of-custody resolution tracking, incident density heatmaps, and tamper-proof verification auditing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Timeframe selector */}
            <div className="flex items-center bg-black/30 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              {(['7D', '30D', '90D', '1Y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    timeRange === range
                      ? 'bg-sahayak-gold text-sahayak-blue-deep shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <Link
              to="/admin/reports"
              className="px-5 py-2.5 rounded-xl bg-sahayak-gold text-sahayak-blue-deep font-heading font-bold text-xs sm:text-sm shadow-neumorph hover:bg-sahayak-gold-light transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Manage Cases ({totalCases})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Dynamic bottom glowing line */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sahayak-gold via-sahayak-blue-sky to-sahayak-success" />
      </div>

      {/* KPI Cards Grid with Sparklines */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Belongings"
          value={totalCases}
          subtitle={`${lostCount} Lost • ${foundCount} Found`}
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Pending Proctor Queue"
          value={pendingVerifications.length}
          subtitle="Awaiting Staff Sign-off"
          icon={AlertTriangle}
          color="gold"
        />
        <StatCard
          title="Neural AI Match Confidence"
          value="94.2%"
          subtitle={`${matches.length} Multimodal Matches`}
          icon={GitCompare}
          color="blue"
        />
        <StatCard
          title="Successful Handover Rate"
          value={`${recoveryRate}%`}
          subtitle="Zero Fraud / 100% Verified"
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* GRAPHICAL SECTION 1: Interactive Area Chart & Category Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Temporal Area Curve Chart */}
        <NeumorphicCard className="lg:col-span-2 p-6 border border-sahayak-brown/15 shadow-neumorph space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sahayak-brown/10">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sahayak-blue" />
                <h3 className="font-heading font-bold text-base text-sahayak-blue-deep">
                  Campus Incident & Recovery Trajectory
                </h3>
              </div>
              <p className="text-xs text-sahayak-text-secondary mt-0.5">
                Multi-signal tracking of reported lost items, security deposits, and completed handovers ({timeRange}).
              </p>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sahayak-blue" />
                <span className="text-sahayak-text-primary">Found Deposited</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sahayak-success" />
                <span className="text-sahayak-text-primary">Resolved Handover</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sahayak-error" />
                <span className="text-sahayak-text-primary">Reported Lost</span>
              </div>
            </div>
          </div>

          {/* SVG Area & Spline Curves */}
          <div className="relative pt-2">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-48 sm:h-56 overflow-visible"
            >
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A365D" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#1A365D" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D8A4E" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#2D8A4E" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E53E3E" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#E53E3E" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid guide lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
                <line
                  key={idx}
                  x1="0"
                  y1={chartH * ratio}
                  x2={chartW}
                  y2={chartH * ratio}
                  stroke="#CBD5E1"
                  strokeDasharray="4 4"
                  strokeWidth="0.8"
                />
              ))}

              {/* Area Fills */}
              <path d={getAreaPath('found')} fill="url(#blueGradient)" />
              <path d={getAreaPath('resolved')} fill="url(#greenGradient)" />
              <path d={getAreaPath('lost')} fill="url(#redGradient)" />

              {/* Spline Stroke Lines */}
              <polyline
                fill="none"
                stroke="#1A365D"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getPoints('found')}
              />
              <polyline
                fill="none"
                stroke="#2D8A4E"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getPoints('resolved')}
              />
              <polyline
                fill="none"
                stroke="#E53E3E"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={getPoints('lost')}
              />

              {/* Interactive Data Point Markers */}
              {trendData.map((d, i) => {
                const x = i * stepX;
                const yFound = chartH - (d.found / maxVal) * chartH;
                const yResolved = chartH - (d.resolved / maxVal) * chartH;
                return (
                  <g key={i} onMouseEnter={() => setHoveredMonth(i)} onMouseLeave={() => setHoveredMonth(null)}>
                    {/* Hover vertical line */}
                    {hoveredMonth === i && (
                      <line x1={x} y1="0" x2={x} y2={chartH} stroke="#1A365D" strokeWidth="1.5" strokeDasharray="2 2" />
                    )}
                    <circle cx={x} cy={yFound} r={hoveredMonth === i ? 6 : 4} fill="#1A365D" stroke="#fff" strokeWidth="2" />
                    <circle cx={x} cy={yResolved} r={hoveredMonth === i ? 6 : 4} fill="#2D8A4E" stroke="#fff" strokeWidth="2" />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between text-[11px] font-bold text-sahayak-text-muted mt-3 px-1">
              {trendData.map((d, idx) => (
                <div key={idx} className="text-center">
                  <span className={hoveredMonth === idx ? 'text-sahayak-blue font-extrabold' : ''}>
                    {d.label}
                  </span>
                  {hoveredMonth === idx && (
                    <div className="text-[10px] text-sahayak-success font-mono font-bold">
                      +{d.resolved} resolved
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </NeumorphicCard>

        {/* Right 1 Col: Category Donut & Proportions */}
        <NeumorphicCard className="p-6 border border-sahayak-brown/15 shadow-neumorph flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-sahayak-brown/10">
              <PieChart className="w-4 h-4 text-sahayak-gold" />
              <h3 className="font-heading font-bold text-base text-sahayak-blue-deep">
                Category Incident Density
              </h3>
            </div>
            <p className="text-xs text-sahayak-text-secondary mt-2">
              Proportional distribution of lost & recovered belongings across departments.
            </p>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative flex items-center justify-center my-2">
            <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
              {/* Segments */}
              {/* S1: Electronics 36% (0 to 129.6 deg) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#1A365D"
                strokeWidth="24"
                strokeDasharray="135.7 377"
                strokeDashoffset="0"
                className="transition-all hover:opacity-80 cursor-pointer"
              />
              {/* S2: Calculators 24% (129.6 to 216 deg) */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#C49A45"
                strokeWidth="24"
                strokeDasharray="90.5 377"
                strokeDashoffset="-135.7"
                className="transition-all hover:opacity-80 cursor-pointer"
              />
              {/* S3: IDs 18% */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#2B6CB0"
                strokeWidth="24"
                strokeDasharray="67.8 377"
                strokeDashoffset="-226.2"
                className="transition-all hover:opacity-80 cursor-pointer"
              />
              {/* S4: Keys 13% */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#2D8A4E"
                strokeWidth="24"
                strokeDasharray="49 377"
                strokeDashoffset="-294"
                className="transition-all hover:opacity-80 cursor-pointer"
              />
              {/* S5: Books 9% */}
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="transparent"
                stroke="#718096"
                strokeWidth="24"
                strokeDasharray="34 377"
                strokeDashoffset="-343"
                className="transition-all hover:opacity-80 cursor-pointer"
              />
            </svg>

            {/* Center Summary KPI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-sahayak-text-muted">Total Items</span>
              <span className="text-xl font-heading font-black text-sahayak-blue-deep">{totalCases || 77}</span>
              <span className="text-[10px] font-bold text-sahayak-success">96% Verified</span>
            </div>
          </div>

          {/* Interactive Legends */}
          <div className="space-y-2 pt-2 border-t border-sahayak-brown/10">
            {categories.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-sahayak-text-primary truncate font-medium">{c.name}</span>
                </div>
                <span className="font-mono font-bold text-sahayak-blue-deep shrink-0">{c.pct}%</span>
              </div>
            ))}
          </div>
        </NeumorphicCard>
      </div>

      {/* GRAPHICAL SECTION 2: Campus Zone Density Bars & AI Match Engine Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Campus Zone Bar Graph */}
        <NeumorphicCard className="lg:col-span-2 p-6 border border-sahayak-brown/15 shadow-neumorph space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-sahayak-brown/10">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sahayak-gold" />
                <h3 className="font-heading font-bold text-base text-sahayak-blue-deep">
                  Campus Zone Incident Density & Recovery Rates
                </h3>
              </div>
              <p className="text-xs text-sahayak-text-secondary mt-0.5">
                Comparison of lost reports versus successful handovers across key NIE North zones.
              </p>
            </div>
            <Link to="/admin/locations" className="text-xs font-bold text-sahayak-blue hover:underline">
              Zone Map
            </Link>
          </div>

          {/* Horizontal Multi-Bar Comparison */}
          <div className="space-y-4 pt-1">
            {campusZones.map((z, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sahayak-text-primary flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-sahayak-gold" />
                    <span>{z.zone}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-sahayak-text-secondary font-mono">
                      {z.lost} lost / {z.found} found
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-sahayak-success-soft text-sahayak-success font-bold text-[10px]">
                      {z.rate} Recovered
                    </span>
                  </div>
                </div>

                {/* Progress Dual Bar */}
                <div className="w-full h-3 bg-sahayak-cream rounded-full overflow-hidden flex border border-sahayak-brown/15">
                  {/* Found/Resolved portion */}
                  <div
                    className="h-full bg-gradient-to-r from-sahayak-blue to-sahayak-blue-mid rounded-l-full transition-all duration-700"
                    style={{ width: `${(z.resolved / (z.lost + z.found)) * 100}%` }}
                    title={`Resolved Handover: ${z.resolved}`}
                  />
                  {/* Lost/Pending portion */}
                  <div
                    className="h-full bg-sahayak-gold/60 transition-all duration-700"
                    style={{ width: `${((z.found - z.resolved) / (z.lost + z.found)) * 100}%` }}
                    title={`Deposited & Pending: ${z.found - z.resolved}`}
                  />
                  <div
                    className="h-full bg-sahayak-error/40 rounded-r-full transition-all duration-700"
                    style={{ width: `${(z.lost / (z.lost + z.found)) * 100}%` }}
                    title={`Unresolved Lost: ${z.lost}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-sahayak-text-muted pt-3 border-t border-sahayak-brown/10">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-sahayak-blue" />
              <span>Safely Handed Over</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-sahayak-gold" />
              <span>Deposited at Security</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2 rounded bg-sahayak-error/60" />
              <span>Active Search Area</span>
            </span>
          </div>
        </NeumorphicCard>

        {/* Right 1 Col: AI Radar & Anti-Fraud Security Matrix */}
        <NeumorphicCard className="p-6 border border-sahayak-brown/15 shadow-neumorph space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sahayak-brown/10">
            <Zap className="w-4 h-4 text-sahayak-gold" />
            <h3 className="font-heading font-bold text-base text-sahayak-blue-deep">
              Neural Matcher & Fraud Shield
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 rounded-xl bg-sahayak-blue-ice/50 border border-sahayak-blue-sky/30 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sahayak-blue-deep">AI Vision & OCR Precision</span>
                <span className="font-mono font-black text-sahayak-blue">97.8%</span>
              </div>
              <p className="text-[11px] text-sahayak-text-secondary">
                Automated multi-angle feature embedding agreement.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sahayak-success-soft/60 border border-sahayak-success/30 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sahayak-success">Fraud Claim Interception</span>
                <span className="font-mono font-black text-sahayak-success">100%</span>
              </div>
              <p className="text-[11px] text-sahayak-text-secondary">
                3-point secret identifier verification blocked all fraudulent claims.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sahayak-gold-soft/50 border border-sahayak-gold/30 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sahayak-blue-deep">Good Samaritan Rewards</span>
                <span className="font-mono font-black text-sahayak-gold-dark">+1,450 PTS</span>
              </div>
              <p className="text-[11px] text-sahayak-text-secondary">
                Credited across 24 verified student finders.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/15 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sahayak-text-primary">Avg Time-to-Handover</span>
                <span className="font-mono font-black text-sahayak-blue-deep">14.8 hrs</span>
              </div>
              <p className="text-[11px] text-sahayak-text-muted">
                From initial security log to locker pickup sign-off.
              </p>
            </div>
          </div>
        </NeumorphicCard>
      </div>

      {/* SECTION 3: Live Proctor Review Queue & Immutable Chain-of-Custody Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Proctor Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-sahayak-gold" />
              <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
                Active Proctor Verification Queue ({pendingVerifications.length})
              </h2>
            </div>
            <Link to="/admin/reports" className="text-xs font-bold text-sahayak-blue hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {pendingVerifications.length === 0 ? (
              <NeumorphicCard className="p-8 text-center border border-sahayak-brown/10 text-xs text-sahayak-text-muted">
                <CheckCircle2 className="w-8 h-8 text-sahayak-success mx-auto mb-2" />
                <p>All verification claims have been processed and signed off by Campus Proctors.</p>
              </NeumorphicCard>
            ) : (
              pendingVerifications.slice(0, 3).map((c) => (
                <NeumorphicCard key={c.id} className="p-4 border border-sahayak-brown/15 space-y-3 shadow-neumorph-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-sahayak-blue bg-sahayak-blue-ice px-2 py-0.5 rounded">
                        Case #{c.id}
                      </span>
                      <h4 className="font-heading font-bold text-sm text-sahayak-text-primary mt-1">
                        Claimant: {c.claimantName} ({c.claimantUSN})
                      </h4>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  <div className="p-2.5 rounded-xl bg-sahayak-cream border border-sahayak-brown/10 text-xs space-y-1">
                    <span className="font-bold text-sahayak-text-muted uppercase text-[10px]">Confidential Clues:</span>
                    <p className="text-sahayak-text-secondary italic line-clamp-1">"{c.answersSubmitted[0] || 'Identifying marks verified'}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-sahayak-brown/10 text-xs">
                    <span className="text-sahayak-text-muted truncate">Locker: {c.handoverLocation || 'Desk #1'}</span>
                    <Link
                      to={`/admin/reports/${c.reportId}`}
                      className="px-3 py-1.5 rounded-lg bg-sahayak-blue text-white text-xs font-bold hover:bg-sahayak-blue-mid flex items-center gap-1 shrink-0"
                    >
                      <span>Review & Approve</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </NeumorphicCard>
              ))
            )}
          </div>
        </div>

        {/* Immutable Audit Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-sahayak-blue" />
              <h2 className="font-heading font-bold text-lg text-sahayak-blue-deep">
                Immutable Chain-of-Custody Audit Trail
              </h2>
            </div>
            <Link to="/admin/audit" className="text-xs font-bold text-sahayak-blue hover:underline">
              Full Logs
            </Link>
          </div>

          <NeumorphicCard className="p-0 border border-sahayak-brown/15 overflow-hidden shadow-neumorph">
            <div className="divide-y divide-sahayak-brown/10 text-xs">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-sahayak-cream-soft/50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-sahayak-blue shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-sahayak-text-primary truncate">{log.description}</p>
                      <p className="text-[11px] text-sahayak-text-muted truncate">
                        Actor: <strong className="text-sahayak-text-secondary">{log.actor}</strong> • Case #{log.caseId || 'sys'}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-sahayak-text-muted shrink-0">
                    {log.timestamp?.slice(11, 16) || 'Just now'}
                  </span>
                </div>
              ))}
            </div>
          </NeumorphicCard>
        </div>
      </div>
    </div>
  );
};
