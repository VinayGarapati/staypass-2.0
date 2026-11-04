import React, { useState } from 'react';
import { useStayPassStore } from '../../store/useStayPassStore';
import { PropertyMetrics } from '../../models/types';
import { StayPassBadge } from '../../components/StayPassBadge';
import { StayPassButton } from '../../components/StayPassButton';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Key,
  FileCheck,
  AlertTriangle,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  Server,
  RefreshCw,
  Building,
  Star,
  MapPin,
  Clock,
  Phone,
  BarChart3,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    adminSession,
    isAdminTotpVerified,
    verifyAdminTotp,
    pendingOwners,
    approveOwnerRegistration,
    complaints,
    resolveComplaintTicket,
    properties,
    bookings,
    auditLogs,
    inspections,
    addInspectionReport,
    activeSession,
    rotateSessionToken,
    getAllPropertyMetrics,
    showToast,
  } = useStayPassStore();

  const [totpInput, setTotpInput] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'individual_pgs' | 'owners' | 'inspections' | 'complaints' | 'audit'>('individual_pgs');
  const [selectedCityFilter, setSelectedCityFilter] = useState<'ALL' | 'Hyderabad' | 'Rajahmundry'>('ALL');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0].id);
  const [resolutionNote, setResolutionNote] = useState('');
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);

  // Inspection Modal State
  const [showInspectionModal, setShowInspectionModal] = useState<boolean>(false);
  const [inspPropertyId, setInspPropertyId] = useState<string>(properties[0].id);
  const [inspScore, setInspScore] = useState<number>(95);
  const [inspFireNoc, setInspFireNoc] = useState<boolean>(true);
  const [inspCctv, setInspCctv] = useState<boolean>(true);
  const [inspHygiene, setInspHygiene] = useState<'EXCELLENT' | 'SATISFACTORY' | 'ACTION_REQUIRED'>('EXCELLENT');
  const [inspNotes, setInspNotes] = useState<string>('Biometric turnstile verified; kitchen food safety cleared');


  // Totp Challenge Screen
  if (!isAdminTotpVerified) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0B0F17] text-white">
        <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center mb-4 text-[#A78BFA]">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-1">Super Admin 2FA Verification</h2>
        <p className="text-xs text-[#9CA3AF] text-center max-w-xs mb-6">
          Exclusive access required. Enter the 6-digit TOTP code from your Google Authenticator app.
        </p>

        <div className="w-full max-w-xs space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-[#D1D5DB] block mb-1.5">
              Google Authenticator 6-Digit Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={totpInput}
              onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 123456"
              className="w-full text-center tracking-widest text-lg font-mono py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="bg-[#FEF3C7]/10 border border-[#D97706]/30 rounded-xl p-3 text-[11px] text-[#FBBF24]">
            <strong>Demo Simulator:</strong> Enter <code className="bg-black/40 px-1 py-0.5 rounded font-mono">123456</code> to unlock Super Admin console.
          </div>

          <StayPassButton
            label="Verify & Authenticate"
            onClick={() => verifyAdminTotp(totpInput)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
          />
        </div>
      </div>
    );
  }

  // Calculate platform metrics
  const totalBeds = properties.reduce((acc, p) => acc + p.totalBeds, 0);
  const freeBeds = properties.reduce((acc, p) => acc + p.availableBeds, 0);
  const occupiedBeds = totalBeds - freeBeds;
  const platformOccupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
  const totalGrossVolume = bookings.reduce((acc, b) => acc + b.totalEstimatedAmount, 0);

  const allMetrics = getAllPropertyMetrics();
  const filteredMetrics = allMetrics.filter(
    (m) => selectedCityFilter === 'ALL' || m.city === selectedCityFilter
  );
  const currentSelectedMetric = allMetrics.find((m) => m.propertyId === selectedPropertyId) || allMetrics[0];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0F172A] text-slate-100 overflow-y-auto">
      {/* Super Admin Top Header */}
      <div className="bg-[#0B0F17] p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#7C3AED] flex items-center justify-center font-bold text-xs text-white shadow-xs">
              SA
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-white">StayPass Security Console</h1>
                <span className="bg-[#7C3AED]/20 text-[#A78BFA] text-[9px] font-bold px-1.5 py-0.5 rounded border border-[#7C3AED]/40">
                  TOTP ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{adminSession.email}</p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
            All Systems Operational
          </span>
        </div>

        {/* SecureStore Token & Session Rotation Banner */}
        <div className="mt-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 overflow-hidden">
            <Key className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
            <div className="truncate">
              <span className="text-slate-400">Secure Token: </span>
              <span className="font-mono text-emerald-400 text-[10px]">
                {activeSession?.accessToken.slice(0, 24)}...
              </span>
            </div>
          </div>
          <button
            onClick={() => rotateSessionToken()}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-[#7C3AED]/30 hover:bg-[#7C3AED]/50 text-[#C4B5FD] rounded-lg font-bold text-[10px] border border-[#7C3AED]/40 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Rotate Token</span>
          </button>
        </div>

        {/* Console Navigation */}
        <div className="flex gap-1 mt-3 overflow-x-auto text-xs pb-1">
          {[
            { id: 'individual_pgs', label: 'Individual PG Metrics' },
            { id: 'analytics', label: 'Platform KPIs' },
            { id: 'owners', label: `Owner Approvals (${pendingOwners.length})` },
            { id: 'inspections', label: 'Verifications' },
            { id: 'complaints', label: `Disputes (${complaints.filter((c) => c.status === 'OPEN').length})` },
            { id: 'audit', label: 'Audit Trail' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                activeAdminTab === tab.id
                  ? 'bg-[#7C3AED] text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Content Area */}
      <div className="p-4 flex-1 space-y-4">
        {/* INDIVIDUAL PG METRICS & ANALYTICS DRILLDOWN */}
        {activeAdminTab === 'individual_pgs' && (
          <div className="space-y-4">
            {/* Filter by City */}
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#A78BFA]" />
                <span>Individual PG / Hostel Performance</span>
              </h3>
              <div className="flex gap-1 text-[10px]">
                {(['ALL', 'Hyderabad', 'Rajahmundry'] as const).map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCityFilter(city)}
                    className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                      selectedCityFilter === city
                        ? 'bg-[#7C3AED] text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Property Selector Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {filteredMetrics.map((metric) => (
                <div
                  key={metric.propertyId}
                  onClick={() => setSelectedPropertyId(metric.propertyId)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedPropertyId === metric.propertyId
                      ? 'bg-slate-800/90 border-[#7C3AED] ring-1 ring-[#7C3AED]'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="font-bold text-white truncate max-w-[170px]">
                      {metric.propertyName}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      {metric.occupancyRate}% Occupied
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{metric.locality} • {metric.city}</p>
                  
                  <div className="grid grid-cols-3 gap-1 text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded-lg text-center">
                    <div>
                      <span className="text-slate-500 block text-[9px]">Beds (Occ/Tot)</span>
                      <strong className="text-white">{metric.occupiedBeds}/{metric.totalBeds}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">Monthly Est</span>
                      <strong className="text-emerald-400">₹{(metric.monthlyRevenue / 1000).toFixed(0)}k</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px]">Audit Score</span>
                      <strong className="text-indigo-400">{metric.safetyAuditScore}%</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected PG Deep-Dive Card */}
            {currentSelectedMetric && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5">
                <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-[#A78BFA] font-bold uppercase tracking-wider">
                      Detailed PG Inspection & Revenue Ledger
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{currentSelectedMetric.propertyName}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#246BCE]" />
                      <span>{currentSelectedMetric.locality}, {currentSelectedMetric.city}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">
                      ₹{currentSelectedMetric.monthlyRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Gross Rent / Mo</span>
                  </div>
                </div>

                {/* Performance Metrics Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Warden Turnaround</span>
                    <strong className="text-sm font-bold text-white">{currentSelectedMetric.wardenResponseTimeHours} hrs avg</strong>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Fast response tier</span>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Dispute Resolution</span>
                    <strong className="text-sm font-bold text-white">{currentSelectedMetric.resolvedComplaintsRate}% resolved</strong>
                    <span className="text-[10px] text-indigo-400 block mt-0.5">No escalation pending</span>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">StayPass 3% Commission</span>
                    <strong className="text-sm font-bold text-white">₹{currentSelectedMetric.commissionGenerated.toLocaleString('en-IN')}</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Automated deduction</span>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Safety & Hygiene Audit</span>
                    <strong className="text-sm font-bold text-emerald-400">{currentSelectedMetric.inspectionStatus}</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Biometric gate verified</span>
                  </div>
                </div>

                {/* Owner Profile & Direct Administrative Action */}
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Registered Property Owner</span>
                    <p className="font-bold text-white">{currentSelectedMetric.ownerName} ({currentSelectedMetric.ownerId})</p>
                    <p className="text-[10px] text-slate-400">Payout status: <strong className="text-emerald-400">{currentSelectedMetric.bankPayoutStatus}</strong></p>
                  </div>
                  <button
                    onClick={() => showToast(`Inspection schedule request sent to ${currentSelectedMetric.ownerName}`)}
                    className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10px] font-bold rounded-lg shadow-xs"
                  >
                    Request Audit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PLATFORM KPIS */}
        {activeAdminTab === 'analytics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-400 block">Total Active Beds</span>
                <span className="text-2xl font-bold text-white block mt-1 tabular-nums">{totalBeds}</span>
                <span className="text-[10px] text-emerald-400 mt-1 block">
                  {occupiedBeds} occupied ({platformOccupancyRate}%)
                </span>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-400 block">Gross Booking Volume</span>
                <span className="text-xl font-bold text-white block mt-1 tabular-nums">
                  ₹{totalGrossVolume.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-indigo-400 mt-1 block">
                  Across Hyd & RJY hubs
                </span>
              </div>
            </div>

            {/* Export Metrics Action Bar */}
            <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Download Operational Ledger</span>
                <span className="text-[10px] text-slate-400">Export verified PG occupancy, revenue & compliance data</span>
              </div>
              <button
                onClick={() => {
                  const headers = 'PropertyID,Name,City,Locality,OccupancyRate,TotalBeds,OccupiedBeds,MonthlyRevenue,SafetyScore\n';
                  const rows = allMetrics
                    .map(
                      (m) =>
                        `"${m.propertyId}","${m.propertyName}","${m.city}","${m.locality}",${m.occupancyRate}%,${m.totalBeds},${m.occupiedBeds},₹${m.monthlyRevenue},${m.safetyAuditScore}%`
                    )
                    .join('\n');
                  const blob = new Blob([headers + rows], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `StayPass_Platform_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast('Operational Ledger CSV exported successfully.');
                }}
                className="px-3 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
              >
                <span>Export CSV</span>
              </button>
            </div>

            {/* City Distribution */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white">City Cluster Distribution</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Hyderabad (Gachibowli, Madhapur, Kukatpally)</span>
                  <span className="font-bold text-white">20 Beds Listed</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#246BCE] h-full rounded-full" style={{ width: '65%' }} />
                </div>

                <div className="flex justify-between items-center text-slate-300 pt-2">
                  <span>Rajahmundry (Danavaipeta, Morampudi)</span>
                  <span className="font-bold text-white">30 Beds Listed</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full rounded-full" style={{ width: '35%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OWNER APPROVALS */}
        {activeAdminTab === 'owners' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white">Pending PG Owner Registrations</h3>
            {pendingOwners.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                All PG owner applications have been reviewed!
              </div>
            ) : (
              pendingOwners.map((owner) => (
                <div
                  key={owner.id}
                  className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white">{owner.name}</h4>
                      <p className="text-[10px] text-slate-400">{owner.email} • {owner.phone}</p>
                      <span className="inline-block mt-1 font-mono text-[10px] text-[#A78BFA] bg-[#7C3AED]/20 px-2 py-0.5 rounded border border-[#7C3AED]/30">
                        Target ID: {owner.ownerIdCode}
                      </span>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                      Awaiting Audit
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-800/60 rounded-xl text-[11px] text-slate-300 space-y-1">
                    <p>• Aadhaar / Trade License: <strong>VERIFIED IN KYC</strong></p>
                    <p>• Bank Payout Account: <strong>{owner.bankAccountVerified ? 'LINKED' : 'PENDING'}</strong></p>
                    <p>• Single-Gender PG Compliance: <strong>CONFIRMED</strong></p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => approveOwnerRegistration(owner.id, true)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Issue ID</span>
                    </button>
                    <button
                      onClick={() => approveOwnerRegistration(owner.id, false)}
                      className="px-3 py-2 border border-rose-500/60 text-rose-400 hover:bg-rose-500/10 rounded-xl font-bold"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* VERIFICATIONS & INSPECTIONS */}
        {activeAdminTab === 'inspections' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">Property Safety & Hygiene Inspections</h3>
                <p className="text-[10px] text-slate-400">{inspections.length} official inspection reports on record</p>
              </div>
              <button
                onClick={() => setShowInspectionModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <span>+ Log Audit</span>
              </button>
            </div>

            {/* Inspection Reports Timeline */}
            <div className="space-y-2">
              {inspections.map((insp) => (
                <div key={insp.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-white">{insp.propertyName}</span>
                      <p className="text-[10px] text-slate-400">Inspector: {insp.inspectorName} • {insp.date}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      Score: {insp.auditScore}/100
                    </span>
                  </div>
                  <div className="flex gap-2 text-[10px] text-slate-300">
                    <span>Fire NOC: {insp.fireNocVerified ? '✓ Verified' : '✗ Pending'}</span>
                    <span>• CCTV: {insp.cctvWorking ? '✓ 24/7 Active' : '✗ Non-operational'}</span>
                    <span>• Hygiene: {insp.hygieneStatus}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 bg-slate-800/60 p-1.5 rounded">{insp.notes}</p>
                </div>
              ))}
            </div>

            <h4 className="text-[11px] font-bold text-slate-300 pt-2">All Active Properties Status</h4>
            {properties.map((p) => (
              <div key={p.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white">{p.name}</h4>
                  <p className="text-[10px] text-slate-400">{p.locality}, {p.city}</p>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                  {p.inspectionStatus}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* DISPUTES & COMPLAINTS */}
        {activeAdminTab === 'complaints' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white">Resident Complaints & Warden Grievances</h3>
            {complaints.map((c) => (
              <div key={c.id} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-[#A78BFA]">{c.id}</span>
                    <h4 className="font-bold text-white mt-0.5">{c.propertyName}</h4>
                    <p className="text-[10px] text-slate-400">By {c.customerName} • {c.category}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'RESOLVED_BY_ADMIN'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 bg-slate-800 p-2.5 rounded-xl">
                  "{c.description}"
                </p>

                {c.status === 'OPEN' && (
                  <div className="space-y-2 pt-1">
                    {activeComplaintId === c.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          placeholder="Enter administrative directive to property warden..."
                          className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              resolveComplaintTicket(c.id, resolutionNote || 'Warden issued maintenance ultimatum');
                              setActiveComplaintId(null);
                              setResolutionNote('');
                            }}
                            className="flex-1 py-1.5 bg-emerald-600 font-bold rounded-lg text-white"
                          >
                            Save Resolution & Notify Resident
                          </button>
                          <button
                            onClick={() => setActiveComplaintId(null)}
                            className="px-3 py-1.5 border border-slate-700 text-slate-400 rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveComplaintId(c.id)}
                        className="w-full py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] font-bold text-white rounded-xl"
                      >
                        Intervene & Resolve Ticket
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SECURITY AUDIT TRAIL */}
        {activeAdminTab === 'audit' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white">Immutable Security Audit Trail</h3>
              <span className="text-[10px] text-slate-400">Recorded Server Events</span>
            </div>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1"
                >
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{log.timestamp}</span>
                    <span
                      className={
                        log.status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400 font-bold'
                      }
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="text-white font-semibold">
                    [{log.actorRole}] {log.actorEmail}
                  </div>
                  <div className="text-slate-300">
                    → Action: <span className="text-indigo-300">{log.action}</span> (IP: {log.ipAddress})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Safety Audit / Inspection Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 w-full max-w-sm text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Log Property Safety Audit</h3>
              <button onClick={() => setShowInspectionModal(false)} className="text-slate-400">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Target Property</label>
              <select
                value={inspPropertyId}
                onChange={(e) => setInspPropertyId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.locality})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="font-bold text-slate-300">Safety & Hygiene Score</label>
                <span className="font-bold text-emerald-400">{inspScore} / 100</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={inspScore}
                onChange={(e) => setInspScore(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-2 rounded-xl">
                <input
                  type="checkbox"
                  checked={inspFireNoc}
                  onChange={(e) => setInspFireNoc(e.target.checked)}
                />
                <span>Fire NOC Valid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-2 rounded-xl">
                <input
                  type="checkbox"
                  checked={inspCctv}
                  onChange={(e) => setInspCctv(e.target.checked)}
                />
                <span>24/7 CCTV Active</span>
              </label>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Hygiene Rating</label>
              <select
                value={inspHygiene}
                onChange={(e) => setInspHygiene(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white"
              >
                <option value="EXCELLENT">EXCELLENT</option>
                <option value="SATISFACTORY">SATISFACTORY</option>
                <option value="ACTION_REQUIRED">ACTION REQUIRED</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Auditor Field Notes</label>
              <textarea
                rows={2}
                value={inspNotes}
                onChange={(e) => setInspNotes(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  const targetProp = properties.find((p) => p.id === inspPropertyId);
                  addInspectionReport({
                    propertyId: inspPropertyId,
                    propertyName: targetProp?.name || 'Property',
                    inspectorName: adminSession.name,
                    auditScore: inspScore,
                    fireNocVerified: inspFireNoc,
                    cctvWorking: inspCctv,
                    hygieneStatus: inspHygiene,
                    notes: inspNotes,
                  });
                  setShowInspectionModal(false);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-white"
              >
                File & Certify Audit
              </button>
              <button
                onClick={() => setShowInspectionModal(false)}
                className="px-4 py-2.5 border border-slate-700 text-slate-400 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

