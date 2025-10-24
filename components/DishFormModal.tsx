import React, { useState, useEffect } from 'react';
import { Plato, Ingrediente, TipoPlato, ValidoPara, TIPOS_PLATO, VALIDO_PARA_OPTIONS, DIFICULTAD_OPTIONS, InstructionMode, AllergenName } from '../types';
import { PAISES, INGREDIENT_CATEGORIES_LIST, UNIDADES_INGREDIENTES } from '../constants';
import { PlusIcon, TrashIcon, XIcon, DragHandleIcon, ExternalLinkIcon } from './icons';
import { ALLERGENS_LIST, AllergenIcon } from './allergenData';


interface DishFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dish: Plato) => void;
  dishToEdit: Plato | null;
  utensilsList: string[];
  addUtensilToList: (utensil: string) => void;
}

const DishFormModal: React.FC<DishFormModalProps> = ({ isOpen, onClose, onSave, dishToEdit, utensilsList, addUtensilToList }) => {
  const getInitialDishState = (): Omit<Plato, 'id'> => ({
    nombre: '',
    tipo_plato: 'plato_principal',
    valido_para: ['comida'],
    ingredientes: [{ nombre: '', cantidad: 0, unidad: 'gr', categoria_ingrediente: '', opcional: false }],
    receta_url: '',
    pais: '',
    raciones: 4,
    tiempo_preparacion: 30,
    dificultad: 'Fácil',
    alergenos: [],
    utensilios: [],
    sugerencias: '',
    instrucciones: { modo: 'texto', contenido: '' }
  });
  
  const [dish, setDish] = useState<Omit<Plato, 'id'>>(getInitialDishState());
  const [draggedIngredient, setDraggedIngredient] = useState<number | null>(null);
  const [draggedStep, setDraggedStep] = useState<number | null>(null);
  const [urlError, setUrlError] = useState<string>('');
  const [newUtensil, setNewUtensil] = useState('');


  useEffect(() => {
    if (isOpen) {
        if (dishToEdit) {
            setDish({
                ...getInitialDishState(),
                ...dishToEdit,
                instrucciones: dishToEdit.instrucciones || { modo: 'texto', contenido: '' },
                alergenos: dishToEdit.alergenos || [],
                utensilios: dishToEdit.utensilios || [],
            });
        } else {
            setDish(getInitialDishState());
        }
        setUrlError('');
    }
  }, [dishToEdit, isOpen]);

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setUrlError('');
      return true;
    }
    try {
      new URL(url);
      setUrlError('');
      return true;
    } catch (_) {
      setUrlError('Por favor, introduce una URL válida (ej: https://ejemplo.com)');
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'receta_url') {
        setUrlError('');
    }
    setDish(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const currentValidoPara = dish.valido_para as ValidoPara[];
    if (checked) {
      setDish(prev => ({ ...prev, valido_para: [...currentValidoPara, value as ValidoPara] }));
    } else {
      setDish(prev => ({ ...prev, valido_para: currentValidoPara.filter(item => item !== value) }));
    }
  };

  const handleIngredientChange = (index: number, field: keyof Ingrediente, value: string | number | boolean) => {
    const newIngredients = [...dish.ingredientes];
    const ingredient = { ...newIngredients[index] };
    (ingredient[field] as string | number | boolean) = value;
    newIngredients[index] = ingredient;
    setDish(prev => ({ ...prev, ingredientes: newIngredients }));
  };
  
  const addIngredient = () => {
    setDish(prev => ({ ...prev, ingredientes: [...prev.ingredientes, { nombre: '', cantidad: 0, unidad: 'gr', categoria_ingrediente: '', opcional: false }] }));
  };

  const removeIngredient = (index: number) => {
    setDish(prev => ({ ...prev, ingredientes: prev.ingredientes.filter((_, i) => i !== index) }));
  };

  const handleIngredientDrop = (targetIndex: number) => {
    if (draggedIngredient === null) return;
    const newIngredients = [...dish.ingredientes];
    const [removed] = newIngredients.splice(draggedIngredient, 1);
    newIngredients.splice(targetIndex, 0, removed);
    setDish(prev => ({ ...prev, ingredientes: newIngredients }));
    setDraggedIngredient(null);
  };

  const handleInstructionTypeChange = (newType: InstructionMode) => {
    setDish(prev => {
        const currentInstructions = prev.instrucciones;
        let newContent: string | string[] = '';

        if (newType === 'texto' && Array.isArray(currentInstructions.contenido)) {
            newContent = currentInstructions.contenido.join('\n');
        } else if (newType === 'pasos' && typeof currentInstructions.contenido === 'string') {
            newContent = currentInstructions.contenido.split('\n').filter(line => line.trim() !== '');
            if(newContent.length === 0) newContent = [''];
        } else {
            newContent = newType === 'texto' ? '' : [''];
        }

        return {
            ...prev,
            instrucciones: { modo: newType, contenido: newContent }
        };
    });
  };
  
  const handleInstructionContentChange = (content: string | string[]) => {
      setDish(prev => ({
          ...prev,
          instrucciones: { ...prev.instrucciones, contenido: content }
      }));
  };

  const addStep = () => {
    if (Array.isArray(dish.instrucciones.contenido)) {
        handleInstructionContentChange([...dish.instrucciones.contenido, '']);
    }
  };

  const removeStep = (index: number) => {
      if (Array.isArray(dish.instrucciones.contenido)) {
        handleInstructionContentChange(dish.instrucciones.contenido.filter((_, i) => i !== index));
      }
  };

  const handleStepChange = (index: number, value: string) => {
      if(Array.isArray(dish.instrucciones.contenido)) {
          const newSteps = [...dish.instrucciones.contenido];
          newSteps[index] = value;
          handleInstructionContentChange(newSteps);
      }
  };

  const handleStepDrop = (targetIndex: number) => {
    if (draggedStep === null || !Array.isArray(dish.instrucciones.contenido)) return;
    const newSteps = [...dish.instrucciones.contenido];
    const [removed] = newSteps.splice(draggedStep, 1);
    newSteps.splice(targetIndex, 0, removed);
    handleInstructionContentChange(newSteps);
    setDraggedStep(null);
  };
  
  const handleAllergenToggle = (allergenName: AllergenName) => {
    setDish(prev => {
        const currentAllergens = prev.alergenos || [];
        const isSelected = currentAllergens.includes(allergenName);
        if (isSelected) {
            return { ...prev, alergenos: currentAllergens.filter(name => name !== allergenName) };
        } else {
            return { ...prev, alergenos: [...currentAllergens, allergenName] };
        }
    });
  };

  const handleClearAllergens = () => {
    setDish(prev => ({ ...prev, alergenos: [] }));
  };

  const handleAddUtensil = (utensilToAdd: string) => {
    const trimmedUtensil = utensilToAdd.trim();
    if (!trimmedUtensil || (dish.utensilios || []).includes(trimmedUtensil)) {
      setNewUtensil('');
      return;
    }

    if (!utensilsList.find(u => u.toLowerCase() === trimmedUtensil.toLowerCase())) {
      if (window.confirm(`"${trimmedUtensil}" es un utensilio nuevo. ¿Quieres guardarlo para futuras recetas?`)) {
        addUtensilToList(trimmedUtensil);
      }
    }
    setDish(d => ({...d, utensilios: [...(d.utensilios || []), trimmedUtensil]}));
    setNewUtensil('');
  };

  const handleRemoveUtensil = (utensilToRemove: string) => {
    setDish(d => ({ ...d, utensilios: (d.utensilios || []).filter(u => u !== utensilToRemove)}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(dish.receta_url)) {
        return;
    }
    if (dish.valido_para.length === 0) {
      alert('Debes seleccionar al menos una opción para "Válido para".');
      return;
    }
    const finalDish: Plato = {
        ...dish,
        id: dishToEdit?.id || `${dish.nombre.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`
    };
    onSave(finalDish);
    onClose();
  };

  if (!isOpen) return null;

  const availableUtensils = utensilsList.filter(u => !(dish.utensilios || []).includes(u));

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark">{dishToEdit ? 'Editar Plato' : 'Añadir Plato'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800"><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <details open className="space-y-4 bg-slate-50 p-4 rounded-lg">
            <summary className="font-bold text-lg text-slate-800 cursor-pointer">Información General</summary>
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">Nombre del Plato</label>
              <input type="text" name="nombre" value={dish.nombre} onChange={handleChange} required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="pais" className="block text-sm font-medium text-slate-700">País de Origen</label>
                    <select name="pais" value={dish.pais} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white">
                        <option value="">Selecciona un país</option>
                        {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                 </div>
                 <div>
                    <label htmlFor="receta_url" className="block text-sm font-medium text-slate-700">URL de la Receta</label>
                    <div className="relative mt-1">
                        <input 
                            type="url" 
                            name="receta_url" 
                            value={dish.receta_url} 
                            onChange={handleChange} 
                            onBlur={(e) => validateUrl(e.target.value)}
                            className={`block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 ${dishToEdit && dish.receta_url ? 'pr-16' : ''} ${urlError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-primary-500'}`} 
                        />
                        {dishToEdit && dish.receta_url && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                                <a 
                                    href={dish.receta_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-slate-400 hover:text-primary-600"
                                    title="Abrir enlace en nueva pestaña"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLinkIcon className="h-5 w-5" />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setDish(prev => ({ ...prev, receta_url: '' }))}
                                    className="text-slate-400 hover:text-red-600"
                                    title="Borrar URL"
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                    </div>
                    {urlError && <p className="mt-1 text-sm text-red-600">{urlError}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="raciones" className="block text-sm font-medium text-slate-700">Raciones</label>
                <input type="number" name="raciones" value={dish.raciones} onChange={handleChange} min="1" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label htmlFor="tiempo_preparacion" className="block text-sm font-medium text-slate-700">Tiempo (min)</label>
                <input type="number" name="tiempo_preparacion" value={dish.tiempo_preparacion} onChange={handleChange} min="1" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label htmlFor="dificultad" className="block text-sm font-medium text-slate-700">Dificultad</label>
                <select name="dificultad" value={dish.dificultad} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 capitalize">
                    {DIFICULTAD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="tipo_plato" className="block text-sm font-medium text-slate-700">Tipo de Plato</label>
                  <select name="tipo_plato" value={dish.tipo_plato} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 capitalize">
                    {TIPOS_PLATO.map(tipo => <option key={tipo} value={tipo}>{tipo.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Válido para</label>
                  <div className="mt-2 flex space-x-4">
                    {VALIDO_PARA_OPTIONS.map(opt => (
                      <label key={opt} className="inline-flex items-center">
                        <input type="checkbox" value={opt} checked={dish.valido_para.includes(opt)} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-slate-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-offset-0 focus:ring-primary-200 focus:ring-opacity-50" />
                        <span className="ml-2 capitalize text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
            </div>
          </details>
          
          <details className="space-y-4 bg-slate-50 p-4 rounded-lg">
            <summary className="font-bold text-lg text-slate-800 cursor-pointer">Ingredientes</summary>
            <div className="space-y-3">
              {dish.ingredientes.map((ing, index) => (
                <div 
                  key={index}
                  draggable
                  onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDraggedIngredient(index); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleIngredientDrop(index)}
                  onDragEnd={() => setDraggedIngredient(null)}
                  className={`p-3 rounded-md transition-all ${draggedIngredient === index ? 'opacity-50 bg-slate-200' : 'bg-white border'}`}
                >
                    <div className="grid grid-cols-12 gap-x-3 gap-y-2 items-center">
                        <div className="col-span-1 flex justify-center items-center cursor-move text-slate-400"> <DragHandleIcon /> </div>
                        <div className="col-span-11 md:col-span-5">
                            <label className="text-xs font-medium text-slate-600">Nombre</label>
                            <input type="text" value={ing.nombre} onChange={e => handleIngredientChange(index, 'nombre', e.target.value)} required className="w-full border border-slate-300 rounded-md shadow-sm py-1 px-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                             <label className="text-xs font-medium text-slate-600">Cant.</label>
                            <input type="number" step="0.1" value={ing.cantidad} onChange={e => handleIngredientChange(index, 'cantidad', parseFloat(e.target.value) || 0)} required className="w-full border border-slate-300 rounded-md shadow-sm py-1 px-2 focus:ring-primary-500 focus:border-primary-500" />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                            <label className="text-xs font-medium text-slate-600">Unidad</label>
                            <select value={ing.unidad} onChange={e => handleIngredientChange(index, 'unidad', e.target.value)} className="w-full border border-slate-300 rounded-md shadow-sm py-1 px-2 focus:ring-primary-500 focus:border-primary-500 bg-white capitalize">
                                {UNIDADES_INGREDIENTES.map(unidad => <option key={unidad} value={unidad}>{unidad}</option>)}
                            </select>
                        </div>
                        <div className="col-span-4 md:col-span-2 flex items-end">
                            <button type="button" onClick={() => removeIngredient(index)} className="text-slate-400 hover:text-red-500 p-2"><TrashIcon className="w-5 h-5"/></button>
                        </div>

                         <div className="col-span-12 md:col-span-7 md:col-start-2">
                             <label className="text-xs font-medium text-slate-600">Categoría</label>
                            <select value={ing.categoria_ingrediente} onChange={e => handleIngredientChange(index, 'categoria_ingrediente', e.target.value)} className="w-full border border-slate-300 rounded-md shadow-sm py-1 px-2 focus:ring-primary-500 focus:border-primary-500 bg-white">
                                <option value="">Selecciona una categoría</option>
                                {INGREDIENT_CATEGORIES_LIST.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="col-span-12 md:col-span-4 flex items-center pt-4">
                            <input type="checkbox" id={`opcional-${index}`} checked={ing.opcional} onChange={e => handleIngredientChange(index, 'opcional', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600 shadow-sm focus:ring-primary-500" />
                            <label htmlFor={`opcional-${index}`} className="ml-2 text-sm text-slate-700">Opcional</label>
                        </div>
                    </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addIngredient} className="mt-4 flex items-center text-sm text-primary-600 font-medium hover:text-primary-800">
              <PlusIcon className="w-4 h-4 mr-1"/> Añadir Ingrediente
            </button>
          </details>
          
          <details className="space-y-4 bg-slate-50 p-4 rounded-lg">
            <summary className="font-bold text-lg text-slate-800 cursor-pointer">Instrucciones</summary>
            <div className="flex items-center space-x-4 mb-4">
                {(['texto', 'pasos'] as InstructionMode[]).map(type => (
                    <label key={type} className="inline-flex items-center">
                        <input type="radio" name="instructionType" value={type} checked={dish.instrucciones.modo === type} onChange={() => handleInstructionTypeChange(type)} className="h-4 w-4 text-primary-600 border-slate-300 focus:ring-primary-500"/>
                        <span className="ml-2 capitalize text-slate-700">{type.replace('_', ' ')}</span>
                    </label>
                ))}
            </div>
            {dish.instrucciones.modo === 'texto' ? (
                <textarea value={dish.instrucciones.contenido as string} onChange={e => handleInstructionContentChange(e.target.value)} rows={8} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" placeholder="Escribe la receta completa aquí..."/>
            ) : (
                <div className="space-y-2">
                    {Array.isArray(dish.instrucciones.contenido) && dish.instrucciones.contenido.map((step, index) => (
                         <div key={index} draggable onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; setDraggedStep(index); }} onDragOver={(e) => e.preventDefault()} onDrop={() => handleStepDrop(index)} onDragEnd={() => setDraggedStep(null)} className={`flex items-start gap-2 p-1 rounded-md transition-all ${draggedStep === index ? 'opacity-50 bg-slate-200' : 'bg-transparent'}`}>
                            <div className="cursor-move text-slate-400 pt-2"><DragHandleIcon /></div>
                            <span className="font-semibold text-slate-600 pt-2">{index + 1}.</span>
                            <textarea value={step} onChange={e => handleStepChange(index, e.target.value)} placeholder={`Describe el paso ${index + 1}`} rows={2} className="flex-grow border border-slate-300 rounded-md shadow-sm py-1.5 px-2 focus:ring-primary-500 focus:border-primary-500" />
                            <button type="button" onClick={() => removeStep(index)} className="text-slate-400 hover:text-red-500 pt-1"><TrashIcon className="w-5 h-5"/></button>
                         </div>
                    ))}
                    <button type="button" onClick={addStep} className="mt-2 flex items-center text-sm text-primary-600 font-medium hover:text-primary-800"> <PlusIcon className="w-4 h-4 mr-1"/> Añadir Paso </button>
                </div>
            )}
            <div>
              <label htmlFor="sugerencias" className="block text-sm font-medium text-slate-700">Sugerencias / Notas</label>
              <textarea name="sugerencias" value={dish.sugerencias} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
            </div>
          </details>

          <details className="space-y-4 bg-slate-50 p-4 rounded-lg">
            <summary className="font-bold text-lg text-slate-800 cursor-pointer">Detalles Adicionales</summary>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h3 className="text-md font-medium text-slate-700 mb-2">Utensilios</h3>
                    
                    {(dish.utensilios && dish.utensilios.length > 0) && (
                        <div className="mb-3 p-2 border rounded-md bg-white flex flex-wrap gap-2">
                            {dish.utensilios.map(u => (
                                <span key={u} className="bg-primary-100 text-primary-800 text-sm font-medium px-2 py-1 rounded-full flex items-center gap-1.5">
                                    {u}
                                    <button type="button" onClick={() => handleRemoveUtensil(u)} className="text-primary-500 hover:text-primary-800">
                                        <XIcon className="w-3 h-3"/>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                        <input
                            type="text"
                            value={newUtensil}
                            onChange={e => setNewUtensil(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddUtensil(newUtensil))}
                            placeholder="Añadir nuevo utensilio"
                            className="flex-grow border border-slate-300 rounded-md shadow-sm py-1.5 px-2 focus:ring-primary-500 focus:border-primary-500"
                            list="utensils-datalist"
                        />
                        <button type="button" onClick={() => handleAddUtensil(newUtensil)} className="bg-primary-100 text-primary-800 px-3 py-1.5 rounded-md hover:bg-primary-200 font-semibold">Añadir</button>
                        <datalist id="utensils-datalist">
                            {utensilsList.map(u => <option key={u} value={u} />)}
                        </datalist>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-slate-600 self-center mr-2">Sugerencias:</span>
                        {availableUtensils.map(u => (
                             <button type="button" key={u} onClick={() => handleAddUtensil(u)} className="text-sm bg-slate-200 text-slate-700 px-2 py-1 rounded-md hover:bg-slate-300 hover:text-slate-900">
                                {u}
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="text-md font-medium text-slate-700 mb-2">Alérgenos</h3>
                    <div className="grid grid-cols-5 gap-3">
                        {ALLERGENS_LIST.map(allergen => {
                            const isSelected = dish.alergenos?.includes(allergen.name);
                            return (
                                <button
                                    type="button"
                                    key={allergen.name}
                                    onClick={() => handleAllergenToggle(allergen.name)}
                                    className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                        isSelected ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' : 'border-slate-200 bg-white hover:border-primary-300'
                                    }`}
                                    title={allergen.name}
                                >
                                    <AllergenIcon name={allergen.name} className="w-7 h-7" />
                                    <span className={`text-xs mt-1.5 text-center ${isSelected ? 'font-semibold text-primary-800' : 'text-slate-600'}`}>{allergen.name}</span>
                                </button>
                            )
                        })}
                        <button
                            type="button"
                            onClick={handleClearAllergens}
                            className="flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 border-slate-300 bg-slate-50 hover:border-red-400 hover:bg-red-50"
                            title="Limpiar selección"
                        >
                            <XIcon className="w-7 h-7 text-red-500" />
                            <span className="text-xs mt-1.5 text-center font-semibold text-red-700">Limpiar</span>
                        </button>
                    </div>
                </div>
            </div>
          </details>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="bg-slate-100 text-slate-800 px-4 py-2 rounded-md mr-2 hover:bg-slate-200 font-semibold">Cancelar</button>
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-semibold shadow-sm">Guardar Plato</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DishFormModal;