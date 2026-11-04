import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, CheckCircle, Smartphone, X } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed or running as standalone, don't show the button
  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#E8F5E9] text-[#198754] text-[11px] font-bold border border-[#198754]/30">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Installed App</span>
      </span>
    );
  }

  const handleAction = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      await install();
    } else {
      // Fallback instruction for browsers where prompt hasn't triggered yet
      alert('To install StayPass: tap your browser menu (⋮ or Share) and select "Install app" or "Add to Home Screen".');
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className={`p-3 bg-gradient-to-r from-[#0052AC] to-[#246BCE] text-white rounded-2xl shadow-sm flex items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-[#93F7BA]" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold">Install StayPass App</h4>
              <p className="text-[10px] text-white/80">Fast native app experience with offline bed pass</p>
            </div>
          </div>
          <button
            onClick={handleAction}
            className="px-3 py-1.5 bg-white text-[#0052AC] rounded-xl text-xs font-bold hover:bg-[#F0F3FF] transition-colors shrink-0 shadow-xs"
          >
            Install
          </button>
        </div>
      ) : variant === 'full' ? (
        <button
          onClick={handleAction}
          className={`w-full py-2.5 px-4 bg-[#0052AC] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-[#1B54A6] transition-colors ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>Install StayPass on Device</span>
        </button>
      ) : (
        <button
          onClick={handleAction}
          className={`flex items-center gap-1 px-2.5 py-1 bg-[#EBF3FE] text-[#246BCE] border border-[#246BCE]/30 rounded-xl text-xs font-bold hover:bg-[#D7DFF9] transition-colors ${className}`}
          title="Install StayPass on Home Screen"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
      )}

      {/* iOS Safari Guided Install Sheet */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-[#C2C6D5]/40 text-[#151C27]">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0F3FF]">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#0052AC]" />
                <h3 className="text-sm font-bold">Install StayPass on iPhone / iPad</h3>
              </div>
              <button onClick={() => setShowIOSModal(false)} className="text-[#555E74] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <p className="text-[#555E74]">
                iOS Safari installs web apps directly from the Safari toolbar without going through the App Store:
              </p>

              <div className="p-3 bg-[#F9F9FF] rounded-xl border border-[#C2C6D5]/30 space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0052AC] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <p>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-[#246BCE]" /> in the Safari bottom bar.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0052AC] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <p>Scroll down and select <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-[#246BCE]" />.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0052AC] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <p>Tap <strong>Add</strong> in the top-right corner to launch StayPass as a standalone full-screen app.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 bg-[#0052AC] text-white font-bold rounded-xl mt-2 hover:bg-[#1B54A6]"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
