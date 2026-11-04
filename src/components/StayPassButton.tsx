import React from 'react';
import { Colors } from '../theme';

export type ButtonVariant = 'PRIMARY' | 'SECONDARY' | 'OUTLINED' | 'DANGER' | 'TEXT';

interface StayPassButtonProps {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  isLoading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const StayPassButton: React.FC<StayPassButtonProps> = ({
  label,
  onClick,
  variant = 'PRIMARY',
  disabled = false,
  isLoading = false,
  leadingIcon,
  trailingIcon,
  fullWidth = true,
  className = '',
}) => {
  let styleClasses = '';

  switch (variant) {
    case 'PRIMARY':
      styleClasses = 'bg-[#246BCE] text-[#ECF0FF] hover:bg-[#1B54A6] active:scale-[0.98] shadow-sm';
      break;
    case 'SECONDARY':
      styleClasses = 'bg-[#E7EEFE] text-[#0052AC] hover:bg-[#D7DFF9] active:scale-[0.98]';
      break;
    case 'OUTLINED':
      styleClasses = 'border border-[#C2C6D5] text-[#151C27] bg-white hover:bg-[#F0F3FF] active:scale-[0.98]';
      break;
    case 'DANGER':
      styleClasses = 'bg-[#BA1A1A] text-white hover:bg-[#961414] active:scale-[0.98] shadow-sm';
      break;
    case 'TEXT':
      styleClasses = 'text-[#0052AC] hover:bg-[#E7EEFE]/50 active:scale-[0.98]';
      break;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`min-h-[48px] px-4 py-3 rounded-xl font-semibold text-xs tracking-wide flex items-center justify-center gap-2 transition-all ${
        fullWidth ? 'w-full' : 'w-auto'
      } ${disabled ? 'opacity-50 cursor-not-allowed bg-[#C2C6D5] text-white' : ''} ${styleClasses} ${className}`}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
          <span>{label}</span>
          {trailingIcon && <span className="shrink-0">{trailingIcon}</span>}
        </>
      )}
    </button>
  );
};
