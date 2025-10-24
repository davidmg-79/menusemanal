
import React from 'react';
import { Plato, Dificultad, AllergenName } from '../types';
import { XIcon, ClockIcon, UsersIcon, BookOpenIcon, LinkIcon, EditIcon, TrashIcon, SpeedometerIcon } from './icons';
import { COUNTRY_CODES } from '../constants';
import { AllergenIcon } from './allergenData';

interface DishViewModalProps {
  dish: Plato | null;
  onClose: () => void;
  onEdit: (dish: Plato) => void;
  onDelete: (id: string) => void;
}

const InfoPill: React.FC<{ icon: React.ReactNode, text: string | number, label: string }> = ({ icon, text, label }) => (
    <div className="flex flex-col items-center text-center bg-slate-100 p-3 rounded-lg">
        <div className="text-primary-600">{icon}</div>
        <span className="mt-1 font-bold text-slate-800 text-lg">{text}</span>
        <span className="text-xs text-slate-500">{label}</span>
    </div>
);

const DishViewModal: React.FC<DishViewModalProps> = ({ dish, onClose, onEdit, onDelete }) => {
  if (!dish) return null;

  const countryCode = COUNTRY_CODES[dish.pais];
  
  const getDifficultyColor = (difficulty: Dificultad): string => {
    switch (difficulty) {
        case 'Fácil': return 'text-green-500';
        case 'Media': return 'text-amber-500';
        case 'Difícil': return 'text-red-500';
        default: return 'text-slate-500';
    }
  };
  const difficultyColor = getDifficultyColor(dish.dificultad);


  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-3">
              {countryCode ? (
                  <img 
                      src={`https://flagcdn.com/w40/${countryCode}.png`} 
                      alt={dish.pais} 
                      className="w-10 h-auto rounded-sm shadow-md shrink-0"
                      title={dish.pais}
                  />
              ) : (
                  <div className="w-10 h-7 bg-slate-200 rounded-sm flex items-center justify-center shrink-0">
                      <BookOpenIcon className="w-6 h-6 text-slate-400"/>
                  </div>
              )}
              <h2 className="text-3xl font-bold text-dark">{dish.nombre}</h2>
            </div>
             {dish.pais && (
              <p className="text-slate-500 mt-1 ml-[52px]">Origen: {dish.pais}</p>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800"><XIcon /></button>
        </div>
        
        <div className="overflow-y-auto pr-2 -mr-4 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                {dish.raciones && <InfoPill icon={<UsersIcon className="w-6 h-6"/>} text={dish.raciones} label="Raciones" />}
                {dish.tiempo_preparacion && <InfoPill icon={<ClockIcon className="w-6 h-6"/>} text={`${dish.tiempo_preparacion} min`} label="Tiempo" />}
                {dish.dificultad && <InfoPill icon={<SpeedometerIcon className={`w-6 h-6 ${difficultyColor}`}/>} text={dish.dificultad} label="Dificultad" />}
                {dish.receta_url && (
                    <a href={dish.receta_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center bg-slate-100 p-3 rounded-lg hover:bg-slate-200 transition-colors">
                        <LinkIcon className="w-6 h-6 text-primary-600"/>
                        <span className="mt-1 font-bold text-slate-800 text-lg">Ver Receta</span>
                        <span className="text-xs text-slate-500">Enlace externo</span>
                    </a>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">Ingredientes</h3>
                    <ul className="space-y-2">
                        {dish.ingredientes.map((ing, i) => (
                            <li key={i} className="flex justify-between items-baseline">
                                <span>
                                    {ing.nombre}
                                    {ing.opcional && <span className="text-xs text-slate-500 ml-1">(opcional)</span>}
                                </span>
                                <span className="text-right text-slate-600 font-medium">{ing.cantidad} {ing.unidad}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">Instrucciones</h3>
                    {dish.instrucciones.modo === 'pasos' ? (
                        <ol className="list-decimal list-inside space-y-3 text-slate-700">
                            {Array.isArray(dish.instrucciones.contenido) && dish.instrucciones.contenido.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ol>
                    ) : (
                        <p className="text-slate-700 whitespace-pre-wrap">{dish.instrucciones.contenido}</p>
                    )}
                </div>
            </div>

            {dish.sugerencias && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">Sugerencias</h3>
                    <p className="text-slate-700 italic">"{dish.sugerencias}"</p>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(dish.utensilios && dish.utensilios.length > 0) && (
                  <div>
                      <h3 className="text-lg font-semibold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">Utensilios</h3>
                      <div className="flex flex-wrap gap-2">
                          {dish.utensilios.map((item, i) => <span key={i} className="bg-secondary-100 text-secondary-800 text-sm font-medium px-3 py-1 rounded-full">{item}</span>)}
                      </div>
                  </div>
              )}

              {(dish.alergenos && dish.alergenos.length > 0) && (
                  <div>
                      <h3 className="text-lg font-semibold text-slate-800 border-b-2 border-slate-200 pb-2 mb-3">Alérgenos</h3>
                      <div className="flex flex-wrap gap-2">
                          {dish.alergenos.map((item, i) => (
                            <span key={i} className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
                                <AllergenIcon name={item as AllergenName} className="w-5 h-5"/>
                                {item}
                            </span>
                          ))}
                      </div>
                  </div>
              )}
            </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 mt-auto border-t border-slate-200 flex-shrink-0">
            <button 
                type="button" 
                onClick={() => onDelete(dish.id)} 
                className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 font-semibold flex items-center gap-2 transition-colors"
            >
                <TrashIcon className="w-5 h-5" />
                Eliminar
            </button>
            <div className="flex items-center gap-2">
                <button 
                    type="button" 
                    onClick={() => onEdit(dish)} 
                    className="bg-slate-100 text-slate-800 px-4 py-2 rounded-md hover:bg-slate-200 font-semibold flex items-center gap-2 transition-colors"
                >
                    <EditIcon className="w-5 h-5" />
                    Editar
                </button>
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="bg-primary-600 text-white px-5 py-2.5 rounded-md hover:bg-primary-700 font-semibold shadow-sm"
                >
                    Cerrar
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DishViewModal;
