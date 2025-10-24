import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';

interface SaveMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: { name: string, description: string }) => void;
  defaultName: string;
}

const SaveMenuModal: React.FC<SaveMenuModalProps> = ({ isOpen, onClose, onSave, defaultName }) => {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(defaultName);
      setDescription('');
    }
  }, [isOpen, defaultName]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ name, description });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark">Guardar Menú</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800"><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="menuName" className="block text-sm font-medium text-slate-700">Nombre del Menú</label>
            <input 
              type="text" 
              id="menuName"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" 
            />
          </div>
          <div>
            <label htmlFor="menuDescription" className="block text-sm font-medium text-slate-700">Descripción (Opcional)</label>
            <textarea 
              id="menuDescription"
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" 
              placeholder="Ej: Menú bajo en calorías para la segunda semana de Junio"
            />
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-md mr-2 hover:bg-slate-200 font-semibold">Cancelar</button>
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-semibold shadow-sm">Guardar Menú</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveMenuModal;
