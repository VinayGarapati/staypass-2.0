import React, { useState } from 'react';
import { useStayPassStore } from '../../store/useStayPassStore';
import { Property, Room, Bed, BookingRequest, StayDuration } from '../../models/types';
import { StayPassBadge } from '../../components/StayPassBadge';
import { StayPassButton } from '../../components/StayPassButton';
import { BedItem } from '../../components/BedItem';
import { PropertyLocationMapCard } from '../../components/PropertyLocationMapCard';
import { OptimizedImage } from '../../components/OptimizedImage';
import {
  ShieldCheck,
  Bed as BedIcon,
  MapPin,
  Search,
  SlidersHorizontal,
  Bookmark,
  Bell,
  User,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  X,
  Phone,
  Calendar,
  Star,
  Share2,
  Copy,
  Clock,
  Coffee,
  Wifi,
  Wind,
  Check,
  Navigation,
  QrCode,
  CalendarPlus,
  Ban,
  MessageSquare,
  Lock,
  ExternalLink,
  HelpCircle,
  Eye
} from 'lucide-react';

interface CustomerPortalProps {
  currentTab: 'home' | 'search' | 'bookings' | 'saved' | 'profile';
  onNavigateTab: (tab: 'home' | 'search' | 'bookings' | 'saved' | 'profile') => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ currentTab, onNavigateTab }) => {
  const {
    properties,
    bookings,
    customerSession,
    savedPropertyIds,
    toggleSavedProperty,
    createCustomerBooking,
    cancelCustomerBooking,
    syncWithGoogleCalendar,
    submitComplaintTicket,
    updateCustomerProfile,
    showToast,
  } = useStayPassStore();

  // Internal Customer navigation stack for the home tab
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [selectedCity, setSelectedCity] = useState<'All' | 'Hyderabad' | 'Rajahmundry'>('All');
  const [genderFilter, setGenderFilter] = useState<'BOYS' | 'GIRLS'>('BOYS');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Property, Room & Bed Draft
  const [selectedProperty, setSelectedProperty] = useState<Property>(properties[0]);
  const [selectedRoom, setSelectedRoom] = useState<Room>(properties[0].rooms[0]);
  const [selectedBedIds, setSelectedBedIds] = useState<string[]>([properties[0].rooms[0].beds[0].id]);
  const [stayDurationType, setStayDurationType] = useState<StayDuration>('MONTHLY');
  const [durationCount, setDurationCount] = useState<number>(1);
  const [checkInDate, setCheckInDate] = useState<string>('2026-11-10');

  // Modals & Sub-views
  const [showDirectionsModal, setShowDirectionsModal] = useState<boolean>(false);
  const [directionsTransit, setDirectionsTransit] = useState<'walk' | 'bike' | 'auto'>('walk');
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showDigitalPassModal, setShowDigitalPassModal] = useState<BookingRequest | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<BookingRequest | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Plans changed / Found another accommodation');
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);

  // Edit Profile Form
  const [editName, setEditName] = useState(customerSession.name);
  const [editPhone, setEditPhone] = useState(customerSession.phone);
  const [editEmergency, setEditEmergency] = useState(customerSession.emergencyContact);

  // Complaints
  const [complaintCategory, setComplaintCategory] = useState<'FOOD_QUALITY' | 'MAINTENANCE_AC' | 'WARDEN_BEHAVIOR' | 'CLEANLINESS' | 'SECURITY'>('MAINTENANCE_AC');
  const [complaintText, setComplaintText] = useState('');

  // Search Filters
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(12000);
  const [acOnlyFilter, setAcOnlyFilter] = useState<boolean>(false);

  const handleGenderTabClick = (target: 'BOYS' | 'GIRLS') => {
    if (target === 'GIRLS') {
      showToast('Your KYC profile gender is Male. Girls-only stays require verified Female profile for security.');
    } else {
      setGenderFilter('BOYS');
    }
  };

  const toggleBedSelection = (bed: Bed) => {
    if (bed.status === 'OCCUPIED' || bed.status === 'MAINTENANCE' || bed.status === 'BLOCKED') {
      showToast(`This bed is currently ${bed.status}. Please choose a vacant cot.`);
      return;
    }
    if (selectedBedIds.includes(bed.id)) {
      setSelectedBedIds(selectedBedIds.filter((id) => id !== bed.id));
    } else {
      setSelectedBedIds([...selectedBedIds, bed.id]);
    }
  };

  // Pricing calculations
  const selectedBedsCount = selectedBedIds.length;
  const baseRatePerBed =
    selectedRoom.beds.find((b) => selectedBedIds.includes(b.id))?.monthlyPrice || selectedProperty.pricePerMonth;
  const rentAmount =
    stayDurationType === 'MONTHLY'
      ? baseRatePerBed * Math.max(1, selectedBedsCount) * durationCount
      : selectedProperty.pricePerDay * Math.max(1, selectedBedsCount) * durationCount;
  const securityDeposit = stayDurationType === 'MONTHLY' ? 5000 * Math.max(1, selectedBedsCount) : 0;
  const maintenanceFee = 500;
  const totalEstimatedAmount = rentAmount + securityDeposit + maintenanceFee;

  const handleCreateBooking = () => {
    const selectedBed = selectedRoom.beds.find((b) => selectedBedIds.includes(b.id)) || selectedRoom.beds[0];
    createCustomerBooking({
      customerId: customerSession.id,
      customerName: customerSession.name,
      customerPhone: customerSession.phone,
      customerGender: customerSession.gender,
      propertyId: selectedProperty.id,
      propertyName: selectedProperty.name,
      roomId: selectedRoom.id,
      roomNumber: selectedRoom.roomNumber,
      bedId: selectedBed.id,
      bedCode: `${selectedBedIds.length} Bed(s) Selected (${selectedBed.code})`,
      city: `${selectedProperty.city}, ${selectedProperty.locality.split('(')[0]}`,
      checkInDate,
      durationMonths: durationCount,
      stayType: stayDurationType,
      rentAmount,
      securityDeposit,
      maintenanceFee,
      totalEstimatedAmount,
    });
    setActiveScreen('booking_status');
  };

  const filteredProperties = properties.filter((prop) => {
    if (selectedCity !== 'All' && prop.city !== selectedCity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = prop.name.toLowerCase().includes(q);
      const matchLoc = prop.locality.toLowerCase().includes(q);
      const matchCity = prop.city.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchCity) return false;
    }
    if (acOnlyFilter && !prop.rooms.some((r) => r.hasAC)) return false;
    if (prop.pricePerMonth > maxPriceFilter) return false;
    return true;
  });

  const customerBookingsList = bookings.filter((b) => b.customerId === customerSession.id);

  // ROUTE 1: SEARCH / EXPLORE TAB
  if (currentTab === 'search') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#F9F9FF] overflow-y-auto">
        <div className="bg-white p-4 border-b border-[#C2C6D5]/30 sticky top-0 z-10 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#F0F3FF] rounded-xl px-3 py-2 text-xs border border-[#C2C6D5]/40">
              <Search className="w-4 h-4 text-[#246BCE] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Gachibowli, Madhapur, Danavaipeta..."
                className="w-full bg-transparent border-none focus:outline-none text-xs text-[#151C27]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#555E74]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className="p-2 rounded-xl border border-[#C2C6D5]/60 bg-[#F0F3FF] text-[#246BCE] hover:bg-[#EBF3FE]"
              title="Search Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* City Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            {(['All', 'Hyderabad', 'Rajahmundry'] as const).map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCity === city
                    ? 'bg-[#0052AC] text-white shadow-xs'
                    : 'bg-[#E7EEFE] text-[#0052AC] hover:bg-[#D7DFF9]'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center text-xs text-[#555E74]">
            <span>{filteredProperties.length} verified PGs available</span>
            <span>Max ₹{maxPriceFilter.toLocaleString('en-IN')}/mo</span>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#555E74] space-y-2">
              <p>No verified properties found matching your filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('All');
                  setMaxPriceFilter(15000);
                  setAcOnlyFilter(false);
                }}
                className="text-[#246BCE] font-bold"
              >
                Reset search filters
              </button>
            </div>
          ) : (
            filteredProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedProperty(prop);
                  setSelectedRoom(prop.rooms[0]);
                  setSelectedBedIds([prop.rooms[0].beds[0]?.id || '']);
                  setActiveScreen('property_details');
                  onNavigateTab('home');
                }}
                className="bg-white rounded-2xl border border-[#C2C6D5]/40 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="h-36 relative">
                  <OptimizedImage
                    src={prop.coverImage || prop.images[0]}
                    alt={prop.name}
                    className="w-full h-full object-cover"
                    fallbackText={prop.name}
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#93F7BA]" />
                    <span>Single-Gender Boys</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSavedProperty(prop.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        savedPropertyIds.includes(prop.id)
                          ? 'text-[#246BCE] fill-[#246BCE]'
                          : 'text-[#555E74]'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-3.5 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-[#151C27]">{prop.name}</h4>
                      <p className="text-[10px] text-[#555E74] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#246BCE]" />
                        <span>{prop.locality}, {prop.city}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#FEF3C7] px-1.5 py-0.5 rounded text-[11px] font-bold text-[#D97706]">
                      <Star className="w-3 h-3 fill-[#D97706]" />
                      <span>{prop.rating}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#F0F3FF] text-xs">
                    <div>
                      <span className="text-base font-bold text-[#0052AC]">
                        ₹{prop.pricePerMonth.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#555E74]">/month</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#198754] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                      {prop.availableBeds} beds vacant
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ROUTE 2: BOOKINGS TAB
  if (currentTab === 'bookings') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#F9F9FF] overflow-y-auto">
        <div className="bg-white p-4 border-b border-[#C2C6D5]/30 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-[#151C27]">My StayPass Bookings</h2>
            <p className="text-[10px] text-[#555E74]">Manage active bed requests and check-in passes</p>
          </div>
          <span className="text-xs font-bold bg-[#EBF3FE] text-[#246BCE] px-2.5 py-1 rounded-full">
            {customerBookingsList.length} Active
          </span>
        </div>

        <div className="p-4 space-y-3">
          {customerBookingsList.length === 0 ? (
            <div className="text-center py-16 text-xs text-[#555E74] space-y-3">
              <BedIcon className="w-8 h-8 text-[#246BCE] mx-auto opacity-40" />
              <p>You have no active bed bookings yet.</p>
              <button
                onClick={() => onNavigateTab('home')}
                className="px-4 py-2 bg-[#246BCE] text-white rounded-xl font-bold"
              >
                Browse Verified Hostels
              </button>
            </div>
          ) : (
            customerBookingsList.map((b) => (
              <div
                key={b.id}
                className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 shadow-xs text-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-[#0052AC] font-mono">{b.id}</span>
                    <h3 className="font-bold text-sm text-[#151C27] mt-0.5">{b.propertyName}</h3>
                    <p className="text-[10px] text-[#555E74] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#246BCE]" />
                      <span>{b.city}</span>
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
                    <span className="text-[#555E74]">Selected Bed: </span>
                    <strong className="text-[#151C27]">{b.roomNumber} ({b.bedCode})</strong>
                  </div>
                  <div>
                    <span className="text-[#555E74]">Check-In: </span>
                    <strong className="text-[#151C27]">{b.checkInDate}</strong>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-[#555E74]">
                  <span>Total Estimated: <strong className="text-[#151C27]">₹{b.totalEstimatedAmount.toLocaleString('en-IN')}</strong></span>
                  <span>Duration: <strong>{b.durationMonths} Month(s)</strong></span>
                </div>

                {/* Booking Actions */}
                <div className="pt-2 border-t border-[#F0F3FF] flex flex-wrap gap-2">
                  {(b.status === 'CONFIRMED' || b.status === 'CHECKED_IN') && (
                    <button
                      onClick={() => setShowDigitalPassModal(b)}
                      className="flex-1 py-2 bg-[#246BCE] text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#1B54A6]"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Digital Pass</span>
                    </button>
                  )}

                  <button
                    onClick={() => syncWithGoogleCalendar(b)}
                    className="flex-1 py-2 bg-[#EBF3FE] text-[#0052AC] rounded-xl font-bold flex items-center justify-center gap-1.5 border border-[#246BCE]/20 hover:bg-[#D7DFF9]"
                    title="Add check-in reminder to Google Calendar"
                  >
                    <CalendarPlus className="w-3.5 h-3.5 text-[#246BCE]" />
                    <span>Add to Calendar</span>
                  </button>

                  {b.status !== 'CANCELLED' && (
                    <button
                      onClick={() => setShowCancelModal(b)}
                      className="px-3 py-2 border border-rose-300 text-rose-500 rounded-xl font-bold hover:bg-rose-50"
                      title="Cancel Booking Request"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ROUTE 3: SAVED PROPERTIES TAB
  if (currentTab === 'saved') {
    const savedList = properties.filter((p) => savedPropertyIds.includes(p.id));

    return (
      <div className="flex-1 flex flex-col h-full bg-[#F9F9FF] overflow-y-auto">
        <div className="bg-white p-4 border-b border-[#C2C6D5]/30 sticky top-0 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-[#151C27]">Saved PGs & Hostels</h2>
            <p className="text-[10px] text-[#555E74]">Quick access to bookmarked properties</p>
          </div>
          <span className="text-xs font-bold bg-[#EBF3FE] text-[#246BCE] px-2.5 py-1 rounded-full">
            {savedList.length} Saved
          </span>
        </div>

        <div className="p-4 space-y-3">
          {savedList.length === 0 ? (
            <div className="text-center py-16 text-xs text-[#555E74] space-y-2">
              <Bookmark className="w-8 h-8 text-[#555E74] mx-auto opacity-30" />
              <p>You have not bookmarked any PGs yet.</p>
              <button
                onClick={() => onNavigateTab('home')}
                className="text-[#246BCE] font-bold"
              >
                Explore verified PGs
              </button>
            </div>
          ) : (
            savedList.map((prop) => (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedProperty(prop);
                  setSelectedRoom(prop.rooms[0]);
                  setSelectedBedIds([prop.rooms[0].beds[0]?.id || '']);
                  setActiveScreen('property_details');
                  onNavigateTab('home');
                }}
                className="bg-white p-3.5 rounded-2xl border border-[#C2C6D5]/40 shadow-xs flex items-center justify-between cursor-pointer hover:border-[#246BCE]/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <OptimizedImage
                      src={prop.coverImage || prop.images[0]}
                      alt={prop.name}
                      className="w-full h-full object-cover"
                      fallbackText={prop.name}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#151C27] line-clamp-1">{prop.name}</h4>
                    <p className="text-[10px] text-[#555E74]">{prop.locality}, {prop.city}</p>
                    <p className="text-xs font-bold text-[#0052AC] mt-1">
                      ₹{prop.pricePerMonth.toLocaleString('en-IN')}/mo
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSavedProperty(prop.id);
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    title="Remove from saved"
                  >
                    <Bookmark className="w-4 h-4 fill-rose-500" />
                  </button>
                  <span className="text-[9px] font-bold text-[#198754] bg-[#E8F5E9] px-2 py-0.5 rounded-full">
                    {prop.availableBeds} Vacant
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ROUTE 4: PROFILE TAB
  if (currentTab === 'profile') {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#F9F9FF] overflow-y-auto">
        <div className="bg-[#0052AC] text-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white text-[#0052AC] font-extrabold text-lg flex items-center justify-center shadow-md">
                RS
              </div>
              <div>
                <h2 className="text-base font-bold">{customerSession.name}</h2>
                <p className="text-xs text-white/80">{customerSession.phone}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditName(customerSession.name);
                setEditPhone(customerSession.phone);
                setEditEmergency(customerSession.emergencyContact);
                setShowEditProfileModal(true);
              }}
              className="text-[11px] font-bold bg-white/20 px-3 py-1.5 rounded-xl hover:bg-white/30 transition-colors"
            >
              Edit Profile
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl text-xs">
            <ShieldCheck className="w-4 h-4 text-[#93F7BA]" />
            <span>Single-Gender KYC Profile: <strong>Verified Male</strong></span>
          </div>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Identity & Safety Card */}
          <div className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 shadow-xs space-y-2.5">
            <h3 className="font-bold text-[#151C27]">Verified Identity & Compliance</h3>
            <div className="flex justify-between py-1 border-b border-[#F0F3FF]">
              <span className="text-[#555E74]">Aadhaar Number (Masked):</span>
              <strong className="font-mono text-[#151C27]">{customerSession.aadhaarNumberMasked}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0F3FF]">
              <span className="text-[#555E74]">Primary City:</span>
              <strong className="text-[#151C27]">{customerSession.cityPreference}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F0F3FF]">
              <span className="text-[#555E74]">Emergency Contact:</span>
              <strong className="text-[#151C27]">{customerSession.emergencyContact}</strong>
            </div>
          </div>

          {/* Quick Support & Grievances */}
          <div className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 shadow-xs space-y-2.5">
            <h3 className="font-bold text-[#151C27]">Resident Support & Help</h3>
            <button
              onClick={() => {
                setActiveScreen('rate_complaints');
                onNavigateTab('home');
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#F0F3FF] text-[#0052AC] font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#246BCE]" />
                <span>File Warden Complaint Ticket</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast('Connecting to 24/7 StayPass Resident Hotline: 1800-425-STAY')}
              className="w-full py-2.5 px-3 rounded-xl bg-[#F0F3FF] text-[#0052AC] font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#246BCE]" />
                <span>Emergency Warden Hotline</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditProfileModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#C2C6D5]/40 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#F0F3FF]">
                <h3 className="font-bold text-sm text-[#151C27]">Edit Customer Profile</h3>
                <button onClick={() => setShowEditProfileModal(false)} className="text-[#555E74]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="font-bold text-[#151C27] block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#151C27] block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#151C27] block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={editEmergency}
                  onChange={(e) => setEditEmergency(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#C2C6D5]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    updateCustomerProfile({
                      name: editName,
                      phone: editPhone,
                      emergencyContact: editEmergency,
                    });
                    setShowEditProfileModal(false);
                  }}
                  className="flex-1 py-2.5 bg-[#246BCE] text-white rounded-xl font-bold"
                >
                  Save Profile
                </button>
                <button
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2.5 border border-[#C2C6D5] rounded-xl text-[#555E74]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // DEFAULT: HOME TAB WITH NESTED DETAIL SCREENS
  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9F9FF] overflow-y-auto">
      {/* SCREEN 1: SPLASH */}
      {activeScreen === 'splash' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#0052AC] text-white">
          <div className="w-20 h-20 rounded-2xl bg-white text-[#0052AC] flex items-center justify-center font-extrabold text-4xl shadow-xl mb-4">
            SP
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">StayPass</h1>
          <p className="text-sm text-[#ECF0FF] max-w-xs mb-8">
            Verified PG & Hostel Bed Request Platform for Hyderabad & Rajahmundry
          </p>
          <div className="flex items-center gap-2 text-xs bg-white/10 px-4 py-2 rounded-full mb-10">
            <ShieldCheck className="w-4 h-4 text-[#93F7BA]" />
            <span>Single-Gender • Verified PGs Only</span>
          </div>
          <button
            onClick={() => setActiveScreen('home')}
            className="w-full py-3.5 bg-white text-[#0052AC] font-bold rounded-xl shadow-lg hover:bg-[#F0F3FF]"
          >
            Explore Verified PGs
          </button>
        </div>
      )}

      {/* SCREEN 3: HOME DISCOVER */}
      {activeScreen === 'home' && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white p-4 border-b border-[#C2C6D5]/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] text-[#555E74] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#246BCE]" />
                  <span>Verified Hubs</span>
                </p>
                <p className="text-sm font-bold text-[#151C27]">Hyderabad & Rajahmundry</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotificationsModal(true)}
                  className="p-2 rounded-full hover:bg-[#F0F3FF] text-[#555E74] relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="w-2 h-2 rounded-full bg-[#BA1A1A] absolute top-2 right-2" />
                </button>
                <button
                  onClick={() => onNavigateTab('profile')}
                  className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#246BCE] flex items-center justify-center font-bold text-xs border border-[#246BCE]/30"
                >
                  RS
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div
              onClick={() => onNavigateTab('search')}
              className="flex items-center gap-2 bg-[#F0F3FF] rounded-xl px-3 py-2.5 text-xs text-[#555E74] cursor-pointer border border-[#C2C6D5]/40"
            >
              <Search className="w-4 h-4 text-[#246BCE]" />
              <span>Search Gachibowli, Madhapur, Danavaipeta...</span>
            </div>

            {/* Single-Gender Locked Toggle */}
            <div className="mt-3 flex rounded-xl bg-[#F0F3FF] p-1 border border-[#C2C6D5]/40">
              <button
                onClick={() => handleGenderTabClick('BOYS')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  genderFilter === 'BOYS' ? 'bg-white text-[#246BCE] shadow-sm' : 'text-[#555E74]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Boys PGs & Hostels</span>
              </button>
              <button
                onClick={() => handleGenderTabClick('GIRLS')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  genderFilter === 'GIRLS' ? 'bg-white text-[#BE185D] shadow-sm' : 'text-[#555E74]'
                }`}
              >
                <span>Girls PGs</span>
                <span className="text-[9px] bg-[#FEF3C7] text-[#D97706] px-1 rounded">Locked</span>
              </button>
            </div>

            {/* City Chips */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 text-xs scrollbar-none">
              {(['All', 'Hyderabad', 'Rajahmundry'] as const).map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
                    selectedCity === city
                      ? 'bg-[#0052AC] text-white'
                      : 'bg-[#E7EEFE] text-[#0052AC] hover:bg-[#D7DFF9]'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Properties List */}
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center text-xs text-[#555E74]">
              <span>Featured Verified Stays</span>
              <span>{filteredProperties.length} available</span>
            </div>

            {filteredProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => {
                  setSelectedProperty(prop);
                  setSelectedRoom(prop.rooms[0]);
                  setSelectedBedIds([prop.rooms[0].beds[0]?.id || '']);
                  setActiveScreen('property_details');
                }}
                className="bg-white rounded-2xl border border-[#C2C6D5]/40 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="h-44 relative">
                  <OptimizedImage
                    src={prop.coverImage || prop.images[0]}
                    alt={prop.name}
                    className="w-full h-full object-cover"
                    fallbackText={prop.name}
                  />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#93F7BA]" />
                    <span>Single-Gender Verified</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSavedProperty(prop.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs"
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        savedPropertyIds.includes(prop.id)
                          ? 'text-[#246BCE] fill-[#246BCE]'
                          : 'text-[#555E74]'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-[#151C27]">{prop.name}</h3>
                      <p className="text-[11px] text-[#555E74] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#246BCE]" />
                        <span>{prop.locality}, {prop.city}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#FEF3C7] px-2 py-0.5 rounded text-xs font-bold text-[#D97706]">
                      <Star className="w-3.5 h-3.5 fill-[#D97706]" />
                      <span>{prop.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prop.amenities.slice(0, 3).map((amenity) => (
                      <span key={amenity} className="text-[10px] bg-[#F0F3FF] text-[#555E74] px-2 py-0.5 rounded-md">
                        • {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-[#F0F3FF]">
                    <div>
                      <span className="text-base font-bold text-[#0052AC]">
                        ₹{prop.pricePerMonth.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#555E74]">/month</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#198754] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                      {prop.availableBeds} beds vacant
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 6: PROPERTY DETAILS */}
      {activeScreen === 'property_details' && (
        <div className="flex-1 flex flex-col bg-[#F9F9FF]">
          {/* Top Bar */}
          <div className="h-12 px-4 bg-white border-b border-[#C2C6D5]/30 flex items-center justify-between sticky top-0 z-20">
            <button onClick={() => setActiveScreen('home')} className="p-1 -ml-1 text-[#555E74]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-[#151C27] truncate max-w-[200px]">
              {selectedProperty.name}
            </span>
            <button onClick={() => toggleSavedProperty(selectedProperty.id)} className="p-1 text-[#555E74]">
              <Bookmark
                className={`w-5 h-5 ${
                  savedPropertyIds.includes(selectedProperty.id)
                    ? 'text-[#246BCE] fill-[#246BCE]'
                    : 'text-[#555E74]'
                }`}
              />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Image Gallery */}
            <div className="h-48 rounded-2xl overflow-hidden shadow-xs relative">
              <OptimizedImage
                src={selectedProperty.coverImage || selectedProperty.images[0]}
                alt={selectedProperty.name}
                className="w-full h-full object-cover"
                fallbackText={selectedProperty.name}
              />
              <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs">
                {selectedProperty.images.length} Photos
              </div>
            </div>

            {/* Property Headline */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold text-[#151C27]">{selectedProperty.name}</h2>
                  <p className="text-xs text-[#555E74] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#246BCE]" />
                    <span>{selectedProperty.locality}, {selectedProperty.city}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#FEF3C7] px-2 py-1 rounded-lg text-xs font-bold text-[#D97706]">
                  <Star className="w-3.5 h-3.5 fill-[#D97706]" />
                  <span>{selectedProperty.rating}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F0F3FF] flex justify-between items-center text-xs">
                <div>
                  <span className="text-lg font-bold text-[#0052AC]">
                    ₹{selectedProperty.pricePerMonth.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[#555E74]">/month</span>
                </div>
                <span className="text-xs font-bold text-[#198754] bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                  {selectedProperty.availableBeds} beds vacant
                </span>
              </div>
            </div>

            {/* Google Maps Card */}
            <PropertyLocationMapCard
              property={selectedProperty}
              onOpenDirections={() => setShowDirectionsModal(true)}
              onCopyAddress={() => {
                navigator.clipboard?.writeText(selectedProperty.fullAddress);
                showToast('Full address copied to clipboard');
              }}
            />

            {/* Amenities Grid */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 shadow-xs space-y-2">
              <h3 className="text-xs font-bold text-[#151C27]">Included Amenities</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedProperty.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-1.5 text-[#555E74] bg-[#F9F9FF] p-2 rounded-xl">
                    <Check className="w-3.5 h-3.5 text-[#198754] shrink-0" />
                    <span className="truncate">{a}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white p-4 rounded-2xl border border-[#C2C6D5]/40 shadow-xs space-y-2 text-xs">
              <h3 className="text-xs font-bold text-[#151C27]">Warden Guidelines & Curfew</h3>
              <div className="space-y-1.5 text-[#555E74]">
                <p>• <strong>Gate Closing Time:</strong> {selectedProperty.gateClosingTime}</p>
                {selectedProperty.rules.map((r) => (
                  <p key={r}>• {r}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Booking Bar */}
          <div className="p-3 bg-white border-t border-[#C2C6D5]/40 shrink-0">
            <StayPassButton
              label={`Select Room & Choose Bed (${selectedProperty.availableBeds} Vacant)`}
              onClick={() => setActiveScreen('bed_matrix')}
            />
          </div>
        </div>
      )}

      {/* SCREEN 7: BED SELECTION MATRIX */}
      {activeScreen === 'bed_matrix' && (
        <div className="flex-1 flex flex-col bg-[#F9F9FF]">
          <div className="h-12 px-4 bg-white border-b border-[#C2C6D5]/30 flex items-center justify-between sticky top-0 z-20">
            <button onClick={() => setActiveScreen('property_details')} className="p-1 -ml-1 text-[#555E74]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-[#151C27]">Choose Your Bed Cot</span>
            <div className="w-5" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Room Tabs */}
            <div>
              <label className="text-xs font-bold text-[#151C27] block mb-2">Select Room Configuration</label>
              <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
                {selectedProperty.rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room);
                      const firstVacant = room.beds.find((b) => b.status === 'VACANT');
                      if (firstVacant) setSelectedBedIds([firstVacant.id]);
                    }}
                    className={`px-3 py-2 rounded-xl font-bold border transition-colors whitespace-nowrap ${
                      selectedRoom.id === room.id
                        ? 'bg-[#246BCE] text-white border-[#246BCE] shadow-xs'
                        : 'bg-white text-[#555E74] border-[#C2C6D5]/60 hover:bg-[#F0F3FF]'
                    }`}
                  >
                    {room.roomNumber} ({room.sharingType})
                  </button>
                ))}
              </div>
            </div>

            {/* Room Overview Card */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#C2C6D5]/40 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#151C27]">{selectedRoom.roomNumber}</span>
                <span className="text-[#0052AC] font-bold">₹{selectedRoom.monthlyPrice.toLocaleString('en-IN')}/mo</span>
              </div>
              <p className="text-[11px] text-[#555E74]">{selectedRoom.description}</p>
            </div>

            {/* Interactive Bed Cot Grid */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#151C27]">Select Cot(s)</label>
                <span className="text-[10px] text-[#555E74]">Tap bed to reserve</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedRoom.beds.map((bed) => (
                  <BedItem
                    key={bed.id}
                    bed={bed}
                    isSelected={selectedBedIds.includes(bed.id)}
                    onSelect={() => toggleBedSelection(bed)}
                  />
                ))}
              </div>
            </div>

            {/* Check-In Date Selector */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#C2C6D5]/40 text-xs space-y-2">
              <label className="font-bold text-[#151C27] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#246BCE]" />
                <span>Preferred Move-In / Check-In Date</span>
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#C2C6D5] text-xs font-bold text-[#151C27]"
              />
            </div>
          </div>

          <div className="p-3 bg-white border-t border-[#C2C6D5]/40 shrink-0">
            <StayPassButton
              label={`Proceed to Request (${selectedBedIds.length} Selected)`}
              disabled={selectedBedIds.length === 0}
              onClick={() => setActiveScreen('booking_review')}
            />
          </div>
        </div>
      )}

      {/* SCREEN 8: BOOKING REVIEW */}
      {activeScreen === 'booking_review' && (
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setActiveScreen('bed_matrix')} className="p-1 text-[#555E74]">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-[#151C27]">Booking Request Review</h2>
            </div>

            {/* Summary */}
            <div className="bg-white p-3.5 rounded-xl border border-[#C2C6D5]/40 text-xs">
              <p className="font-bold text-[#151C27]">{selectedProperty.name}</p>
              <p className="text-[#555E74] text-[11px]">
                {selectedRoom.roomNumber} • {selectedBedIds.length} Bed(s) Selected
              </p>
              <div className="mt-2 pt-2 border-t border-[#F0F3FF] flex justify-between text-[11px]">
                <span>Check-in Date:</span>
                <strong className="text-[#151C27]">{checkInDate}</strong>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="bg-white p-3.5 rounded-xl border border-[#C2C6D5]/40 text-xs">
              <label className="font-bold text-[#151C27] block mb-2">Billing Duration</label>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <button
                  onClick={() => setStayDurationType('MONTHLY')}
                  className={`py-2 rounded-lg font-bold border ${
                    stayDurationType === 'MONTHLY'
                      ? 'bg-[#EBF3FE] text-[#246BCE] border-[#246BCE]'
                      : 'text-[#555E74] border-[#C2C6D5]'
                  }`}
                >
                  Monthly Stay
                </button>
                <button
                  onClick={() => setStayDurationType('DAILY')}
                  className={`py-2 rounded-lg font-bold border ${
                    stayDurationType === 'DAILY'
                      ? 'bg-[#EBF3FE] text-[#246BCE] border-[#246BCE]'
                      : 'text-[#555E74] border-[#C2C6D5]'
                  }`}
                >
                  Daily Stay
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#555E74]">
                <span>Duration Units:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDurationCount(Math.max(1, durationCount - 1))}
                    className="w-7 h-7 rounded bg-[#F0F3FF] font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="font-bold text-[#151C27]">
                    {durationCount} {stayDurationType === 'MONTHLY' ? 'Month(s)' : 'Day(s)'}
                  </span>
                  <button
                    onClick={() => setDurationCount(durationCount + 1)}
                    className="w-7 h-7 rounded bg-[#F0F3FF] font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white p-3.5 rounded-xl border border-[#C2C6D5]/40 text-xs space-y-1.5">
              <p className="font-bold text-[#151C27] mb-2">Estimated Cost Summary</p>
              <div className="flex justify-between text-[#555E74]">
                <span>Bed Rent:</span>
                <span className="tabular-nums">₹{rentAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#555E74]">
                <span>Refundable Deposit:</span>
                <span className="tabular-nums">₹{securityDeposit.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-[#555E74]">
                <span>One-time Maintenance Fee:</span>
                <span className="tabular-nums">₹{maintenanceFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-[#F0F3FF] flex justify-between font-bold text-sm text-[#0052AC]">
                <span>Total Estimated:</span>
                <span className="tabular-nums">₹{totalEstimatedAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <StayPassButton
              label="Submit Bed Request to Warden"
              onClick={handleCreateBooking}
            />
          </div>
        </div>
      )}

      {/* SCREEN 9: BOOKING CONFIRMATION STATUS */}
      {activeScreen === 'booking_status' && (
        <div className="flex-1 p-5 flex flex-col justify-between items-center text-center">
          <div className="w-full flex flex-col items-center mt-4">
            <div className="w-16 h-16 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-3">
              <Clock className="w-8 h-8" />
            </div>
            <StayPassBadge text="Pending Warden Confirmation" type="PENDING" />
            <h2 className="text-lg font-bold text-[#151C27] mt-2">Request Sent to Warden</h2>
            <p className="text-xs text-[#555E74] max-w-xs mt-1">
              Warden usually confirms within 2 hours. Your bed cot is temporarily reserved.
            </p>

            {/* Timeline */}
            <div className="w-full bg-white p-4 rounded-xl border border-[#C2C6D5]/40 mt-5 text-left text-xs space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-[#198754]" />
                <div>
                  <p className="font-bold text-[#151C27]">Bed Request Submitted</p>
                  <p className="text-[10px] text-[#555E74]">Today</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#D97706]" />
                <div>
                  <p className="font-bold text-[#D97706]">Warden Verification in Progress</p>
                  <p className="text-[10px] text-[#555E74]">Reviewing Aadhaar KYC & Rules</p>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-40">
                <div className="w-4 h-4 rounded-full border-2 border-[#555E74]" />
                <div>
                  <p className="font-bold text-[#555E74]">Digital Check-in Pass</p>
                  <p className="text-[10px] text-[#555E74]">Biometric code issued upon approval</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-2">
            <StayPassButton
              label="View in My Bookings"
              onClick={() => onNavigateTab('bookings')}
            />
            <button
              onClick={() => setActiveScreen('home')}
              className="w-full py-2.5 text-[#555E74] text-xs font-semibold"
            >
              Back to Discover
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 14: RATE STAY & COMPLAINTS */}
      {activeScreen === 'rate_complaints' && (
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => onNavigateTab('profile')} className="p-1 text-[#555E74]">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-base font-bold text-[#151C27]">Rate & Warden Complaints</h2>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#C2C6D5]/40 text-xs mb-3">
              <p className="font-bold text-[#151C27]">{selectedProperty.name}</p>
              <div className="flex gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-[#D97706] fill-[#D97706] cursor-pointer" />
                ))}
              </div>
              <p className="text-[11px] text-[#555E74]">Rate cleanliness, food taste, Wi-Fi speed & warden responsiveness</p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#C2C6D5]/40 text-xs">
              <label className="font-bold text-[#151C27] block mb-2">File Official Complaint Ticket</label>
              <select
                value={complaintCategory}
                onChange={(e: any) => setComplaintCategory(e.target.value)}
                className="w-full p-2 border border-[#C2C6D5] rounded-lg text-xs mb-2 bg-white"
              >
                <option value="MAINTENANCE_AC">Air Conditioner / Geyser Fault</option>
                <option value="FOOD_QUALITY">Food Hygiene / Timings</option>
                <option value="WARDEN_BEHAVIOR">Warden Grievance / Deposit Delay</option>
                <option value="CLEANLINESS">Room / Washroom Cleanliness</option>
                <option value="SECURITY">Gate Biometrics / CCTV Concern</option>
              </select>

              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Describe your issue with exact room details..."
                className="w-full h-20 p-2 border border-[#C2C6D5] rounded-lg text-xs"
              />
            </div>
          </div>

          <StayPassButton
            label="Submit Complaint to StayPass Admin"
            onClick={() => {
              if (complaintText.length < 5) {
                showToast('Please provide details for the complaint ticket');
                return;
              }
              submitComplaintTicket({
                propertyId: selectedProperty.id,
                propertyName: selectedProperty.name,
                customerId: customerSession.id,
                customerName: customerSession.name,
                category: complaintCategory,
                description: complaintText,
              });
              setComplaintText('');
              onNavigateTab('profile');
            }}
          />
        </div>
      )}

      {/* MODAL: GOOGLE MAPS DIRECTIONS */}
      {showDirectionsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-[#C2C6D5]/40 max-h-[85%] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F3FF]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#246BCE] flex items-center justify-center font-bold">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#151C27]">Google Maps Directions</h3>
                  <p className="text-[10px] text-[#555E74]">{selectedProperty.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDirectionsModal(false)}
                className="p-1 rounded-full text-[#555E74] hover:bg-[#F0F3FF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
              <button
                onClick={() => setDirectionsTransit('walk')}
                className={`py-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  directionsTransit === 'walk'
                    ? 'border-[#246BCE] bg-[#EBF3FE] text-[#246BCE] font-bold'
                    : 'border-[#C2C6D5]/60 text-[#555E74]'
                }`}
              >
                <span className="text-sm">🚶</span>
                <span className="text-[10px] font-bold mt-0.5">8 min</span>
                <span className="text-[9px] opacity-75">0.6 km</span>
              </button>
              <button
                onClick={() => setDirectionsTransit('bike')}
                className={`py-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  directionsTransit === 'bike'
                    ? 'border-[#246BCE] bg-[#EBF3FE] text-[#246BCE] font-bold'
                    : 'border-[#C2C6D5]/60 text-[#555E74]'
                }`}
              >
                <span className="text-sm">🛵</span>
                <span className="text-[10px] font-bold mt-0.5">3 min</span>
                <span className="text-[9px] opacity-75">0.8 km</span>
              </button>
              <button
                onClick={() => setDirectionsTransit('auto')}
                className={`py-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  directionsTransit === 'auto'
                    ? 'border-[#246BCE] bg-[#EBF3FE] text-[#246BCE] font-bold'
                    : 'border-[#C2C6D5]/60 text-[#555E74]'
                }`}
              >
                <span className="text-sm">🛺</span>
                <span className="text-[10px] font-bold mt-0.5">5 min</span>
                <span className="text-[9px] opacity-75">~₹35</span>
              </button>
            </div>

            <div className="mt-4 bg-[#F9F9FF] p-3 rounded-xl border border-[#C2C6D5]/40 text-xs space-y-2">
              <p className="font-bold text-[#151C27]">
                Destination: {selectedProperty.fullAddress}
              </p>
              <p className="text-[11px] text-[#555E74]">
                Coordinates: {selectedProperty.latitude?.toFixed(4)}, {selectedProperty.longitude?.toFixed(4)}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  showToast('Navigation started in Google Maps mode');
                  setShowDirectionsModal(false);
                }}
                className="flex-1 py-2.5 bg-[#246BCE] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#1B54A6]"
              >
                Start Navigation
              </button>
              <button
                onClick={() => setShowDirectionsModal(false)}
                className="px-4 py-2.5 border border-[#C2C6D5] text-[#555E74] rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIGITAL CHECK-IN PASS */}
      {showDigitalPassModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#C2C6D5]/40 text-xs space-y-3 text-center">
            <div className="flex justify-between items-center pb-2 border-b border-[#F0F3FF]">
              <span className="font-bold text-[#0052AC]">StayPass Digital Check-in Pass</span>
              <button onClick={() => setShowDigitalPassModal(null)} className="text-[#555E74]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#0052AC] to-[#246BCE] text-white p-4 rounded-2xl space-y-2">
              <div className="w-24 h-24 bg-white p-2 rounded-xl mx-auto flex items-center justify-center text-black">
                <QrCode className="w-20 h-20 text-[#151C27]" />
              </div>
              <p className="font-mono text-sm tracking-widest font-bold">
                {showDigitalPassModal.id}-PASS
              </p>
              <p className="text-[10px] text-white/80">Scan at PG Warden Office or Biometric Gate</p>
            </div>

            <div className="p-3 bg-[#F9F9FF] rounded-xl border border-[#C2C6D5]/40 text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#555E74]">Property:</span>
                <strong className="text-[#151C27]">{showDigitalPassModal.propertyName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555E74]">Guest:</span>
                <strong className="text-[#151C27]">{showDigitalPassModal.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555E74]">Room & Bed:</span>
                <strong className="text-[#151C27]">{showDigitalPassModal.roomNumber} ({showDigitalPassModal.bedCode})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#555E74]">Move-In Date:</span>
                <strong className="text-[#151C27]">{showDigitalPassModal.checkInDate}</strong>
              </div>
            </div>

            <button
              onClick={() => {
                showToast('Pass image saved to device storage');
                setShowDigitalPassModal(null);
              }}
              className="w-full py-2.5 bg-[#246BCE] text-white rounded-xl font-bold shadow-md hover:bg-[#1B54A6]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CANCEL BOOKING */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#C2C6D5]/40 text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#F0F3FF]">
              <h3 className="font-bold text-sm text-[#151C27]">Cancel Bed Booking</h3>
              <button onClick={() => setShowCancelModal(null)} className="text-[#555E74]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[#555E74]">
              Are you sure you want to cancel request <strong>{showCancelModal.id}</strong> for{' '}
              <strong>{showCancelModal.propertyName}</strong>? The reserved cot will be returned to vacant inventory.
            </p>

            <div>
              <label className="font-bold text-[#151C27] block mb-1">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#C2C6D5] bg-white text-xs"
              >
                <option value="Plans changed / Found another accommodation">Plans changed / Found another accommodation</option>
                <option value="Office / College location shifted">Office / College location shifted</option>
                <option value="Budget constraints">Budget constraints</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  cancelCustomerBooking(showCancelModal.id, cancelReason);
                  setShowCancelModal(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700"
              >
                Confirm Cancellation
              </button>
              <button
                onClick={() => setShowCancelModal(null)}
                className="px-4 py-2.5 border border-[#C2C6D5] rounded-xl text-[#555E74]"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOTIFICATIONS */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#C2C6D5]/40 text-xs space-y-3 max-h-[80%] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#F0F3FF]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#246BCE]" />
                <h3 className="font-bold text-sm text-[#151C27]">Notifications</h3>
              </div>
              <button onClick={() => setShowNotificationsModal(false)} className="text-[#555E74]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-[#EBF3FE] rounded-xl border border-[#246BCE]/20 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-[#0052AC]">Warden Verified Cot</strong>
                  <span className="text-[10px] text-[#555E74]">10m ago</span>
                </div>
                <p className="text-[11px] text-[#151C27]">
                  Your request for Sri Sai Luxury Men's PG (Bed 101-A) is being processed by warden Venkata Rao.
                </p>
              </div>

              <div className="p-3 bg-[#F9F9FF] rounded-xl border border-[#C2C6D5]/30 space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-[#151C27]">Safety Audit Notice</strong>
                  <span className="text-[10px] text-[#555E74]">2h ago</span>
                </div>
                <p className="text-[11px] text-[#555E74]">
                  All listed PGs in Gachibowli have renewed fire NOC and 24/7 CCTV biometrics compliance.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNotificationsModal(false)}
              className="w-full py-2 bg-[#246BCE] text-white rounded-xl font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL: SEARCH FILTERS */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#C2C6D5]/40 text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#F0F3FF]">
              <h3 className="font-bold text-sm text-[#151C27]">Search Filters</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-[#555E74]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="font-bold text-[#151C27]">Max Monthly Budget</label>
                <span className="font-bold text-[#0052AC]">₹{maxPriceFilter.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={4000}
                max={15000}
                step={500}
                value={maxPriceFilter}
                onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={acOnlyFilter}
                onChange={(e) => setAcOnlyFilter(e.target.checked)}
                className="rounded text-[#246BCE]"
              />
              <span className="font-bold text-[#151C27]">AC Rooms Only</span>
            </label>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-2.5 bg-[#246BCE] text-white rounded-xl font-bold"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setMaxPriceFilter(12000);
                  setAcOnlyFilter(false);
                  setShowFilterModal(false);
                }}
                className="px-4 py-2.5 border border-[#C2C6D5] rounded-xl text-[#555E74]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
