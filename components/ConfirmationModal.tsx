import React from 'react';
import { XIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmButtonText?: string;
  confirmButtonColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children,
  confirmButtonText = 'Confirmar',
  confirmButtonColor = 'bg-red-600 hover:bg-red-700'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirmation-modal-title">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 id="confirmation-modal-title" className="text-xl font-bold text-dark">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800" aria-label="Cerrar">
            <XIcon />
          </button>
        </div>
        <div className="text-slate-600 mb-6">
          {children}
        </div>
        <div className="flex justify-end pt-4 border-t border-slate-200 space-x-2">
          <button type="button" onClick={onClose} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-200 font-semibold">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className={`text-white px-4 py-2 rounded-md font-semibold shadow-sm ${confirmButtonColor}`}>
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
