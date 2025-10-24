import React, { useState, useMemo } from 'react';
import { Plato, TipoPlato } from '../types';
import { XIcon } from './icons';

interface DishPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDish: (dish: Plato) => void;
  dishes: Plato[];
  // Allows filtering by a specific dish type, but also allows 'plato_unico' as an option.
  filterType: TipoPlato; 
  mealType: 'comida' | 'cena';
}

const DishPickerModal: React.FC<DishPickerModalProps> = ({ isOpen, onClose, onSelectDish, dishes, filterType, mealType }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDishes = useMemo(() => {
    return dishes.filter(dish => {
      const isCompatibleMealType = dish.valido_para.includes(mealType);
      
      let isCorrectDishType: boolean;
      if (filterType === 'postre') {
        // Si se reemplaza un postre, solo mostrar otros postres.
        isCorrectDishType = dish.tipo_plato === 'postre';
      } else {
        // Para otros tipos, permitir reemplazo por el mismo tipo o un plato único.
        isCorrectDishType = dish.tipo_plato === filterType || dish.tipo_plato === 'plato_unico';
      }
      
      const matchesSearch = dish.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      return isCompatibleMealType && isCorrectDishType && matchesSearch;
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [dishes, filterType, mealType, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-dark">Seleccionar Plato</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800"><XIcon /></button>
        </div>
        <div className="mb-4 flex-shrink-0">
          <input
            type="text"
            placeholder="Buscar plato por nombre..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div className="overflow-y-auto space-y-3 pr-2 -mr-2">
            {filteredDishes.length > 0 ? (
                filteredDishes.map(dish => (
                    <div 
                        key={dish.id} 
                        onClick={() => onSelectDish(dish)}
                        className="p-3 bg-slate-50 rounded-lg hover:bg-primary-100 border border-slate-200 hover:border-primary-300 cursor-pointer transition-colors"
                    >
                        <h4 className="font-semibold text-slate-800">{dish.nombre}</h4>
                        <div className="text-xs text-slate-600 mt-1 space-x-2">
                            <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full font-medium capitalize">{dish.tipo_plato.replace('_', ' ')}</span>
                            {dish.valido_para.map(v => <span key={v} className="bg-secondary-100 text-secondary-800 px-2 py-0.5 rounded-full font-medium capitalize">{v}</span>)}
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-slate-500 py-10">No se encontraron platos que coincidan con los criterios.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default DishPickerModal;