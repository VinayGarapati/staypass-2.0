import React, { useState } from 'react';
import { useStayPassStore } from '../../store/useStayPassStore';
import { Property, Floor, Room, Bed, BedStatus, SharingType } from '../../models/types';
import { StayPassBadge } from '../../components/StayPassBadge';
import { StayPassButton } from '../../components/StayPassButton';
import {
  Building2,
  Bed as BedIcon,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  Calendar,
  LogOut,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Phone,
  Clock,
  BarChart3,
  Star,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  Key,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  ArrowLeft,
  UserCheck,
  UserMinus,
  Wrench,
  Ban,
  CheckCircle,
  History,
  DoorOpen,
  Layers,
  FileSpreadsheet,
  Filter,
  Copy,
  Check,
  CalendarRange,
  Search
} from 'lucide-react';

export const OwnerPortal: React.FC = () => {
  const {
    ownerSession,
    properties,
    bookings,
    updateBookingStatusByOwner,
    updateBedStatus,
    checkInGuest,
    checkOutGuest,
    addRoom,
    updateRoom,
    deleteRoom,
    addBedToRoom,
    removeBedFromRoom,
    toggleBedMaintenance,
    toggleBedBlocked,
    addFloor,
    updateFloor,
    deleteFloor,
    getDateWiseVacancy,
    getPropertyVacancySummary,
    isOwnerTotpEnrolled,
    enrollOwnerTotp,
    bedStatusHistory,
    getOwnerPerformance,
    activeSession,
    rotateSessionToken,
    showToast,
  } = useStayPassStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'rooms_beds' | 'requests' | 'performance' | 'history' | 'revenue'>('rooms_beds');
  const [selectedProperty, setSelectedProperty] = useState<Property>(properties[0]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Room Search & Filter State
  const [roomSearchQuery, setRoomSearchQuery] = useState<string>('');
  const [roomFilterStatus, setRoomFilterStatus] = useState<'ALL' | 'HAS_VACANCY' | 'OCCUPIED' | 'MAINTENANCE'>('ALL');
  const [recentlyUpdatedBedId, setRecentlyUpdatedBedId] = useState<string | null>(null);

  // Floor Selection & Management State
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('ALL');
  const [showManageFloorsModal, setShowManageFloorsModal] = useState<boolean>(false);
  const [showAddFloorModal, setShowAddFloorModal] = useState<boolean>(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [newFloorNumber, setNewFloorNumber] = useState<number>(1);
  const [newFloorName, setNewFloorName] = useState<string>('1st Floor');
  const [newBuildingBlock, setNewBuildingBlock] = useState<string>('Main Block');
  const [newFloorDescription, setNewFloorDescription] = useState<string>('');

  // Date-Wise Vacancy Engine State
  const todayStr = new Date().toISOString().slice(0, 10);
  const nextMonthDate = new Date();
  nextMonthDate.setDate(nextMonthDate.getDate() + 30);
  const nextMonthStr = nextMonthDate.toISOString().slice(0, 10);

  const [dateVacancyCheckIn, setDateVacancyCheckIn] = useState<string>(todayStr);
  const [dateVacancyCheckOut, setDateVacancyCheckOut] = useState<string>(nextMonthStr);
  const [isDateVacancyActive, setIsDateVacancyActive] = useState<boolean>(false);

  // Google Authenticator 2FA State
  const [show2faModal, setShow2faModal] = useState<boolean>(false);
  const [totpCodeInput, setTotpCodeInput] = useState<string>('');
  const [copiedSecretKey, setCopiedSecretKey] = useState<boolean>(false);

  // Modals
  const [showAddRoomModal, setShowAddRoomModal] = useState<boolean>(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState<Room | null>(null);
  const [activeBedModal, setActiveBedModal] = useState<{ room: Room; bed: Bed } | null>(null);
  const [bedModalAction, setBedModalAction] = useState<'view' | 'checkin' | 'checkout' | 'status'>('view');

  // Add Room Form State
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState('1st Floor');
  const [newSharingType, setNewSharingType] = useState<SharingType>('3-Sharing');
  const [newHasAC, setNewHasAC] = useState(true);
  const [newAttachedWashroom, setNewAttachedWashroom] = useState(true);
  const [newMonthlyPrice, setNewMonthlyPrice] = useState(8500);
  const [newDailyPrice, setNewDailyPrice] = useState(500);
  const [newFacilities, setNewFacilities] = useState<string[]>(['Attached Washroom', 'Split AC', 'Individual Wardrobe']);

  // Edit Room Form State
  const [editMonthlyPrice, setEditMonthlyPrice] = useState(8500);
  const [editDailyPrice, setEditDailyPrice] = useState(500);
  const [editHasAC, setEditHasAC] = useState(true);
  const [editAttachedWashroom, setEditAttachedWashroom] = useState(true);

  // Bed Action Form State
  const [checkInName, setCheckInName] = useState('');
  const [checkInPhone, setCheckInPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().slice(0, 10));
  const [checkInDuration, setCheckInDuration] = useState(1);
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [newStatusSelect, setNewStatusSelect] = useState<BedStatus>('VACANT');
  const [statusReason, setStatusReason] = useState('');

  // Filter bookings for this owner
  const currentProperty = properties.find((p) => p.id === selectedProperty.id) || properties[0];
  const ownerBookings = bookings.filter((b) => b.propertyId === currentProperty.id);
  const pendingRequests = ownerBookings.filter((b) => b.status === 'PENDING_OWNER_CONFIRMATION');

  // Aggregated Bed Status Counts across all rooms in current property
  const allBeds = currentProperty.rooms.flatMap((r) => r.beds);
  const totalRoomsCount = currentProperty.rooms.length;
  const totalBedsCount = allBeds.length;
  const vacantBedsCount = allBeds.filter((b) => b.status === 'VACANT').length;
  const bookedBedsCount = allBeds.filter((b) => b.status === 'BOOKED').length;
  const occupiedBedsCount = allBeds.filter((b) => b.status === 'OCCUPIED').length;
  const maintenanceBedsCount = allBeds.filter((b) => b.status === 'MAINTENANCE').length;
  const blockedBedsCount = allBeds.filter((b) => b.status === 'BLOCKED').length;
  const occupancyPercentage = totalBedsCount > 0 ? Math.round((occupiedBedsCount / totalBedsCount) * 100) : 0;

  const performance = getOwnerPerformance(ownerSession.id);

  // Room Selected for detailed drilldown
  const activeDetailedRoom = selectedRoomId
    ? currentProperty.rooms.find((r) => r.id === selectedRoomId) || null
    : null;

  // Floors list
  const propertyFloors = currentProperty.floors || [];

  // Filtered rooms based on floor selection
  const filteredRooms = selectedFloorFilter === 'ALL'
    ? currentProperty.rooms
    : currentProperty.rooms.filter((r) => r.floor === selectedFloorFilter || r.floorId === selectedFloorFilter);

  // Date-wise vacancy calculation
  const vacancySummary = getPropertyVacancySummary(currentProperty.id, dateVacancyCheckIn, dateVacancyCheckOut);
  const dateWiseAvailability = getDateWiseVacancy(currentProperty.id, dateVacancyCheckIn, dateVacancyCheckOut);

  const triggerRecentBedPulse = (bedId: string) => {
    setRecentlyUpdatedBedId(bedId);
    setTimeout(() => {
      setRecentlyUpdatedBedId((prev) => (prev === bedId ? null : prev));
    }, 2500);
  };

  // Dynamic room filtering by floor, search query, and status
  const displayedRooms = filteredRooms.filter((r) => {
    if (roomSearchQuery.trim()) {
      const q = roomSearchQuery.toLowerCase().trim();
      const matchRoom = r.roomNumber.toLowerCase().includes(q) || r.floor.toLowerCase().includes(q);
      const matchBed = r.beds.some(
        (b) => b.code.toLowerCase().includes(q) || (b.currentGuestName && b.currentGuestName.toLowerCase().includes(q))
      );
      if (!matchRoom && !matchBed) return false;
    }

    if (roomFilterStatus === 'HAS_VACANCY') {
      return r.beds.some((b) => b.status === 'VACANT');
    }
    if (roomFilterStatus === 'OCCUPIED') {
      return r.beds.some((b) => b.status === 'OCCUPIED');
    }
    if (roomFilterStatus === 'MAINTENANCE') {
      return r.beds.some((b) => b.status === 'MAINTENANCE' || b.status === 'BLOCKED');
    }

    return true;
  });

  const handleOpenBedModal = (room: Room, bed: Bed) => {
    setActiveBedModal({ room, bed });
    setNewStatusSelect(bed.status);
    setBedModalAction('view');
    setCheckInName('');
    setCheckInPhone('+91 ');
    setCheckOutNotes('');
    setStatusReason('');
  };

  const handleExecuteCheckIn = () => {
    if (!activeBedModal) return;
    if (!checkInName.trim() || checkInPhone.length < 10) {
      showToast('Please provide valid guest name and 10-digit phone number.');
      return;
    }
    const targetBedId = activeBedModal.bed.id;
    checkInGuest(currentProperty.id, activeBedModal.room.id, activeBedModal.bed.id, {
      name: checkInName,
      phone: checkInPhone,
      checkInDate,
      durationMonths: checkInDuration,
    });
    triggerRecentBedPulse(targetBedId);
    setActiveBedModal(null);
  };

  const handleExecuteCheckOut = () => {
    if (!activeBedModal) return;
    const targetBedId = activeBedModal.bed.id;
    const ok = checkOutGuest(currentProperty.id, activeBedModal.room.id, activeBedModal.bed.id, {
      notes: checkOutNotes || 'Standard checkout inspection cleared',
    });
    if (ok) {
      triggerRecentBedPulse(targetBedId);
      setActiveBedModal(null);
    }
  };

  const handleExecuteStatusChange = () => {
    if (!activeBedModal) return;
    if (activeBedModal.bed.status === 'OCCUPIED' && newStatusSelect === 'VACANT') {
      showToast('Action Blocked: Active residents must be checked out through the Check-Out Guest workflow for deposit refund audit.');
      return;
    }
    const targetBedId = activeBedModal.bed.id;
    const ok = updateBedStatus(
      currentProperty.id,
      activeBedModal.room.id,
      activeBedModal.bed.id,
      newStatusSelect,
      statusReason || `Warden manual status change to ${newStatusSelect}`
    );
    if (ok) {
      triggerRecentBedPulse(targetBedId);
      setActiveBedModal(null);
    }
  };

  const handleToggleMaintenance = () => {
    if (!activeBedModal) return;
    const targetBedId = activeBedModal.bed.id;
    const ok = toggleBedMaintenance(
      currentProperty.id,
      activeBedModal.room.id,
      activeBedModal.bed.id,
      statusReason || 'Sanitation / maintenance routine'
    );
    if (ok) {
      triggerRecentBedPulse(targetBedId);
      setActiveBedModal(null);
    }
  };

  const handleToggleBlocked = () => {
    if (!activeBedModal) return;
    const targetBedId = activeBedModal.bed.id;
    const ok = toggleBedBlocked(
      currentProperty.id,
      activeBedModal.room.id,
      activeBedModal.bed.id,
      statusReason || 'Warden administrative lock'
    );
    if (ok) {
      triggerRecentBedPulse(targetBedId);
      setActiveBedModal(null);
    }
  };

  const handleCreateFloor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFloorName.trim()) {
      showToast('Please enter a floor name (e.g. Ground Floor, 1st Floor)');
      return;
    }
    const created = addFloor(currentProperty.id, {
      floorNumber: Number(newFloorNumber),
      floorName: newFloorName.trim(),
      buildingBlock: newBuildingBlock.trim() || 'Main Wing',
      description: newFloorDescription.trim() || undefined,
    });
    if (created) {
      setShowAddFloorModal(false);
      setNewFloorName('');
      setNewFloorDescription('');
    }
  };

  const handleVerifyOwnerTotp = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCodeInput.length !== 6) {
      showToast('Please enter a 6-digit verification code from Google Authenticator.');
      return;
    }
    const ok = enrollOwnerTotp(totpCodeInput);
    if (ok) {
      setShow2faModal(false);
      setTotpCodeInput('');
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber.trim()) {
      showToast('Please enter room number (e.g. 102 or 201)');
      return;
    }
    const matchedFloor = propertyFloors.find((f) => f.floorName === newRoomFloor);
    const created = addRoom(currentProperty.id, {
      roomNumber: newRoomNumber,
      floor: newRoomFloor,
      floorId: matchedFloor?.id,
      sharingType: newSharingType,
      hasAC: newHasAC,
      attachedWashroom: newAttachedWashroom,
      monthlyPrice: Number(newMonthlyPrice),
      dailyPrice: Number(newDailyPrice),
      facilities: newFacilities,
    });
    if (created) {
      setShowAddRoomModal(false);
      setNewRoomNumber('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9F9FF] overflow-y-auto">
      {/* Owner Header */}
      <div className="bg-[#151C27] text-white p-4 shrink-0 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#246BCE] flex items-center justify-center font-bold text-sm shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold">{ownerSession.name}</h1>
                <span className="bg-[#198754] text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                  VERIFIED
                </span>
              </div>
              <p className="text-[10px] text-[#C2C6D5]">
                {ownerSession.ownerIdCode} • {currentProperty.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md text-[#93F7BA] font-semibold">
              Warden Portal
            </span>
          </div>
        </div>

        {/* SecureStore Token Badge & 2FA Status */}
        <div className="mt-2.5 bg-white/5 border border-white/10 rounded-xl p-2 flex items-center justify-between text-[10px] gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Key className="w-3 h-3 text-[#93F7BA] shrink-0" />
            <span className="text-[#C2C6D5] truncate">
              Token: <span className="font-mono text-[#93F7BA]">{activeSession?.accessToken.slice(0, 12)}...</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShow2faModal(true)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[10px] transition-colors ${
                isOwnerTotpEnrolled
                  ? 'bg-[#198754]/30 text-[#93F7BA] border border-[#198754]/50 hover:bg-[#198754]/40'
                  : 'bg-[#D97706]/30 text-[#FDE68A] border border-[#D97706]/50 hover:bg-[#D97706]/40'
              }`}
            >
              {isOwnerTotpEnrolled ? (
                <>
                  <ShieldCheck className="w-2.5 h-2.5 text-[#93F7BA]" />
                  <span>2FA Active</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-2.5 h-2.5 text-[#FDE68A]" />
                  <span>Setup 2FA</span>
                </>
              )}
            </button>
            <button
              onClick={() => rotateSessionToken()}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
              title="Rotate AES Session Key"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Rotate</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3 border-t border-white/10 pt-2 text-xs overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'rooms_beds', label: 'Rooms & Beds' },
            { id: 'overview', label: 'Dashboard' },
            { id: 'requests', label: `Requests (${pendingRequests.length})` },
            { id: 'performance', label: 'Analytics' },
            { id: 'history', label: 'Bed History' },
            { id: 'revenue', label: 'Settlement' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id !== 'rooms_beds') setSelectedRoomId(null);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-center font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#246BCE] text-white font-bold shadow-xs'
                  : 'text-[#C2C6D5] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area */}
      <div className="p-3 md:p-4 flex-1 space-y-4">
        {/* ROOMS & BEDS MANAGEMENT TAB */}
        {activeTab === 'rooms_beds' && (
          <div className="space-y-4">
            {/* Top Summary Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#C2C6D5]/40 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-[#151C27] flex items-center gap-1.5">
                    <DoorOpen className="w-4 h-4 text-[#246BCE]" />
                    <span>Property Bed Inventory Summary</span>
                  </h2>
                  <p className="text-[10px] text-[#555E74]">Real-time status breakdown across all rooms</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsDateVacancyActive(!isDateVacancyActive)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                      isDateVacancyActive
                        ? 'bg-[#EBF3FE] text-[#246BCE] border-[#246BCE]/40'
                        : 'bg-white text-[#555E74] border-[#C2C6D5]/60 hover:bg-[#F9F9FF]'
                    }`}
                  >
                    <CalendarRange className="w-3.5 h-3.5" />
                    <span>{isDateVacancyActive ? 'Hide Vacancy Engine' : 'Date Vacancy'}</span>
                  </button>
                  <button
                    onClick={() => setShowAddRoomModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#246BCE] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1B54A6] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Room</span>
                  </button>
                </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-[#F0F3FF] p-2 rounded-xl border border-[#246BCE]/20">
                  <span className="text-[10px] text-[#555E74] block">Total Rooms</span>
                  <span className="text-base font-bold text-[#151C27] tabular-nums">{totalRoomsCount}</span>
                </div>
                <div className="bg-[#F0F3FF] p-2 rounded-xl border border-[#246BCE]/20">
                  <span className="text-[10px] text-[#555E74] block">Total Beds</span>
                  <span className="text-base font-bold text-[#0052AC] tabular-nums">{totalBedsCount}</span>
                </div>
                <div className="bg-[#E8F5E9] p-2 rounded-xl border border-[#198754]/30">
                  <span className="text-[10px] text-[#198754] font-semibold block">Vacant</span>
                  <span className="text-base font-bold text-[#198754] tabular-nums">{vacantBedsCount}</span>
                </div>
                <div className="bg-[#FEF3C7] p-2 rounded-xl border border-[#D97706]/30">
                  <span className="text-[10px] text-[#92400E] font-semibold block">Booked</span>
                  <span className="text-base font-bold text-[#D97706] tabular-nums">{bookedBedsCount}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-[#EBF3FE] p-2 rounded-xl border border-[#246BCE]/30">
                  <span className="text-[10px] text-[#246BCE] font-semibold block">Occupied</span>
                  <span className="text-base font-bold text-[#246BCE] tabular-nums">{occupiedBedsCount} ({occupancyPercentage}%)</span>
                </div>
                <div className="bg-[#FFF3E0] p-2 rounded-xl border border-[#F57C00]/30">
                  <span className="text-[10px] text-[#E65100] font-semibold block">Maintenance</span>
                  <span className="text-base font-bold text-[#F57C00] tabular-nums">{maintenanceBedsCount}</span>
                </div>
                <div className="bg-[#FFEBEE] p-2 rounded-xl border border-[#D32F2F]/30">
                  <span className="text-[10px] text-[#C62828] font-semibold block">Blocked</span>
                  <span className="text-base font-bold text-[#D32F2F] tabular-nums">{blockedBedsCount}</span>
                </div>
              </div>

              {/* DATE-WISE VACANCY CALCULATION ENGINE ACCORDION */}
              {isDateVacancyActive && (
                <div className="mt-3 p-3 bg-[#F0F3FF] rounded-xl border border-[#246BCE]/30 space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#246BCE]" />
                      <span className="text-xs font-bold text-[#0052AC]">Date-Wise Vacancy & Overlap Calculator</span>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white text-[#246BCE] border border-[#246BCE]/20 font-semibold">
                      Real-time Firestore Rules Engine
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-[#151C27] block mb-0.5">Check-In Date</label>
                      <input
                        type="date"
                        value={dateVacancyCheckIn}
                        onChange={(e) => setDateVacancyCheckIn(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-[#C2C6D5] bg-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#151C27] block mb-0.5">Check-Out Date</label>
                      <input
                        type="date"
                        value={dateVacancyCheckOut}
                        onChange={(e) => setDateVacancyCheckOut(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-[#C2C6D5] bg-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-white p-2 rounded-lg border border-[#198754]/30">
                      <span className="text-[9px] text-[#198754] font-semibold block">Available in Period</span>
                      <strong className="text-sm font-bold text-[#198754]">{vacancySummary.dateWiseAvailableBedsCount} Beds</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#D97706]/30">
                      <span className="text-[9px] text-[#D97706] font-semibold block">Active Bookings</span>
                      <strong className="text-sm font-bold text-[#D97706]">{vacancySummary.bookedBedsCount} Beds</strong>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#246BCE]/30">
                      <span className="text-[9px] text-[#246BCE] font-semibold block">Residents Staying</span>
                      <strong className="text-sm font-bold text-[#246BCE]">{vacancySummary.occupiedBedsCount} Beds</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-[#555E74] bg-white/70 p-2 rounded-lg border border-[#C2C6D5]/30">
                    💡 <strong>Business Rule:</strong> Date vacancy verifies that requested dates do not overlap existing confirmed bookings (<code>startA &lt; endB && endA &gt; startB</code>) and that bed status is strictly VACANT without maintenance or blocks.
                  </p>
                </div>
              )}

              {/* FLOOR NAVIGATION & MANAGEMENT BAR */}
              <div className="pt-2 border-t border-[#F0F3FF]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#246BCE]" />
                    <span className="text-xs font-bold text-[#151C27]">Floors & Building Blocks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowAddFloorModal(true)}
                      className="flex items-center gap-1 px-2 py-1 bg-[#EBF3FE] text-[#246BCE] text-[10px] font-bold rounded-lg hover:bg-[#D7DFF9] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Floor</span>
                    </button>
                    <button
                      onClick={() => setShowManageFloorsModal(true)}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-[#555E74] text-[10px] font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>Manage Floors ({propertyFloors.length})</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <button
                    onClick={() => setSelectedFloorFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                      selectedFloorFilter === 'ALL'
                        ? 'bg-[#246BCE] text-white shadow-xs'
                        : 'bg-[#F0F3FF] text-[#555E74] hover:bg-[#EBF3FE]'
                    }`}
                  >
                    All Floors ({currentProperty.rooms.length})
                  </button>
                  {propertyFloors.map((fl) => {
                    const roomCountOnFloor = currentProperty.rooms.filter(
                      (r) => r.floor === fl.floorName || r.floorId === fl.id
                    ).length;
                    return (
                      <button
                        key={fl.id}
                        onClick={() => setSelectedFloorFilter(fl.floorName)}
                        className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                          selectedFloorFilter === fl.floorName
                            ? 'bg-[#246BCE] text-white shadow-xs'
                            : 'bg-[#F0F3FF] text-[#555E74] hover:bg-[#EBF3FE]'
                        }`}
                      >
                        {fl.floorName} ({roomCountOnFloor})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* If a room is selected, display Room Details Drilldown */}
            {activeDetailedRoom ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedRoomId(null)}
                    className="flex items-center gap-1 text-xs font-bold text-[#246BCE] hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to All Rooms</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addBedToRoom(currentProperty.id, activeDetailedRoom.id)}
                      className="px-2.5 py-1 bg-[#EBF3FE] text-[#246BCE] text-[11px] font-bold rounded-lg border border-[#246BCE]/30 hover:bg-[#D7DFF9]"
                    >
                      + Add Bed Cot
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#151C27]">{activeDetailedRoom.roomNumber}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3FE] text-[#246BCE]">
                          {activeDetailedRoom.sharingType}
                        </span>
                        {activeDetailedRoom.hasAC && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#198754]">
                            AC
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#555E74] mt-0.5">
                        {activeDetailedRoom.floor} • ₹{activeDetailedRoom.monthlyPrice.toLocaleString('en-IN')}/mo per bed • ₹{activeDetailedRoom.dailyPrice}/day
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#0052AC]">
                      {activeDetailedRoom.beds.filter((b) => b.status === 'VACANT').length} / {activeDetailedRoom.beds.length} Vacant
                    </span>
                  </div>

                  {/* Visual Architectural Bed Layout Grid */}
                  <div className="border-2 border-dashed border-[#C2C6D5]/60 rounded-xl p-3 bg-[#F9F9FF]">
                    <div className="flex items-center justify-between text-[10px] text-[#555E74] mb-2">
                      <span>Interactive Room Floor Plan</span>
                      <span>Tap any bed to open actions</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {activeDetailedRoom.beds.map((bed) => {
                        const statusColors: Record<BedStatus, { bg: string; text: string; border: string }> = {
                          VACANT: { bg: 'bg-[#E8F5E9]', text: 'text-[#198754]', border: 'border-[#198754]/40' },
                          BOOKED: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', border: 'border-[#D97706]/40' },
                          OCCUPIED: { bg: 'bg-[#EBF3FE]', text: 'text-[#246BCE]', border: 'border-[#246BCE]/40' },
                          MAINTENANCE: { bg: 'bg-[#FFF3E0]', text: 'text-[#F57C00]', border: 'border-[#F57C00]/40' },
                          BLOCKED: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]', border: 'border-[#D32F2F]/40' },
                        };
                        const conf = statusColors[bed.status] || statusColors.VACANT;

                        return (
                          <div
                            key={bed.id}
                            onClick={() => handleOpenBedModal(activeDetailedRoom, bed)}
                            className={`p-3 rounded-xl border ${conf.border} bg-white shadow-xs cursor-pointer hover:shadow-md transition-all flex flex-col justify-between min-h-[92px]`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-6 h-6 rounded-lg ${conf.bg} ${conf.text} flex items-center justify-center font-bold text-xs`}>
                                  <BedIcon className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <span className="font-bold text-xs text-[#151C27]">{bed.code}</span>
                                  <p className="text-[9px] text-[#555E74]">{bed.tier}</p>
                                </div>
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${conf.bg} ${conf.text}`}>
                                {bed.status}
                              </span>
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-[#F0F3FF] text-[10px]">
                              {bed.status === 'OCCUPIED' ? (
                                <p className="font-medium text-[#151C27] truncate">
                                  👤 {bed.currentGuestName || 'Resident'}
                                </p>
                              ) : bed.status === 'BOOKED' ? (
                                <p className="font-medium text-[#D97706] truncate">
                                  ⏳ {bed.currentGuestName || 'Booked online'}
                                </p>
                              ) : bed.status === 'MAINTENANCE' ? (
                                <p className="text-[#F57C00] truncate">🔧 Maintenance</p>
                              ) : (
                                <p className="text-[#198754] font-medium">✓ Ready for Guest</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room Facilities Badges */}
                  <div className="flex flex-wrap gap-1 pt-1 text-[10px]">
                    {activeDetailedRoom.facilities.map((fac) => (
                      <span key={fac} className="px-2 py-0.5 rounded-md bg-[#F0F3FF] text-[#555E74]">
                        • {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Room List Cards with Live Bed Matrix */
              <div className="space-y-3">
                {/* Search & Quick Filter Controls */}
                <div className="bg-white p-3 rounded-2xl border border-[#C2C6D5]/40 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#555E74] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by room #, floor, cot code, or resident..."
                        value={roomSearchQuery}
                        onChange={(e) => setRoomSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-[#F9F9FF] border border-[#C2C6D5] rounded-xl text-xs focus:border-[#246BCE] focus:bg-white focus:outline-none"
                      />
                    </div>
                    {roomSearchQuery && (
                      <button
                        onClick={() => setRoomSearchQuery('')}
                        className="px-2.5 py-2 text-xs font-bold text-[#555E74] bg-gray-100 rounded-xl hover:bg-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-semibold scrollbar-none">
                    {[
                      { id: 'ALL', label: `All Rooms (${filteredRooms.length})` },
                      {
                        id: 'HAS_VACANCY',
                        label: `Has Vacancies (${filteredRooms.filter((r) => r.beds.some((b) => b.status === 'VACANT')).length})`,
                      },
                      {
                        id: 'OCCUPIED',
                        label: `Fully Occupied (${filteredRooms.filter((r) => r.beds.every((b) => b.status === 'OCCUPIED')).length})`,
                      },
                      {
                        id: 'MAINTENANCE',
                        label: `Attention (${filteredRooms.filter((r) => r.beds.some((b) => b.status === 'MAINTENANCE' || b.status === 'BLOCKED')).length})`,
                      },
                    ].map((flt) => (
                      <button
                        key={flt.id}
                        onClick={() => setRoomFilterStatus(flt.id as any)}
                        className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                          roomFilterStatus === flt.id
                            ? 'bg-[#0052AC] text-white shadow-2xs font-bold'
                            : 'bg-[#F0F3FF] text-[#555E74] hover:bg-[#EBF3FE]'
                        }`}
                      >
                        {flt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-[#151C27]">
                    {selectedFloorFilter === 'ALL' ? 'Showing Rooms' : selectedFloorFilter} ({displayedRooms.length})
                  </h3>
                  <span className="text-[10px] text-[#555E74]">Click any cot chip to update status</span>
                </div>

                {displayedRooms.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-[#C2C6D5]/40 text-center space-y-2">
                    <DoorOpen className="w-8 h-8 text-[#C2C6D5] mx-auto" />
                    <p className="text-xs font-bold text-[#151C27]">No rooms match the current search / filter</p>
                    <p className="text-[10px] text-[#555E74]">Try clearing the search query or changing the floor / status filter.</p>
                  </div>
                ) : (
                  displayedRooms.map((room) => {
                    const roomVacant = room.beds.filter((b) => b.status === 'VACANT').length;
                    const roomOccupied = room.beds.filter((b) => b.status === 'OCCUPIED').length;
                    const roomBooked = room.beds.filter((b) => b.status === 'BOOKED').length;
                    const roomOccupancyRate = room.beds.length > 0 ? Math.round((roomOccupied / room.beds.length) * 100) : 0;

                    return (
                      <div
                        key={room.id}
                        className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 shadow-xs hover:border-[#246BCE]/50 transition-all space-y-3"
                      >
                        {/* Room Header */}
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-[#151C27]">{room.roomNumber}</h4>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3FE] text-[#246BCE]">
                                {room.sharingType}
                              </span>
                              {room.hasAC ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E8F5E9] text-[#198754]">
                                  AC
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-gray-100 text-[#555E74]">
                                  Non-AC
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#555E74] mt-0.5">
                              {room.floor} • ₹{room.monthlyPrice.toLocaleString('en-IN')}/mo per cot • ₹{room.dailyPrice}/day
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#198754] bg-[#E8F5E9] px-2.5 py-1 rounded-full border border-[#198754]/30 inline-block">
                              {roomVacant} / {room.beds.length} Vacant
                            </span>
                            <span className="text-[10px] text-[#555E74] block mt-0.5">{roomOccupancyRate}% Occupied</span>
                          </div>
                        </div>

                        {/* Room Occupancy Visual Bar */}
                        <div className="w-full bg-[#F0F3FF] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#246BCE] h-full rounded-full transition-all duration-300"
                            style={{ width: `${roomOccupancyRate}%` }}
                          />
                        </div>

                        {/* LIVE INTERACTIVE BED COTS MATRIX */}
                        <div className="pt-1 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-[#555E74]">
                            <span className="font-bold text-[#151C27] flex items-center gap-1">
                              <BedIcon className="w-3 h-3 text-[#246BCE]" />
                              <span>Live Individual Bed Status:</span>
                            </span>
                            <span>Tap cot to update status</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {room.beds.map((bed) => {
                              const isRecentlyUpdated = recentlyUpdatedBedId === bed.id;
                              const statusConfig: Record<BedStatus, { bg: string; text: string; border: string; label: string; icon: string }> = {
                                VACANT: { bg: 'bg-[#E8F5E9]', text: 'text-[#198754]', border: 'border-[#198754]/50', label: 'VACANT', icon: '✓' },
                                BOOKED: { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', border: 'border-[#D97706]/50', label: 'BOOKED', icon: '⏳' },
                                OCCUPIED: { bg: 'bg-[#EBF3FE]', text: 'text-[#246BCE]', border: 'border-[#246BCE]/50', label: 'OCCUPIED', icon: '👤' },
                                MAINTENANCE: { bg: 'bg-[#FFF3E0]', text: 'text-[#F57C00]', border: 'border-[#F57C00]/50', label: 'MAINT.', icon: '🔧' },
                                BLOCKED: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]', border: 'border-[#D32F2F]/50', label: 'BLOCKED', icon: '🚫' },
                              };
                              const cfg = statusConfig[bed.status] || statusConfig.VACANT;

                              return (
                                <button
                                  key={bed.id}
                                  type="button"
                                  onClick={() => handleOpenBedModal(room, bed)}
                                  className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] shadow-2xs ${cfg.bg} ${cfg.border} ${
                                    isRecentlyUpdated ? 'ring-2 ring-[#0052AC] scale-[1.03] animate-pulse' : ''
                                  }`}
                                  title={`Tap to edit ${bed.code} status`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="font-bold text-xs text-[#151C27] flex items-center gap-1">
                                      <BedIcon className="w-3 h-3 text-[#555E74]" />
                                      <span>{bed.code}</span>
                                    </span>
                                    <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded ${cfg.text} bg-white/80 shadow-2xs`}>
                                      {cfg.icon} {cfg.label}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#555E74] mt-1.5 truncate">
                                    {bed.status === 'OCCUPIED' ? (
                                      <span className="font-semibold text-[#151C27] truncate block">
                                        👤 {bed.currentGuestName || 'Resident'}
                                      </span>
                                    ) : bed.status === 'BOOKED' ? (
                                      <span className="font-semibold text-[#D97706] truncate block">
                                        ⏳ {bed.currentGuestName || 'Reserved'}
                                      </span>
                                    ) : bed.status === 'MAINTENANCE' ? (
                                      <span className="text-[#F57C00] font-semibold block">🔧 Repair / Clean</span>
                                    ) : bed.status === 'BLOCKED' ? (
                                      <span className="text-[#D32F2F] font-semibold block">🚫 Locked Cot</span>
                                    ) : (
                                      <span className="text-[#198754] font-medium block">✓ Ready to occupy</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Room Action Row */}
                        <div className="pt-2 border-t border-[#F0F3FF] flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedRoomId(room.id)}
                            className="flex-1 py-1.5 bg-[#246BCE] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#1B54A6] transition-colors shadow-2xs"
                          >
                            <BedIcon className="w-3.5 h-3.5" />
                            <span>Detailed Floor Plan</span>
                          </button>
                          <button
                            onClick={() => addBedToRoom(currentProperty.id, room.id)}
                            className="px-2.5 py-1.5 bg-[#EBF3FE] text-[#246BCE] text-xs font-bold rounded-xl border border-[#246BCE]/30 hover:bg-[#D7DFF9] transition-colors"
                            title="Add extra bed cot to this room"
                          >
                            + Cot
                          </button>
                          <button
                            onClick={() => {
                              setShowEditRoomModal(room);
                              setEditMonthlyPrice(room.monthlyPrice);
                              setEditDailyPrice(room.dailyPrice);
                              setEditHasAC(room.hasAC);
                              setEditAttachedWashroom(room.attachedWashroom);
                            }}
                            className="p-2 rounded-xl border border-[#C2C6D5]/60 text-[#555E74] hover:bg-[#F0F3FF]"
                            title="Edit Room Pricing & Facilities"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteRoom(currentProperty.id, room.id)}
                            className="p-2 rounded-xl border border-rose-300 text-rose-500 hover:bg-rose-50"
                            title="Delete Room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }))}
              </div>
            )}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-[#C2C6D5]/40 shadow-xs">
                <span className="text-[10px] text-[#555E74] block">Occupancy Rate</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-[#0052AC] tabular-nums">{occupancyPercentage}%</span>
                  <span className="text-[10px] text-[#198754] font-semibold">({occupiedBedsCount}/{totalBedsCount} Beds)</span>
                </div>
                <div className="w-full bg-[#EBF3FE] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#246BCE] h-full rounded-full" style={{ width: `${occupancyPercentage}%` }} />
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#C2C6D5]/40 shadow-xs">
                <span className="text-[10px] text-[#555E74] block">Monthly Gross Rent</span>
                <span className="text-xl font-bold text-[#151C27] block mt-1 tabular-nums">
                  ₹{(occupiedBedsCount * currentProperty.pricePerMonth).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#198754] flex items-center gap-0.5 mt-1">
                  <TrendingUp className="w-3 h-3" /> +{performance.occupancyDelta}% vs last month
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#151C27]">Warden Operations Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setActiveTab('rooms_beds')}
                  className="p-3 bg-[#F0F3FF] text-[#0052AC] font-semibold rounded-xl text-left border border-[#246BCE]/20 flex items-center justify-between"
                >
                  <span>Manage Beds</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="p-3 bg-[#F0F3FF] text-[#0052AC] font-semibold rounded-xl text-left border border-[#246BCE]/20 flex items-center justify-between"
                >
                  <span>View Requests ({pendingRequests.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#151C27]">Customer Bed Booking Requests</h3>
            {ownerBookings.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#555E74]">
                No booking requests received yet.
              </div>
            ) : (
              ownerBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-3.5 rounded-2xl border border-[#C2C6D5]/40 shadow-xs text-xs space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-[#0052AC]">{b.id}</span>
                      <h4 className="font-bold text-sm text-[#151C27] mt-0.5">{b.customerName}</h4>
                      <p className="text-[10px] text-[#555E74] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#246BCE]" />
                        <span>{b.customerPhone}</span> • <span>{b.customerGender}</span>
                      </p>
                    </div>
                    <StayPassBadge
                      text={b.status.replace(/_/g, ' ')}
                      type={
                        b.status === 'CONFIRMED' || b.status === 'CHECKED_IN'
                          ? 'VERIFIED'
                          : b.status === 'PENDING_OWNER_CONFIRMATION'
                          ? 'PENDING'
                          : 'NEUTRAL'
                      }
                    />
                  </div>

                  <div className="p-2.5 bg-[#F9F9FF] rounded-xl border border-[#C2C6D5]/30 flex justify-between items-center text-[11px]">
                    <div>
                      <span className="text-[#555E74]">Room / Bed: </span>
                      <strong className="text-[#151C27]">{b.roomNumber} ({b.bedCode})</strong>
                    </div>
                    <div>
                      <span className="text-[#555E74]">Check-in: </span>
                      <strong className="text-[#151C27]">{b.checkInDate}</strong>
                    </div>
                  </div>

                  {b.status === 'PENDING_OWNER_CONFIRMATION' && (
                    <div className="pt-2 border-t border-[#F0F3FF] flex gap-2">
                      <button
                        onClick={() => updateBookingStatusByOwner(b.id, 'CONFIRMED')}
                        className="flex-1 py-2 bg-[#198754] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-[#146c43]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Bed Booking</span>
                      </button>
                      <button
                        onClick={() => updateBookingStatusByOwner(b.id, 'REJECTED', 'Bed occupied by physical walk-in')}
                        className="px-3 py-2 border border-[#BA1A1A] text-[#BA1A1A] rounded-xl text-xs font-bold hover:bg-[#FFDAD6]/30"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PERFORMANCE & ROOM ANALYTICS TAB */}
        {activeTab === 'performance' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-[#0052AC] to-[#246BCE] text-white p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#93F7BA]" />
                <span className="text-[11px] font-bold tracking-wide uppercase text-[#ECF0FF]">
                  Room Revenue & Occupancy Analytics
                </span>
              </div>
              <p className="text-sm font-bold">
                {currentProperty.name} • {occupancyPercentage}% Current Bed Occupancy
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                  <span className="text-[10px] text-white/80 block">Active Occupied Beds</span>
                  <strong className="text-lg text-white font-bold">{occupiedBedsCount} Beds</strong>
                </div>
                <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                  <span className="text-[10px] text-white/80 block">Estimated Revenue</span>
                  <strong className="text-lg text-[#93F7BA] font-bold">
                    ₹{(occupiedBedsCount * currentProperty.pricePerMonth).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>

            {/* Individual Room Performance Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-[#151C27] flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#246BCE]" />
                <span>Room by Room Occupancy Breakdown</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                {currentProperty.rooms.map((r) => {
                  const rOccupied = r.beds.filter((b) => b.status === 'OCCUPIED').length;
                  const rRate = r.beds.length > 0 ? Math.round((rOccupied / r.beds.length) * 100) : 0;
                  return (
                    <div key={r.id} className="p-2.5 rounded-xl bg-[#F9F9FF] border border-[#C2C6D5]/30">
                      <div className="flex justify-between items-center text-[11px] mb-1">
                        <span className="font-bold text-[#151C27]">{r.roomNumber} ({r.sharingType})</span>
                        <span className="font-bold text-[#0052AC]">{rOccupied} / {r.beds.length} ({rRate}%)</span>
                      </div>
                      <div className="w-full bg-[#EBF3FE] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#246BCE] h-full rounded-full transition-all"
                          style={{ width: `${rRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STATUS HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#151C27] flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#246BCE]" />
                <span>Bed Status Audit Log</span>
              </h3>
              <span className="text-[10px] text-[#555E74]">{bedStatusHistory.length} events logged</span>
            </div>

            <div className="space-y-2">
              {bedStatusHistory.map((item) => (
                <div key={item.historyId} className="bg-white p-3 rounded-xl border border-[#C2C6D5]/40 text-xs shadow-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-[#151C27]">{item.bedCode}</span>
                    <span className="text-[10px] font-mono text-[#555E74]">{item.changedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-1.5 py-0.2 rounded bg-gray-100 text-[#555E74]">{item.previousStatus}</span>
                    <span>→</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#EBF3FE] text-[#246BCE] font-bold">{item.newStatus}</span>
                    <span className="text-[#555E74] text-[10px]">by {item.changedBy}</span>
                  </div>
                  {item.reason && (
                    <p className="text-[10px] text-[#555E74] bg-[#F9F9FF] p-1.5 rounded mt-1">
                      {item.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTLEMENT & REVENUE TAB */}
        {activeTab === 'revenue' && (
          <div className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 text-xs space-y-3">
            <h3 className="font-bold text-[#151C27]">Monthly Bank Settlement & Collections</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-[#F0F3FF]">
                <span className="text-[#555E74]">Total Occupied Resident Beds:</span>
                <strong className="text-[#151C27]">{occupiedBedsCount}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0F3FF]">
                <span className="text-[#555E74]">Gross Rent Collections:</span>
                <strong className="text-[#151C27] tabular-nums">
                  ₹{(occupiedBedsCount * currentProperty.pricePerMonth).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0F3FF]">
                <span className="text-[#555E74]">Security Deposits Held in Escrow:</span>
                <strong className="text-[#151C27] tabular-nums">
                  ₹{(occupiedBedsCount * 5000).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#F0F3FF]">
                <span className="text-[#555E74]">StayPass Commission (3%):</span>
                <strong className="text-[#BA1A1A] tabular-nums">
                  -₹{Math.round(occupiedBedsCount * currentProperty.pricePerMonth * 0.03).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between pt-2 font-bold text-sm text-[#198754]">
                <span>Net Bank Payout (Cleared):</span>
                <span className="tabular-nums">
                  ₹{Math.round(occupiedBedsCount * currentProperty.pricePerMonth * 0.97).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD ROOM MODAL */}
      {showAddRoomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#C2C6D5]/40 max-h-[90%] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0F3FF]">
              <div className="flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-[#246BCE]" />
                <h3 className="text-sm font-bold text-[#151C27]">Add New Room</h3>
              </div>
              <button onClick={() => setShowAddRoomModal(false)} className="text-[#555E74] p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="font-bold text-[#151C27] block mb-1">Room Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 102 or 204"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#C2C6D5] focus:border-[#246BCE] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Floor</label>
                  <select
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5] bg-white font-medium"
                  >
                    {propertyFloors.length > 0 ? (
                      propertyFloors.map((fl) => (
                        <option key={fl.id} value={fl.floorName}>
                          {fl.floorName} ({fl.buildingBlock || 'Main Wing'})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Ground Floor">Ground Floor</option>
                        <option value="1st Floor">1st Floor</option>
                        <option value="2nd Floor">2nd Floor</option>
                        <option value="3rd Floor">3rd Floor</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Sharing Type</label>
                  <select
                    value={newSharingType}
                    onChange={(e) => setNewSharingType(e.target.value as SharingType)}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5] bg-white"
                  >
                    <option value="2-Sharing">2-Sharing (2 Beds)</option>
                    <option value="3-Sharing">3-Sharing (3 Beds)</option>
                    <option value="4-Sharing">4-Sharing (4 Beds)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={newMonthlyPrice}
                    onChange={(e) => setNewMonthlyPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Daily Price (₹)</label>
                  <input
                    type="number"
                    value={newDailyPrice}
                    onChange={(e) => setNewDailyPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newHasAC}
                    onChange={(e) => setNewHasAC(e.target.checked)}
                    className="rounded text-[#246BCE]"
                  />
                  <span>Split AC</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAttachedWashroom}
                    onChange={(e) => setNewAttachedWashroom(e.target.checked)}
                    className="rounded text-[#246BCE]"
                  />
                  <span>Attached Washroom</span>
                </label>
              </div>

              {/* Automatic Bed Generation Preview */}
              <div className="bg-[#EBF3FE] p-3 rounded-xl border border-[#246BCE]/20 text-[11px] text-[#0052AC]">
                <p className="font-bold mb-1">Automatic Bed Generation Preview:</p>
                <p>
                  Will create {newSharingType === '2-Sharing' ? 2 : newSharingType === '3-Sharing' ? 3 : 4} unique cots:{' '}
                  <strong>
                    Bed {newRoomNumber || '___'}-A, Bed {newRoomNumber || '___'}-B
                    {newSharingType !== '2-Sharing' && `, Bed ${newRoomNumber || '___'}-C`}
                    {newSharingType === '4-Sharing' && `, Bed ${newRoomNumber || '___'}-D`}
                  </strong>{' '}
                  (all initial status: VACANT).
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#246BCE] text-white rounded-xl font-bold shadow-md hover:bg-[#1B54A6]"
                >
                  Create Room & Beds
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2.5 border border-[#C2C6D5] rounded-xl text-[#555E74]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ROOM MODAL */}
      {showEditRoomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#C2C6D5]/40">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0F3FF]">
              <h3 className="text-sm font-bold text-[#151C27]">Edit {showEditRoomModal.roomNumber}</h3>
              <button onClick={() => setShowEditRoomModal(null)} className="text-[#555E74] p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={editMonthlyPrice}
                    onChange={(e) => setEditMonthlyPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Daily Price (₹)</label>
                  <input
                    type="number"
                    value={editDailyPrice}
                    onChange={(e) => setEditDailyPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editHasAC}
                    onChange={(e) => setEditHasAC(e.target.checked)}
                    className="rounded text-[#246BCE]"
                  />
                  <span>Split AC</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editAttachedWashroom}
                    onChange={(e) => setEditAttachedWashroom(e.target.checked)}
                    className="rounded text-[#246BCE]"
                  />
                  <span>Attached Washroom</span>
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    updateRoom(currentProperty.id, showEditRoomModal.id, {
                      monthlyPrice: editMonthlyPrice,
                      dailyPrice: editDailyPrice,
                      hasAC: editHasAC,
                      attachedWashroom: editAttachedWashroom,
                    });
                    setShowEditRoomModal(null);
                  }}
                  className="flex-1 py-2.5 bg-[#246BCE] text-white rounded-xl font-bold shadow-md hover:bg-[#1B54A6]"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditRoomModal(null)}
                  className="px-4 py-2.5 border border-[#C2C6D5] rounded-xl text-[#555E74]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: BED DETAILS & ACTIONS MODAL */}
      {activeBedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#C2C6D5]/40 max-h-[90%] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0F3FF]">
              <div>
                <h3 className="text-sm font-bold text-[#151C27]">{activeBedModal.bed.code}</h3>
                <p className="text-[10px] text-[#555E74]">
                  {activeBedModal.room.roomNumber} • {activeBedModal.bed.tier}
                </p>
              </div>
              <button onClick={() => setActiveBedModal(null)} className="text-[#555E74] p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Tabs inside Bed Modal */}
            <div className="flex gap-1 mt-3 bg-[#F0F3FF] p-1 rounded-xl text-[11px] font-semibold">
              <button
                onClick={() => setBedModalAction('view')}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  bedModalAction === 'view' ? 'bg-white text-[#246BCE] shadow-xs' : 'text-[#555E74]'
                }`}
              >
                Details
              </button>
              {activeBedModal.bed.status !== 'OCCUPIED' ? (
                <button
                  onClick={() => setBedModalAction('checkin')}
                  className={`flex-1 py-1 rounded-lg transition-colors ${
                    bedModalAction === 'checkin' ? 'bg-white text-[#198754] shadow-xs' : 'text-[#555E74]'
                  }`}
                >
                  Check-In
                </button>
              ) : (
                <button
                  onClick={() => setBedModalAction('checkout')}
                  className={`flex-1 py-1 rounded-lg transition-colors ${
                    bedModalAction === 'checkout' ? 'bg-white text-[#D97706] shadow-xs' : 'text-[#555E74]'
                  }`}
                >
                  Check-Out
                </button>
              )}
              <button
                onClick={() => setBedModalAction('status')}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  bedModalAction === 'status' ? 'bg-white text-[#151C27] shadow-xs' : 'text-[#555E74]'
                }`}
              >
                Status
              </button>
            </div>

            {/* VIEW TAB */}
            {bedModalAction === 'view' && (
              <div className="mt-3 space-y-3 text-xs">
                <div className="p-3 bg-[#F9F9FF] rounded-xl border border-[#C2C6D5]/40 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#555E74]">Current Status:</span>
                    <span className="font-bold text-[#0052AC]">{activeBedModal.bed.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555E74]">Monthly Price:</span>
                    <strong className="text-[#151C27]">₹{activeBedModal.bed.monthlyPrice.toLocaleString('en-IN')}</strong>
                  </div>
                  {activeBedModal.bed.currentGuestName && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#555E74]">Resident Name:</span>
                        <strong className="text-[#151C27]">{activeBedModal.bed.currentGuestName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#555E74]">Phone:</span>
                        <strong className="text-[#151C27]">{activeBedModal.bed.currentGuestPhone || 'N/A'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#555E74]">Occupied Since:</span>
                        <strong className="text-[#151C27]">{activeBedModal.bed.occupiedSince || 'Active'}</strong>
                      </div>
                    </>
                  )}
                </div>

                {/* Quick Bed Status Toggles */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleToggleMaintenance}
                    className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                      activeBedModal.bed.status === 'MAINTENANCE'
                        ? 'bg-[#198754] text-white border-[#198754]'
                        : 'bg-[#FFF3E0] text-[#E65100] border-[#F57C00]/40 hover:bg-[#FFE0B2]'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{activeBedModal.bed.status === 'MAINTENANCE' ? 'Release Maint.' : 'Mark Maint.'}</span>
                  </button>

                  <button
                    onClick={handleToggleBlocked}
                    className={`py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-colors ${
                      activeBedModal.bed.status === 'BLOCKED'
                        ? 'bg-[#198754] text-white border-[#198754]'
                        : 'bg-[#FFEBEE] text-[#C62828] border-[#D32F2F]/40 hover:bg-[#FFCDD2]'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>{activeBedModal.bed.status === 'BLOCKED' ? 'Unblock Cot' : 'Block Cot'}</span>
                  </button>
                </div>

                <div className="flex gap-2 pt-1">
                  {activeBedModal.bed.status !== 'OCCUPIED' ? (
                    <button
                      onClick={() => setBedModalAction('checkin')}
                      className="flex-1 py-2 bg-[#198754] text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-[#146c43]"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Check-In Guest</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setBedModalAction('checkout')}
                      className="flex-1 py-2 bg-[#D97706] text-white rounded-xl font-bold flex items-center justify-center gap-1 shadow-xs hover:bg-[#b45309]"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>Check-Out Guest</span>
                    </button>
                  )}
                  <button
                    onClick={() => removeBedFromRoom(currentProperty.id, activeBedModal.room.id, activeBedModal.bed.id)}
                    className="p-2 border border-rose-300 text-rose-500 rounded-xl hover:bg-rose-50"
                    title="Remove Bed from Room"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* CHECK-IN TAB */}
            {bedModalAction === 'checkin' && (
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. S. Venkat"
                    value={checkInName}
                    onChange={(e) => setCheckInName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Phone Number (+91) *</label>
                  <input
                    type="text"
                    value={checkInPhone}
                    onChange={(e) => setCheckInPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[#151C27] block mb-1">Check-in Date</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full p-2 rounded-xl border border-[#C2C6D5]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#151C27] block mb-1">Duration (Months)</label>
                    <input
                      type="number"
                      min={1}
                      value={checkInDuration}
                      onChange={(e) => setCheckInDuration(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-[#C2C6D5]"
                    />
                  </div>
                </div>

                <button
                  onClick={handleExecuteCheckIn}
                  className="w-full py-2.5 bg-[#198754] text-white rounded-xl font-bold shadow-md hover:bg-[#146c43]"
                >
                  Confirm & Mark Bed OCCUPIED
                </button>
              </div>
            )}

            {/* CHECK-OUT TAB */}
            {bedModalAction === 'checkout' && (
              <div className="mt-3 space-y-3 text-xs">
                <div className="p-3 bg-[#FEF3C7]/40 border border-[#D97706]/30 rounded-xl">
                  <p className="font-bold text-[#92400E]">Departing Guest:</p>
                  <p className="text-sm font-bold text-[#151C27] mt-0.5">
                    {activeBedModal.bed.currentGuestName || 'Resident'}
                  </p>
                  <p className="text-[10px] text-[#555E74]">
                    Occupied since: {activeBedModal.bed.occupiedSince || 'Earlier this month'}
                  </p>
                </div>

                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Inspection & Settlement Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Room key returned, locker verified, ₹5,000 security deposit refunded via UPI"
                    value={checkOutNotes}
                    onChange={(e) => setCheckOutNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                  />
                </div>

                <button
                  onClick={handleExecuteCheckOut}
                  className="w-full py-2.5 bg-[#D97706] text-white rounded-xl font-bold shadow-md hover:bg-[#b45309]"
                >
                  Complete Check-Out & Free Bed (VACANT)
                </button>
              </div>
            )}

            {/* STATUS CHANGE TAB */}
            {bedModalAction === 'status' && (
              <div className="mt-3 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Bed Status</label>
                  <select
                    value={newStatusSelect}
                    onChange={(e) => setNewStatusSelect(e.target.value as BedStatus)}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5] bg-white font-bold"
                  >
                    <option value="VACANT">VACANT (Available for booking)</option>
                    <option value="BOOKED">BOOKED (Reserved online)</option>
                    <option value="OCCUPIED">OCCUPIED (Resident living)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Under repair / cleaning)</option>
                    <option value="BLOCKED">BLOCKED (Locked by warden)</option>
                  </select>
                </div>

                {activeBedModal.bed.status === 'OCCUPIED' && newStatusSelect === 'VACANT' && (
                  <div className="bg-[#FEF3C7] p-2.5 rounded-xl border border-[#D97706]/40 text-[11px] text-[#92400E]">
                    ⚠️ <strong>Rule:</strong> Active guest exists. Please switch to the "Check-Out" tab for deposit and audit compliance.
                  </div>
                )}

                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Reason for Status Change</label>
                  <input
                    type="text"
                    placeholder="e.g. Split AC geyser repair or painting"
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                  />
                </div>

                <button
                  onClick={handleExecuteStatusChange}
                  className="w-full py-2.5 bg-[#246BCE] text-white rounded-xl font-bold shadow-md hover:bg-[#1B54A6]"
                >
                  Update Bed Status
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: ADD FLOOR MODAL */}
      {showAddFloorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#C2C6D5]/40">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0F3FF]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#246BCE]" />
                <h3 className="text-sm font-bold text-[#151C27]">Add Building Floor</h3>
              </div>
              <button onClick={() => setShowAddFloorModal(false)} className="text-[#555E74] p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFloor} className="space-y-3 mt-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Floor Number *</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    required
                    value={newFloorNumber}
                    onChange={(e) => setNewFloorNumber(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5] focus:border-[#246BCE] focus:outline-none"
                    placeholder="0 = Ground"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#151C27] block mb-1">Building Block</label>
                  <input
                    type="text"
                    value={newBuildingBlock}
                    onChange={(e) => setNewBuildingBlock(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#C2C6D5] focus:border-[#246BCE] focus:outline-none"
                    placeholder="e.g. Block A"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#151C27] block mb-1">Floor Display Name *</label>
                <input
                  type="text"
                  required
                  value={newFloorName}
                  onChange={(e) => setNewFloorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#C2C6D5] focus:border-[#246BCE] focus:outline-none"
                  placeholder="e.g. 1st Floor - Executive Wing"
                />
              </div>

              <div>
                <label className="font-bold text-[#151C27] block mb-1">Floor Description</label>
                <textarea
                  rows={2}
                  value={newFloorDescription}
                  onChange={(e) => setNewFloorDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#C2C6D5] focus:border-[#246BCE] focus:outline-none"
                  placeholder="e.g. Quiet floor with balcony, water cooler and study nook"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#246BCE] text-white rounded-xl font-bold shadow-md hover:bg-[#1B54A6] transition-colors"
                >
                  Create Floor
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFloorModal(false)}
                  className="px-4 py-2.5 border border-[#C2C6D5] rounded-xl text-[#555E74]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: MANAGE FLOORS MODAL */}
      {showManageFloorsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl border border-[#C2C6D5]/40 max-h-[85%] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0F3FF]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#246BCE]" />
                <div>
                  <h3 className="text-sm font-bold text-[#151C27]">Building Floors Directory</h3>
                  <p className="text-[10px] text-[#555E74]">{currentProperty.name}</p>
                </div>
              </div>
              <button onClick={() => setShowManageFloorsModal(false)} className="text-[#555E74] p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 mt-3 text-xs">
              {propertyFloors.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#555E74]">
                  No floors explicitly defined yet.
                </div>
              ) : (
                propertyFloors.map((fl) => {
                  const roomsOnThisFloor = currentProperty.rooms.filter(
                    (r) => r.floor === fl.floorName || r.floorId === fl.id
                  );
                  const bedsOnThisFloor = roomsOnThisFloor.reduce((acc, r) => acc + r.beds.length, 0);

                  return (
                    <div
                      key={fl.id}
                      className="p-3 bg-[#F9F9FF] rounded-xl border border-[#C2C6D5]/40 space-y-1.5"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#151C27]">{fl.floorName}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#EBF3FE] text-[#246BCE] font-bold">
                              Level {fl.floorNumber}
                            </span>
                            {fl.buildingBlock && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 text-[#555E74]">
                                {fl.buildingBlock}
                              </span>
                            )}
                          </div>
                          {fl.description && (
                            <p className="text-[10px] text-[#555E74] mt-0.5">{fl.description}</p>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            const ok = deleteFloor(currentProperty.id, fl.id);
                            if (ok) {
                              if (selectedFloorFilter === fl.floorName) setSelectedFloorFilter('ALL');
                            }
                          }}
                          className="p-1.5 rounded-lg border border-rose-300 text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Delete Floor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex gap-2 text-[10px] text-[#555E74] pt-1 border-t border-[#F0F3FF]">
                        <span>Rooms: <strong className="text-[#151C27]">{roomsOnThisFloor.length}</strong></span>
                        <span>•</span>
                        <span>Total Beds: <strong className="text-[#0052AC]">{bedsOnThisFloor}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setShowManageFloorsModal(false);
                    setShowAddFloorModal(true);
                  }}
                  className="flex-1 py-2.5 bg-[#246BCE] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md hover:bg-[#1B54A6]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Floor</span>
                </button>
                <button
                  onClick={() => setShowManageFloorsModal(false)}
                  className="px-4 py-2.5 border border-[#C2C6D5] rounded-xl text-[#555E74] text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: GOOGLE AUTHENTICATOR 2FA MODAL */}
      {show2faModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#C2C6D5]/40 max-h-[90%] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0F3FF]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#198754]" />
                <div>
                  <h3 className="text-sm font-bold text-[#151C27]">Google Authenticator 2FA</h3>
                  <p className="text-[10px] text-[#555E74]">RFC 6238 TOTP Multi-Factor Protection</p>
                </div>
              </div>
              <button onClick={() => setShow2faModal(false)} className="text-[#555E74] p-1">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <div className="p-2.5 bg-[#F0F3FF] rounded-xl border border-[#246BCE]/20 text-[11px] text-[#0052AC]">
                {isOwnerTotpEnrolled ? (
                  <p className="font-bold flex items-center gap-1.5 text-[#198754]">
                    <CheckCircle className="w-4 h-4 text-[#198754]" />
                    <span>Google Authenticator 2FA is Active and Verified</span>
                  </p>
                ) : (
                  <p>
                    Scan the barcode below with your <strong>Google Authenticator</strong> mobile app or enter the manual key to protect your PG operations ledger.
                  </p>
                )}
              </div>

              {/* Simulated Visual QR Matrix */}
              <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-[#C2C6D5] rounded-2xl">
                <div className="w-36 h-36 bg-[#151C27] rounded-xl p-2.5 flex items-center justify-center shadow-inner relative">
                  <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-white rounded-lg">
                    {Array.from({ length: 36 }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xs ${
                          (idx % 2 === 0 && idx % 3 !== 0) || idx === 0 || idx === 5 || idx === 30 || idx === 35
                            ? 'bg-[#151C27]'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-[#246BCE] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      STAYPASS
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-[#555E74] mt-2 font-mono">
                  otpauth://totp/StayPass:{ownerSession.ownerIdCode}?secret=JBSWY3DPEHPK3PXP
                </span>
              </div>

              {/* Manual Secret Key */}
              <div>
                <label className="text-[10px] font-bold text-[#151C27] block mb-1">
                  Manual Entry Secret Key (Base32)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="JBSWY3DPEHPK3PXP"
                    className="flex-1 p-2 bg-[#F9F9FF] border border-[#C2C6D5] rounded-xl font-mono text-xs font-bold text-[#151C27]"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText('JBSWY3DPEHPK3PXP');
                      setCopiedSecretKey(true);
                      setTimeout(() => setCopiedSecretKey(false), 2000);
                      showToast('Secret key copied to clipboard.');
                    }}
                    className="p-2 bg-[#EBF3FE] text-[#246BCE] rounded-xl border border-[#246BCE]/30 hover:bg-[#D7DFF9]"
                    title="Copy Key"
                  >
                    {copiedSecretKey ? <Check className="w-4 h-4 text-[#198754]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* TOTP 6-Digit Verification Code */}
              <form onSubmit={handleVerifyOwnerTotp} className="space-y-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-[#151C27] block mb-1">
                    Enter 6-Digit Authenticator Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={totpCodeInput}
                    onChange={(e) => setTotpCodeInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-2.5 text-center font-mono text-lg font-bold tracking-widest rounded-xl border border-[#C2C6D5] focus:border-[#246BCE] focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#198754] text-white rounded-xl font-bold shadow-md hover:bg-[#146c43] transition-colors"
                  >
                    {isOwnerTotpEnrolled ? 'Re-Verify Code' : 'Verify & Enable 2FA'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShow2faModal(false)}
                    className="px-4 py-2.5 border border-[#C2C6D5] rounded-xl text-[#555E74]"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
