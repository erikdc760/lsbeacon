
import React from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  type: 'alert' | 'confirm' | 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success': return 'text-green-500 border-green-500/20 bg-green-500/5';
      case 'error': return 'text-red-500 border-red-500/20 bg-red-500/5';
      case 'confirm': return 'text-[#D4AF37] border-[#D4AF37]/20 bg-[#D4AF37]/5';
      default: return 'text-[#D4AF37] border-[#D4AF37]/20 bg-[#D4AF37]/5';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case 'error':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'confirm':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-fadeIn" 
        onClick={type === 'alert' || type === 'success' || type === 'error' ? onClose : undefined}
      />
      <div className={`relative w-full max-w-sm bg-[#09090b] border ${getTypeStyles()} p-8 animate-scaleUp overflow-hidden`}>
        {/* Background Highlight */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <div className={`p-4 rounded-full border border-current/20 bg-current/5`}>
            {getTypeIcon()}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.4em]">{title}</h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex w-full gap-4 pt-4">
            {type === 'confirm' ? (
              <>
                <button 
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={() => {
                    onConfirm?.();
                    onClose();
                  }}
                  className="flex-1 px-6 py-3 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button 
                onClick={onClose}
                className="w-full px-6 py-3 bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
