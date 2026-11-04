import React from 'react';
import { Bed, BedState, BedTier } from '../models/types';
import { Bed as BedIcon, Check, User, AlertCircle } from 'lucide-react';
import { Colors } from '../theme';

interface BedItemProps {
  bed: Bed;
  isSelected: boolean;
  onSelect: (bed: Bed) => void;
  isOwnerMode?: boolean;
  onToggleOccupancyByOwner?: (bed: Bed) => void;
}

export const BedItem: React.FC<BedItemProps> = ({
  bed,
  isSelected,
  onSelect,
  isOwnerMode = false,
  onToggleOccupancyByOwner,
}) => {
  const isOccupied = bed.state === 'OCCUPIED';
  const isUnavailable = bed.state === 'UNAVAILABLE';
  const isAvailable = bed.state === 'AVAILABLE';

  const isClickable = isOwnerMode || isAvailable || isSelected;

  const handleClick = () => {
    if (isOwnerMode && onToggleOccupancyByOwner) {
      onToggleOccupancyByOwner(bed);
      return;
    }
    if (isAvailable || isSelected) {
      onSelect(bed);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative p-3.5 rounded-xl border-2 transition-all flex flex-col items-center text-center select-none ${
        isClickable ? 'cursor-pointer active:scale-[0.98]' : 'cursor-not-allowed opacity-70'
      } ${
        isSelected
          ? 'bg-[#246BCE] text-white border-[#246BCE] shadow-md'
          : isOccupied
          ? 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]'
          : isUnavailable
          ? 'bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]'
          : 'bg-white text-[#151C27] border-[#246BCE]/40 hover:border-[#246BCE] shadow-xs'
      }`}
    >
      {/* Cot Headboard Rail */}
      <div
        className={`w-9 h-1 rounded-full mb-1.5 ${
          isSelected ? 'bg-white/80' : isOccupied ? 'bg-[#D1D5DB]' : 'bg-[#246BCE]/50'
        }`}
      />

      {/* Main Cot Icon with Circle Housing */}
      <div
        className={`w-11 h-11 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
          isSelected
            ? 'bg-white/20 text-white'
            : isOccupied
            ? 'bg-[#E5E7EB] text-[#6B7280]'
            : isUnavailable
            ? 'bg-[#FFE4E6] text-[#BE123C]'
            : 'bg-[#EBF3FE] text-[#246BCE]'
        }`}
      >
        {isSelected ? (
          <Check className="w-5 h-5 stroke-[2.5]" />
        ) : isOccupied ? (
          <User className="w-5 h-5" />
        ) : (
          <BedIcon className="w-5 h-5" />
        )}
      </div>

      {/* Cot Identification Code & Tier */}
      <span className="font-bold text-xs tracking-tight">{bed.code}</span>
      <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#555E74]'}`}>
        {bed.tier}
      </span>

      {/* Occupancy Status / Price Badge */}
      <div className="mt-2 text-[10px] font-bold">
        {isSelected ? (
          <span className="bg-white/25 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <Check className="w-3 h-3" /> Selected
          </span>
        ) : isOccupied ? (
          <div className="flex flex-col items-center">
            <span className="text-[#6B7280]">Occupied</span>
            {bed.currentGuestName && (
              <span className="text-[9px] text-[#4B5563] font-normal truncate max-w-[85px]">
                {bed.currentGuestName}
              </span>
            )}
          </div>
        ) : isUnavailable ? (
          <span className="text-[#BE123C]">Maintenance</span>
        ) : (
          <span className="text-[#198754]">₹{bed.monthlyPrice.toLocaleString('en-IN')}/mo</span>
        )}
      </div>

      {isOwnerMode && (
        <span className="mt-1 text-[9px] text-[#0052AC] font-semibold underline">
          {isOccupied ? 'Mark Vacant' : 'Mark Occupied'}
        </span>
      )}
    </div>
  );
};
