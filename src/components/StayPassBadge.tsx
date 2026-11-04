import React from 'react';
import { Colors, Typography } from '../theme';
import { ShieldCheck, User, AlertCircle, Check } from 'lucide-react';

export type BadgeType = 'VERIFIED' | 'PENDING' | 'BOYS_ONLY' | 'GIRLS_ONLY' | 'ADMIN' | 'NEUTRAL';

interface StayPassBadgeProps {
  text: string;
  type?: BadgeType;
  customTextColor?: string;
  customBgColor?: string;
  icon?: React.ReactNode;
}

export const StayPassBadge: React.FC<StayPassBadgeProps> = ({
  text,
  type = 'NEUTRAL',
  customTextColor,
  customBgColor,
  icon,
}) => {
  let textColor = customTextColor || Colors.neutralGrey;
  let bgColor = customBgColor || '#F3F4F6';
  let defaultIcon: React.ReactNode = null;

  switch (type) {
    case 'VERIFIED':
      textColor = Colors.verifiedText;
      bgColor = Colors.verifiedBg;
      defaultIcon = <ShieldCheck className="w-3.5 h-3.5 text-[#198754]" />;
      break;
    case 'PENDING':
      textColor = Colors.pendingText;
      bgColor = Colors.pendingBg;
      defaultIcon = <AlertCircle className="w-3.5 h-3.5 text-[#D97706]" />;
      break;
    case 'BOYS_ONLY':
      textColor = Colors.boysText;
      bgColor = Colors.boysBg;
      defaultIcon = <User className="w-3.5 h-3.5 text-[#246BCE]" />;
      break;
    case 'GIRLS_ONLY':
      textColor = Colors.girlsText;
      bgColor = Colors.girlsBg;
      defaultIcon = <User className="w-3.5 h-3.5 text-[#BE185D]" />;
      break;
    case 'ADMIN':
      textColor = Colors.adminBadgeText;
      bgColor = Colors.adminBadgeBg;
      defaultIcon = <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />;
      break;
    case 'NEUTRAL':
    default:
      textColor = Colors.neutralGrey;
      bgColor = '#F3F4F6';
      break;
  }

  const finalIcon = icon !== undefined ? icon : defaultIcon;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight transition-all"
      style={{ color: textColor, backgroundColor: bgColor }}
    >
      {finalIcon}
      <span>{text}</span>
    </span>
  );
};
