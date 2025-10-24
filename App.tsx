import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plato, MenuDia, ShoppingListItem, ValidoPara, ComidaCena, SavedMenu, TipoPlato, Dificultad, AllergenName } from './types';
import { INITIAL_DISHES, COUNTRY_CODES, INITIAL_UTENSILS } from './constants';
import { PlusIcon, EditIcon, TrashIcon, LinkIcon, RefreshIcon, ChefHatIcon, SaveIcon, ArchiveIcon, FolderOpenIcon, CheckboxIcon, CheckboxCheckedIcon, DotsVerticalIcon, ExternalLinkIcon, DocumentTextIcon, SwapIcon, UploadIcon, DownloadIcon, UsersIcon, ClockIcon, BookOpenIcon, PrinterIcon, SpinnerIcon, SearchIcon, XIcon, SpeedometerIcon, GridViewIcon, ListViewIcon } from './components/icons';
import DishFormModal from './components/DishFormModal';
import SaveMenuModal from './components/SaveMenuModal';
import ConfirmationModal from './components/ConfirmationModal';
import DishPickerModal from './components/DishPickerModal';
import DishViewModal from './components/DishViewModal';
import { groupShoppingList, formatAsText, formatAsMarkdown, getShoppingListHTML } from './utils/shoppingListHelpers';
import { AllergenIcon, ALLERGENS_LIST } from './components/allergenData';

const Header: React.FC = () => (
    <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                    <ChefHatIcon className="h-8 w-8 text-primary-600"/>
                    <h1 className="text-2xl font-bold text-dark tracking-tight">Menú Fácil</h1>
                </div>
            </div>
        </div>
    </header>
);

const getDifficultyClass = (difficulty: Dificultad): string => {
    switch (difficulty) {
        case 'Fácil': return 'text-green-500';
        case 'Media': return 'text-amber-500';
        case 'Difícil': return 'text-red-500';
        default: return 'text-slate-500';
    }
};

const allergenColorClasses: Record<AllergenName, { text: string, bg: string }> = {
    'Gluten': { text: 'text-orange-600', bg: 'bg-orange-100' },
    'Crustáceos': { text: 'text-sky-600', bg: 'bg-sky-100' },
    'Huevos': { text: 'text-amber-600', bg: 'bg-amber-100' },
    'Pescado': { text: 'text-blue-600', bg: 'bg-blue-100' },
    'Cacahuetes': { text: 'text-yellow-800', bg: 'bg-yellow-100' },
    'Soja': { text: 'text-green-600', bg: 'bg-green-100' },
    'Lácteos': { text: 'text-purple-600', bg: 'bg-purple-100' },
    'Frutos de cáscara': { text: 'text-red-600', bg: 'bg-red-100' },
    'Apio': { text: 'text-lime-600', bg: 'bg-lime-100' },
    'Mostaza': { text: 'text-yellow-600', bg: 'bg-yellow-100' },
    'Sésamo': { text: 'text-stone-600', bg: 'bg-stone-100' },
    'Sulfitos': { text: 'text-pink-700', bg: 'bg-pink-100' },
    'Moluscos': { text: 'text-teal-600', bg: 'bg-teal-100' },
    'Altramuces': { text: 'text-yellow-500', bg: 'bg-yellow-100' }
};

const DishCard: React.FC<{ 
    dish: Plato, 
    onEdit: (dish: Plato) => void, 
    onDelete: (id: string) => void,
    onView: (dish: Plato) => void,
    isSelectionMode: boolean,
    isSelected: boolean,
    onToggleSelection: (id: string) => void
}> = ({ dish, onEdit, onDelete, onView, isSelectionMode, isSelected, onToggleSelection }) => {
    const cardClasses = `bg-white p-4 rounded-xl shadow-lg flex flex-col justify-between transition-all duration-200 relative cursor-pointer ${isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border border-slate-200 hover:scale-105 hover:shadow-xl'}`;
    const countryCode = COUNTRY_CODES[dish.pais];
    const difficultyClass = getDifficultyClass(dish.dificultad);

    return (
        <div className={cardClasses} onClick={() => isSelectionMode ? onToggleSelection(dish.id) : onView(dish)}>
             {isSelectionMode && (
                <div className="absolute top-3 right-3 z-10">
                    {isSelected 
                        ? <CheckboxCheckedIcon className="w-7 h-7 text-primary-600" />
                        : <CheckboxIcon className="w-7 h-7 text-slate-300" />
                    }
                </div>
            )}
            <div>
                 <div className="flex items-center gap-2">
                    {countryCode && (
                        <img
                            src={`https://flagcdn.com/w20/${countryCode}.png`}
                            alt={dish.pais}
                            title={dish.pais}
                            className="w-5 h-auto rounded-sm shrink-0"
                            loading="lazy"
                        />
                    )}
                    <h4 className="font-bold text-slate-800 text-lg pr-8">{dish.nombre}</h4>
                </div>
                <div className="text-xs text-slate-600 mt-2 flex flex-wrap gap-2">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium capitalize">{dish.tipo_plato.replace('_', ' ')}</span>
                    {dish.valido_para.map(v => <span key={v} className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full font-medium capitalize">{v}</span>)}
                </div>
                 <div className="text-sm text-slate-500 mt-3 flex items-center gap-4 flex-wrap">
                    {dish.raciones && <span className="flex items-center gap-1"><UsersIcon className="w-4 h-4"/> {dish.raciones}</span>}
                    {dish.tiempo_preparacion && <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4"/> {dish.tiempo_preparacion} min</span>}
                    {dish.dificultad && (
                        <span className={`flex items-center gap-1 ${difficultyClass}`}>
                            <SpeedometerIcon className="w-4 h-4"/> {dish.dificultad}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex justify-between items-end mt-4">
                <div className="flex flex-wrap gap-1">
                    {dish.alergenos?.map(allergenName => {
                        const colors = allergenColorClasses[allergenName] || { text: 'text-slate-600', bg: 'bg-slate-100' };
                        return (
                            <div key={allergenName} title={allergenName} className={`p-1 rounded-full ${colors.bg}`}>
                                <AllergenIcon name={allergenName} className={`w-6 h-6 ${colors.text}`}/>
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center justify-end space-x-3">
                    <a href={dish.receta_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary-600" aria-label={`Ver receta para ${dish.nombre}`} onClick={e => e.stopPropagation()}><LinkIcon className="w-5 h-5"/></a>
                    <button onClick={(e) => { e.stopPropagation(); onEdit(dish); }} className="text-slate-400 hover:text-secondary-600" aria-label={`Editar ${dish.nombre}`}><EditIcon className="w-5 h-5"/></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(dish.id); }} className="text-slate-400 hover:text-red-500" aria-label={`Eliminar ${dish.nombre}`}><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
        </div>
    )
};

const DishRow: React.FC<{ 
    dish: Plato, 
    onEdit: (dish: Plato) => void, 
    onDelete: (id: string) => void,
    onView: (dish: Plato) => void,
    isSelectionMode: boolean,
    isSelected: boolean,
    onToggleSelection: (id: string) => void
}> = ({ dish, onEdit, onDelete, onView, isSelectionMode, isSelected, onToggleSelection }) => {
    const rowClasses = `bg-white p-3 rounded-lg shadow-sm flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${isSelected ? 'border-primary-500 ring-2 ring-primary-200' : 'border border-slate-200 hover:bg-slate-50 hover:shadow-md'}`;
    const countryCode = COUNTRY_CODES[dish.pais];
    const difficultyClass = getDifficultyClass(dish.dificultad);

    return (
        <div className={rowClasses} onClick={() => isSelectionMode ? onToggleSelection(dish.id) : onView(dish)}>
            <div className="flex items-center gap-4 flex-grow">
                {isSelectionMode && (
                    <div className="flex-shrink-0">
                        {isSelected 
                            ? <CheckboxCheckedIcon className="w-6 h-6 text-primary-600" />
                            : <CheckboxIcon className="w-6 h-6 text-slate-300" />
                        }
                    </div>
                )}
                {countryCode && (
                    <img
                        src={`https://flagcdn.com/w40/${countryCode}.png`}
                        alt={dish.pais}
                        title={dish.pais}
                        className="w-10 h-auto rounded-sm shrink-0 hidden sm:block"
                        loading="lazy"
                    />
                )}
                <div className="flex-grow">
                    <h4 className="font-bold text-slate-800 text-base">{dish.nombre}</h4>
                    <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-2">
                        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium capitalize">{dish.tipo_plato.replace('_', ' ')}</span>
                        {dish.valido_para.map(v => <span key={v} className="bg-secondary-100 text-secondary-800 px-2 py-1 rounded-full font-medium capitalize">{v}</span>)}
                    </div>
                </div>
            </div>
             <div className="flex-shrink-0 flex items-center gap-2 mx-4">
                {dish.alergenos?.map(allergenName => {
                    const colors = allergenColorClasses[allergenName] || { text: 'text-slate-600', bg: 'bg-slate-100' };
                    return (
                        <div key={allergenName} title={allergenName}>
                            <AllergenIcon name={allergenName} className={`w-6 h-6 ${colors.text}`}/>
                        </div>
                    );
                })}
            </div>
            <div className="hidden md:flex items-center gap-4 flex-shrink-0 text-sm text-slate-500">
                {dish.raciones && <span className="flex items-center gap-1"><UsersIcon className="w-4 h-4"/> {dish.raciones}</span>}
                {dish.tiempo_preparacion && <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4"/> {dish.tiempo_preparacion} min</span>}
                {dish.dificultad && (
                    <span className={`flex items-center gap-1 font-medium ${difficultyClass}`}>
                        <SpeedometerIcon className="w-4 h-4"/> {dish.dificultad}
                    </span>
                )}
            </div>
            <div className="flex items-center justify-end space-x-3 flex-shrink-0">
                <a href={dish.receta_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary-600" aria-label={`Ver receta para ${dish.nombre}`} onClick={e => e.stopPropagation()}><LinkIcon className="w-5 h-5"/></a>
                <button onClick={(e) => { e.stopPropagation(); onEdit(dish); }} className="text-slate-400 hover:text-secondary-600" aria-label={`Editar ${dish.nombre}`}><EditIcon className="w-5 h-5"/></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(dish.id); }} className="text-slate-400 hover:text-red-500" aria-label={`Eliminar ${dish.nombre}`}><TrashIcon className="w-5 h-5"/></button>
            </div>
        </div>
    );
};

const ShoppingListActions: React.FC<{ 
    list: ShoppingListItem[],
    onOpen: () => void,
    onExport: (format: 'text' | 'markdown') => void
}> = ({ list, onOpen, onExport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (list.length === 0) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100"
                aria-label="Más opciones"
            >
                <DotsVerticalIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-20 border border-slate-200">
                    <div className="py-1">
                        <button 
                            onClick={() => { onOpen(); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-3"
                        >
                            <ExternalLinkIcon className="w-5 h-5" />
                            Abrir en nueva ventana
                        </button>
                        <button 
                            onClick={() => { onExport('text'); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-3"
                        >
                             <DocumentTextIcon className="w-5 h-5" />
                            Exportar a Texto (.txt)
                        </button>
                         <button 
                            onClick={() => { onExport('markdown'); setIsOpen(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-3"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Exportar a Markdown (.md)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const App: React.FC = () => {
    const [dishes, setDishes] = useState<Plato[]>(() => {
        try {
            const localData = localStorage.getItem('dishes');
            return localData ? JSON.parse(localData) : INITIAL_DISHES;
        } catch (error) {
            console.error("Error parsing dishes from localStorage", error);
            return INITIAL_DISHES;
        }
    });
    
    const [utensilsList, setUtensilsList] = useState<string[]>(() => {
        try {
            const localData = localStorage.getItem('utensilsList');
            return localData ? JSON.parse(localData) : INITIAL_UTENSILS;
        } catch (error) {
            console.error("Error parsing utensilsList from localStorage", error);
            return INITIAL_UTENSILS;
        }
    });

    const getTomorrowISO = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const [menu, setMenu] = useState<MenuDia[] | null>(null);
    const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
    const [savedMenus, setSavedMenus] = useState<SavedMenu[]>([]);
    const [numDays, setNumDays] = useState(7);
    const [startDate, setStartDate] = useState(getTomorrowISO());
    const [isDishModalOpen, setIsDishModalOpen] = useState(false);
    const [isSaveMenuModalOpen, setIsSaveMenuModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDishPickerOpen, setIsDishPickerOpen] = useState(false);
    const [dishToView, setDishToView] = useState<Plato | null>(null);
    const [dishPickerContext, setDishPickerContext] = useState<{diaIndex: number; mealType: 'comida' | 'cena'; dishSlot: 'plato1' | 'plato2', filterType: TipoPlato} | null>(null);
    const [menuToDelete, setMenuToDelete] = useState<SavedMenu | null>(null);
    const [dishToDelete, setDishToDelete] = useState<string | null>(null);
    const [dishToEdit, setDishToEdit] = useState<Plato | null>(null);
    const [activeTab, setActiveTab] = useState<'menu' | 'platos' | 'saved'>('menu');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedDishes, setSelectedDishes] = useState<Set<string>>(new Set());
    const [confirmationContext, setConfirmationContext] = useState<'menu' | 'dish' | 'multi-dish' | 'all-dishes' | null>(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [dishSearchTerm, setDishSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<{ type: 'country' | 'difficulty' | null, value: string | null }>({ type: null, value: null });
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const importFileInputRef = useRef<HTMLInputElement>(null);
    
    const groupedShoppingList = useMemo(() => shoppingList.length > 0 ? groupShoppingList(shoppingList) : null, [shoppingList]);
    
    useEffect(() => {
        localStorage.setItem('dishes', JSON.stringify(dishes));
    }, [dishes]);
    
    useEffect(() => {
        try {
            const localData = localStorage.getItem('savedMenus');
            if (localData) {
                setSavedMenus(JSON.parse(localData));
            }
        } catch (error) {
            console.error("Error parsing saved menus from localStorage", error);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('savedMenus', JSON.stringify(savedMenus));
    }, [savedMenus]);

    useEffect(() => {
        localStorage.setItem('utensilsList', JSON.stringify(utensilsList));
    }, [utensilsList]);

    const addUtensilToList = useCallback((utensil: string) => {
        setUtensilsList(prev => {
            if (prev.find(u => u.toLowerCase() === utensil.toLowerCase())) {
                return prev;
            }
            return [...prev, utensil].sort((a, b) => a.localeCompare(b));
        });
    }, []);

    const generateShoppingList = useCallback((menuData: MenuDia[] | null): ShoppingListItem[] => {
        if (!menuData) return [];

        const consolidatedList: { [key: string]: { nombre: string; cantidad: number; unidad: string; } } = {};
        menuData.forEach(dia => {
            [dia.comida, dia.cena].forEach(meal => {
                if(meal) {
                    [meal.plato1, meal.plato2].forEach(plato => {
                        if (plato) {
                            plato.ingredientes.forEach(ing => {
                                if (ing.opcional) return;
                                const key = `${ing.nombre.trim().toLowerCase()}_${ing.unidad}`;
                                if (consolidatedList[key]) {
                                    consolidatedList[key].cantidad += ing.cantidad;
                                } else {
                                    consolidatedList[key] = { ...ing, nombre: ing.nombre.trim() };
                                }
                            });
                        }
                    });
                }
            });
        });

        const sortedList = Object.values(consolidatedList)
            .map(item => ({...item, checked: false}))
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

        return sortedList;
    }, []);

    const updateMenuAndShoppingList = (newMenu: MenuDia[] | null) => {
        setMenu(newMenu);
        setShoppingList(generateShoppingList(newMenu));
    };

    const generateMeal = useCallback((mealType: ValidoPara): ComidaCena => {
        const usedDishIdsInMenu = new Set<string>();
        menu?.forEach(d => {
            if(d.comida?.plato1) usedDishIdsInMenu.add(d.comida.plato1.id);
            if(d.comida?.plato2) usedDishIdsInMenu.add(d.comida.plato2.id);
            if(d.cena?.plato1) usedDishIdsInMenu.add(d.cena.plato1.id);
            if(d.cena?.plato2) usedDishIdsInMenu.add(d.cena.plato2.id);
        });

        const getRandomDish = (filter: (d: Plato) => boolean): Plato | undefined => {
            const available = dishes.filter(d => !usedDishIdsInMenu.has(d.id) && filter(d));
            if (available.length > 0) {
                const dish = available[Math.floor(Math.random() * available.length)];
                usedDishIdsInMenu.add(dish.id);
                return dish;
            }
            const allMatching = dishes.filter(filter);
            return allMatching.length > 0 ? allMatching[Math.floor(Math.random() * allMatching.length)] : undefined;
        };
        
        if (Math.random() < 0.25) {
            const plato = getRandomDish(d => d.valido_para.includes(mealType) && d.tipo_plato === 'plato_unico');
            if (plato) return { plato1: plato };
        }
        
        if (Math.random() < 0.66) {
            const entrante = getRandomDish(d => d.valido_para.includes(mealType) && d.tipo_plato === 'plato_entrante');
            const principal = getRandomDish(d => d.valido_para.includes(mealType) && d.tipo_plato === 'plato_principal');
            if (entrante && principal) return { plato1: entrante, plato2: principal };
        }
        
        const principal = getRandomDish(d => d.valido_para.includes(mealType) && d.tipo_plato === 'plato_principal');
        const postre = getRandomDish(d => d.valido_para.includes(mealType) && d.tipo_plato === 'postre');
        if (principal && postre) return { plato1: principal, plato2: postre };
        
        const fallbackDish = getRandomDish(d => d.valido_para.includes(mealType)) ?? dishes[0];
        return { plato1: fallbackDish };
    }, [dishes, menu]);

    const handleGenerateMenu = useCallback(() => {
        const newMenu: MenuDia[] = [];
        const [year, month, day] = startDate.split('-').map(Number);
        
        // Correct timezone handling by creating date from parts in local time
        const baseDate = new Date();
        baseDate.setFullYear(year, month - 1, day);
        baseDate.setHours(0, 0, 0, 0);


        for (let i = 0; i < numDays; i++) {
            const currentDate = new Date(baseDate);
            currentDate.setDate(baseDate.getDate() + i);
            
            const yyyy = currentDate.getFullYear();
            const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dd = String(currentDate.getDate()).padStart(2, '0');
            const formattedDate = `${yyyy}-${mm}-${dd}`;

            newMenu.push({
                dia: i + 1,
                fecha: formattedDate,
                comida: generateMeal('comida'),
                cena: generateMeal('cena')
            });
        }
        updateMenuAndShoppingList(newMenu);
        setActiveTab('menu');
    }, [numDays, startDate, generateMeal]);

    const handleRefreshMeal = (diaIndex: number, mealType: 'comida' | 'cena') => {
        if(!menu) return;
        const newMenu = [...menu];
        newMenu[diaIndex] = { ...newMenu[diaIndex], [mealType]: generateMeal(mealType) };
        updateMenuAndShoppingList(newMenu);
    };

    const handleOpenDishPicker = (diaIndex: number, mealType: 'comida' | 'cena', dishSlot: 'plato1' | 'plato2', currentDishType: TipoPlato) => {
        setDishPickerContext({ diaIndex, mealType, dishSlot, filterType: currentDishType });
        setIsDishPickerOpen(true);
    };

    const handleSelectDish = (newDish: Plato) => {
        if(!menu || !dishPickerContext) return;

        const { diaIndex, mealType, dishSlot } = dishPickerContext;
        const newMenu = [...menu];
        const currentDay = { ...newMenu[diaIndex] };
        let currentMeal = currentDay[mealType] ? { ...currentDay[mealType] } : { plato1: newDish };

        if (newDish.tipo_plato === 'plato_unico') {
            currentMeal = { plato1: newDish };
        } else {
             (currentMeal as any)[dishSlot] = newDish;
        }

        currentDay[mealType] = currentMeal as ComidaCena;
        newMenu[diaIndex] = currentDay;

        updateMenuAndShoppingList(newMenu);
        setIsDishPickerOpen(false);
        setDishPickerContext(null);
    };

    const handleDeleteDishFromMenu = (diaIndex: number, mealType: 'comida' | 'cena', dishSlot: 'plato1' | 'plato2') => {
        if(!menu) return;
        const newMenu = [...menu];
        const currentDay = { ...newMenu[diaIndex] };
        let currentMeal = currentDay[mealType] ? { ...currentDay[mealType] } : null;

        if (currentMeal) {
            if (dishSlot === 'plato1') {
                if (currentMeal.plato2) {
                    currentMeal = { plato1: currentMeal.plato2 };
                } else {
                    currentMeal = null;
                }
            } else { // dishSlot === 'plato2'
                delete currentMeal.plato2;
            }
        }
        
        currentDay[mealType] = currentMeal;
        newMenu[diaIndex] = currentDay;
        updateMenuAndShoppingList(newMenu);
    };


    const handleToggleCheck = (itemName: string) => {
        setShoppingList(prev => 
            prev.map(item =>
                item.nombre === itemName ? { ...item, checked: !item.checked } : item
            )
        );
    }

    const handleSaveDish = (dish: Plato) => {
        setDishes(prev => {
            const existing = prev.find(d => d.id === dish.id);
            if (existing) {
                return prev.map(d => d.id === dish.id ? dish : d);
            }
            return [...prev, dish];
        });
        setActiveTab('platos');
    };

    const handleEditDish = (dish: Plato) => {
        setDishToEdit(dish);
        setIsDishModalOpen(true);
    };

    const handleViewDish = (dish: Plato) => {
        setDishToView(dish);
    };

    const handleDeleteDishFromList = (id: string) => {
        setDishToDelete(id);
        setConfirmationContext('dish');
        setIsConfirmModalOpen(true);
    };
    
    const handleAddNewDish = () => {
        setDishToEdit(null);
        setIsDishModalOpen(true);
    };

    const handleSaveMenu = () => {
        if (!menu || shoppingList.length === 0) return;
        setIsSaveMenuModalOpen(true);
    };

    const handleConfirmSaveMenu = ({ name, description }: { name: string, description: string }) => {
        if (!menu) return;
        
        const newSavedMenu: SavedMenu = {
            id: new Date().toISOString(),
            name: name.trim(),
            description: description.trim(),
            menu,
            shoppingList,
            createdAt: new Date().toISOString(),
        };
        setSavedMenus(prev => [...prev, newSavedMenu].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setIsSaveMenuModalOpen(false);
        alert(`Menú "${name.trim()}" guardado correctamente!`);
        setActiveTab('saved');
    };
    
    const handleLoadMenu = (id: string) => {
        const menuToLoad = savedMenus.find(m => m.id === id);
        if (menuToLoad) {
            updateMenuAndShoppingList(menuToLoad.menu);
            setActiveTab('menu');
        }
    };
    
    const handleDeleteSavedMenu = (id: string) => {
        const menu = savedMenus.find(m => m.id === id);
        if (menu) {
            setMenuToDelete(menu);
            setConfirmationContext('menu');
            setIsConfirmModalOpen(true);
        }
    };
    
    const handleToggleDishSelection = (id: string) => {
        setSelectedDishes(prev => {
            const newSelection = new Set(prev);
            if (newSelection.has(id)) {
                newSelection.delete(id);
            } else {
                newSelection.add(id);
            }
            return newSelection;
        });
    };

    const handleDeleteSelectedDishes = () => {
        if (selectedDishes.size === 0) return;
        setConfirmationContext('multi-dish');
        setIsConfirmModalOpen(true);
    };

    const handleDeleteAllDishes = () => {
        if (dishes.length === 0) return;
        setConfirmationContext('all-dishes');
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        switch (confirmationContext) {
            case 'menu':
                if (menuToDelete) {
                    setSavedMenus(prev => prev.filter(m => m.id !== menuToDelete.id));
                }
                break;
            case 'dish':
                if (dishToDelete) {
                    setDishes(prev => prev.filter(d => d.id !== dishToDelete));
                }
                break;
            case 'multi-dish':
                setDishes(prev => prev.filter(d => !selectedDishes.has(d.id)));
                setIsSelectionMode(false);
                setSelectedDishes(new Set());
                break;
            case 'all-dishes':
                setDishes([]);
                break;
        }
        
        setIsConfirmModalOpen(false);
        setMenuToDelete(null);
        setDishToDelete(null);
        setConfirmationContext(null);
    };
    
    const closeConfirmationModal = () => {
        setIsConfirmModalOpen(false);
        setMenuToDelete(null);
        setDishToDelete(null);
        setConfirmationContext(null);
    };

    const handleOpenShoppingListWindow = () => {
        if (!groupedShoppingList) return;
        const listWindow = window.open('', '_blank');
        if (listWindow) {
            listWindow.document.write(getShoppingListHTML(groupedShoppingList));
            listWindow.document.close();
        }
    };
    
    const handleExportShoppingList = (format: 'text' | 'markdown') => {
        if (!groupedShoppingList) return;
        
        const content = format === 'markdown' 
            ? formatAsMarkdown(groupedShoppingList)
            : formatAsText(groupedShoppingList);
        
        const mimeType = format === 'text' ? 'text/plain' : 'text/markdown';
        const filename = `lista-compra.${format === 'text' ? 'txt' : 'md'}`;

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const isPlato = (obj: any): obj is Plato => {
        return obj && typeof obj.id === 'string' && typeof obj.nombre === 'string' && Array.isArray(obj.ingredientes);
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (typeof content !== 'string') throw new Error("File content is not a string");
                
                const importedDishes = JSON.parse(content);
                if (!Array.isArray(importedDishes) || !importedDishes.every(isPlato)) {
                    throw new Error("Invalid JSON format. Expected an array of dishes.");
                }

                let newDishesCount = 0;
                const currentDishIds = new Set(dishes.map(d => d.id));

                const dishesToAdd = importedDishes.filter(importedDish => {
                    if (!currentDishIds.has(importedDish.id)) {
                        newDishesCount++;
                        return true;
                    }
                    return false;
                });
                
                setDishes(prev => [...prev, ...dishesToAdd]);
                alert(`${newDishesCount} ${newDishesCount === 1 ? 'receta' : 'recetas'} importadas correctamente. ${importedDishes.length - newDishesCount} recetas duplicadas fueron ignoradas.`);

            } catch (error) {
                console.error("Error importing dishes:", error);
                alert(`Error al importar el archivo: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
                if (importFileInputRef.current) {
                    importFileInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(file);
    };

    const handleExportDishes = () => {
        const jsonString = JSON.stringify(dishes, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recetas.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatDateHeader = (dateString: string): string => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const weekday = date.toLocaleDateString('es-ES', { weekday: 'long' });
        return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
    };

    const handleExportPDF = async () => {
        if (!menu || !groupedShoppingList) return;
        setIsGeneratingPdf(true);
    
        try {
            const { jsPDF } = (window as any).jspdf;
            const html2canvas = (window as any).html2canvas;
    
            // --- Create a temporary container for rendering ---
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.width = '1123px'; // A4 landscape width in pixels for ~96 DPI
            container.style.fontFamily = "'Inter', sans-serif";
            document.body.appendChild(container);
    
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidthL = pdf.internal.pageSize.getWidth();
            const margin = 10;
    
            const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" style="height: 1.2rem; width: 1.2rem; color: #f59e0b;" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536a1 1 0 00-1.414-1.414l-1.06 1.06a1 1 0 001.414 1.414l1.06-1.06zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm14 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM4.536 14.464a1 1 0 00-1.414-1.414l-1.06 1.06a1 1 0 001.414 1.414l1.06-1.06zM15.464 4.536a1 1 0 00-1.414-1.414l-1.06 1.06a1 1 0 101.414 1.414l1.06-1.06zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zM4.536 5.536a1 1 0 001.414 1.414l1.06-1.06a1 1 0 00-1.414-1.414l-1.06 1.06z" clip-rule="evenodd" /></svg>`;
            const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" style="height: 1.2rem; width: 1.2rem; color: #6366f1;" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>`;
    
            // --- Paginate Weekly Menu ---
            const daysPerPage = 8;
            for (let i = 0; i < menu.length; i += daysPerPage) {
                const pageMenu = menu.slice(i, i + daysPerPage);
                if (i > 0) {
                    pdf.addPage('l', 'mm', 'a4');
                }
    
                const startDateFormatted = formatDateHeader(pageMenu[0].fecha).split(' ').slice(1).join(' ');
                const endDateFormatted = formatDateHeader(pageMenu[pageMenu.length - 1].fecha).split(' ').slice(1).join(' ');
    
                const menuHtml = `
                    <div class="p-8 bg-white text-slate-800" style="width: 1123px; font-family: 'Inter', sans-serif;">
                        <div class='text-center mb-6'>
                            <h1 class="text-3xl font-bold text-slate-800">Menú Semanal</h1>
                            <p class="text-lg text-slate-500">Semana del ${startDateFormatted} al ${endDateFormatted}</p>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: start; margin-top: 50px;">
                            ${pageMenu.map(dia => `
                                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200" style="font-size: 16px; line-height: 1.5;">
                                    <h3 class="font-bold text-center border-b border-slate-300 pb-2 mb-2 text-primary-700" style="font-size: 20px;">${formatDateHeader(dia.fecha)}</h3>
                                    <div class="space-y-3">
                                        <div>
                                            <h4 class="font-semibold flex items-center gap-1.5" style="color: #475569; font-size: 13px;">${sunIcon} Comida</h4>
                                            <div class="pl-2 text-slate-600">
                                                ${dia.comida ? `
                                                    <p>${dia.comida.plato1.nombre}</p>
                                                    ${dia.comida.plato2 ? `<p>${dia.comida.plato2.nombre}</p>` : ''}`
                                                : '<p class="text-slate-400 italic">No planificado</p>'}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 class="font-semibold flex items-center gap-1.5" style="color: #475569; font-size: 13px;">${moonIcon} Cena</h4>
                                            <div class="pl-2 text-slate-600">
                                                ${dia.cena ? `
                                                    <p>${dia.cena.plato1.nombre}</p>
                                                    ${dia.cena.plato2 ? `<p>${dia.cena.plato2.nombre}</p>` : ''}`
                                                : '<p class="text-slate-400 italic">No planificado</p>'}
                                            </div>
                                        </div>
                                    </div>
                                </div>`).join('')}
                        </div>
                    </div>`;
    
                container.innerHTML = menuHtml;
                const menuCanvas = await html2canvas(container, { scale: 2 });
                const menuImgData = menuCanvas.toDataURL('image/png');
                
                const imgProps = pdf.getImageProperties(menuImgData);
                const imgWidth = pdfWidthL - margin * 2;
                const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

                pdf.addImage(menuImgData, 'PNG', margin, margin, imgWidth, imgHeight);
            }
    
            // --- Paginate Shopping List ---
            pdf.addPage('p', 'mm', 'a4');
            const pdfWidthP = pdf.internal.pageSize.getWidth();
            const pdfHeightP = pdf.internal.pageSize.getHeight();
            
            // Change container width for portrait rendering
            container.style.width = '800px'; 
    
            const shoppingListHtml = `
                <div class="p-8 bg-white text-slate-800" style="width: 800px; font-family: 'Inter', sans-serif;">
                    <h1 class="text-3xl font-bold text-slate-800 text-center mb-8">Lista de la Compra</h1>
                    <div style="column-count: 3; column-gap: 24px;">
                        ${Object.entries(groupedShoppingList).map(([category, items]) => `
                            <div style="break-inside: avoid; page-break-inside: avoid; margin-bottom: 20px;">
                                <h3 class="font-bold text-lg text-secondary-800 bg-secondary-100 px-3 py-2 rounded-md mb-3">${category}</h3>
                                <ul class="space-y-2" style="font-size: 12px;">
                                    ${(items as ShoppingListItem[]).map(item => `
                                        <li class="flex items-center p-1.5 rounded-lg">
                                            <div style="width: 1.1rem; height: 1.1rem; border: 1.5px solid #94a3b8; border-radius: 0.25rem; margin-right: 0.75rem; flex-shrink: 0;"></div>
                                            <span class="flex-grow capitalize text-slate-700">${item.nombre}</span>
                                            <span class="font-medium ml-2 text-slate-600">${item.cantidad} ${item.unidad}</span>
                                        </li>`).join('')}
                                </ul>
                            </div>`).join('')}
                    </div>
                </div>`;
    
            container.innerHTML = shoppingListHtml;
            const shoppingListCanvas = await html2canvas(container, { scale: 2 });
            const shoppingListImgData = shoppingListCanvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(shoppingListImgData);
            const imgWidth = pdfWidthP - margin * 2;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            
            let heightLeft = imgHeight;
            let position = 0;
    
            // Add the first slice of the shopping list
            pdf.addImage(shoppingListImgData, 'PNG', margin, margin, imgWidth, imgHeight);
            heightLeft -= (pdfHeightP - margin);
    
            // Add more pages if the list is too long
            while (heightLeft > 0) {
                position -= (pdfHeightP - margin * 2);
                pdf.addPage();
                pdf.addImage(shoppingListImgData, 'PNG', margin, position, imgWidth, imgHeight);
                heightLeft -= (pdfHeightP - margin * 2);
            }
            
            // --- Cleanup and Save ---
            document.body.removeChild(container);
            pdf.save('menu-semanal.pdf');
        } catch(error) {
            console.error("Error generating PDF:", error);
            alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };
    
    const getConfirmationModalContent = () => {
        switch (confirmationContext) {
            case 'menu':
                return {
                    title: "Confirmar Eliminación",
                    body: <p>¿Estás seguro de que quieres eliminar el menú <strong>"{menuToDelete?.name}"</strong>? Esta acción no se puede deshacer.</p>
                };
            case 'dish':
                const dishName = dishes.find(d => d.id === dishToDelete)?.nombre;
                return {
                    title: "Confirmar Eliminación",
                    body: <p>¿Estás seguro de que quieres eliminar el plato <strong>"{dishName}"</strong>? Esta acción no se puede deshacer.</p>
                };
            case 'multi-dish':
                 return {
                    title: `Eliminar ${selectedDishes.size} Platos`,
                    body: <p>¿Estás seguro de que quieres eliminar los <strong>{selectedDishes.size} platos seleccionados</strong>? Esta acción no se puede deshacer.</p>
                 };
            case 'all-dishes':
                return {
                    title: "Eliminar Todos los Platos",
                    body: <p>¿Estás seguro de que quieres eliminar los <strong>{dishes.length} platos</strong> de tu colección? Esta acción es irreversible.</p>
                };
            default:
                return { title: '', body: null };
        }
    };

    const TabButton: React.FC<{ tabId: 'menu' | 'platos' | 'saved'; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-6 py-3 font-semibold text-base rounded-t-lg transition-colors flex items-center gap-2 ${
                activeTab === tabId 
                    ? 'bg-white text-primary-700' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
        >
            {children}
        </button>
    );

    const renderDishInMenu = (dish: Plato, diaIndex: number, mealType: 'comida' | 'cena', dishSlot: 'plato1' | 'plato2') => {
        const formatType = (type: string) => type.replace('_', ' ');
        return (
            <div className="group flex justify-between items-center py-1">
                <p className="text-slate-700">{dish.nombre} <span className="text-xs text-slate-500 capitalize">({formatType(dish.tipo_plato)})</span></p>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenDishPicker(diaIndex, mealType, dishSlot, dish.tipo_plato)} className="text-slate-400 hover:text-primary-600" title="Cambiar plato"><SwapIcon className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteDishFromMenu(diaIndex, mealType, dishSlot)} className="text-slate-400 hover:text-red-500" title="Eliminar plato"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
        );
    };

    const searchedDishes = useMemo(() => {
        const searchTerm = dishSearchTerm.toLowerCase();
        if (!searchTerm) return dishes;

        return dishes.filter(dish =>
            dish.nombre.toLowerCase().includes(searchTerm) ||
            dish.ingredientes.some(ing => ing.nombre.toLowerCase().includes(searchTerm))
        );
    }, [dishes, dishSearchTerm]);

    const dishesByCountry = useMemo(() => {
        return searchedDishes.reduce((acc, dish) => {
            if (dish.pais) {
                acc[dish.pais] = (acc[dish.pais] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
    }, [searchedDishes]);

    const dishesByDifficulty = useMemo(() => {
        return searchedDishes.reduce((acc, dish) => {
            acc[dish.dificultad] = (acc[dish.dificultad] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }, [searchedDishes]);
    
    const filteredDishes = useMemo(() => {
        const { type, value } = activeFilter;
        if (!type || !value) {
            return searchedDishes;
        }
        
        return searchedDishes.filter(dish => {
            if (type === 'country') return dish.pais === value;
            if (type === 'difficulty') return dish.dificultad === value;
            return true;
        });
    }, [searchedDishes, activeFilter]);

    const handleFilterClick = (type: 'country' | 'difficulty', value: string) => {
        setActiveFilter(prev => {
            if (prev.type === type && prev.value === value) {
                return { type: null, value: null };
            }
            return { type, value };
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                
                <div className="bg-white p-6 rounded-t-xl shadow-lg">
                    <div className="bg-primary-50 border-2 border-dashed border-primary-200 p-6 rounded-xl">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Days Input */}
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                    <label htmlFor="numDays" className="block text-sm font-medium text-slate-500 mb-1">Planificar para:</label>
                                    <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <input
                                        id="numDays"
                                        type="number"
                                        value={numDays}
                                        onChange={(e) => setNumDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                        className="w-full text-lg font-bold border-0 focus:ring-0 p-0"
                                    />
                                    <span className="text-slate-600 font-medium">días</span>
                                  </div>
                                </div>
                                {/* Start Date Input */}
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-500 mb-1">Empezando el:</label>
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            id="startDate"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full text-lg font-bold border-0 focus:ring-0 p-0"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Generate Button */}
                            <button onClick={handleGenerateMenu} className="bg-primary-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:bg-primary-700 transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-lg h-full">
                                <RefreshIcon className="w-6 h-6"/>
                                Generar Menú
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-lg">
                    <div className="border-b border-slate-200">
                      <div className="flex space-x-1 px-5">
                          <TabButton tabId="menu">Menú y Compra</TabButton>
                          <TabButton tabId="platos">Mis Platos</TabButton>
                          <TabButton tabId="saved"><ArchiveIcon className="w-4 h-4" /> Guardados</TabButton>
                      </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-b-xl shadow-lg">
                  {activeTab === 'menu' && (
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                          <div className="lg:col-span-3">
                              <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-dark">Tu Menú Semanal</h2>
                                <div className="flex items-center gap-2">
                                     <button 
                                        onClick={handleSaveMenu} 
                                        disabled={!menu}
                                        className="bg-secondary-100 text-secondary-800 font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-secondary-200 transition-all flex items-center gap-2 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none"
                                        title="Guardar Menú"
                                    >
                                        <SaveIcon className="w-5 h-5"/>
                                        <span className="hidden sm:inline">Guardar</span>
                                    </button>
                                    <button 
                                        onClick={handleExportPDF} 
                                        disabled={!menu || isGeneratingPdf}
                                        className="bg-green-100 text-green-800 font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-green-200 transition-all flex items-center gap-2 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed disabled:shadow-none"
                                        title="Exportar a PDF"
                                    >
                                        {isGeneratingPdf ? (
                                            <>
                                                <SpinnerIcon className="animate-spin w-5 h-5" />
                                                <span className="hidden sm:inline">Generando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <PrinterIcon className="w-5 h-5"/>
                                                <span className="hidden sm:inline">Exportar PDF</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                              </div>
                              {menu ? (
                                  <div className="space-y-6">
                                      {menu.map((dia, diaIndex) => (
                                          <div key={dia.dia} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                              <h3 className="text-xl font-bold text-primary-700 mb-4">{formatDateHeader(dia.fecha)} (Día {dia.dia})</h3>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                  <div>
                                                      <div className="flex justify-between items-center border-b pb-1 mb-2">
                                                          <h4 className="font-semibold text-slate-800">Comida</h4>
                                                          <button onClick={() => handleRefreshMeal(diaIndex, 'comida')} className="text-slate-400 hover:text-primary-600" title="Sugerir nueva comida"><RefreshIcon className="w-4 h-4"/></button>
                                                      </div>
                                                      <div className="space-y-1">
                                                          {dia.comida ? (
                                                              <>
                                                                  {renderDishInMenu(dia.comida.plato1, diaIndex, 'comida', 'plato1')}
                                                                  {dia.comida.plato2 && renderDishInMenu(dia.comida.plato2, diaIndex, 'comida', 'plato2')}
                                                              </>
                                                          ) : (
                                                              <button onClick={() => handleRefreshMeal(diaIndex, 'comida')} className="text-sm text-primary-600 hover:underline">Añadir comida</button>
                                                          )}
                                                      </div>
                                                  </div>
                                                  <div>
                                                      <div className="flex justify-between items-center border-b pb-1 mb-2">
                                                           <h4 className="font-semibold text-slate-800">Cena</h4>
                                                           <button onClick={() => handleRefreshMeal(diaIndex, 'cena')} className="text-slate-400 hover:text-primary-600" title="Sugerir nueva cena"><RefreshIcon className="w-4 h-4"/></button>
                                                      </div>
                                                      <div className="space-y-1">
                                                          {dia.cena ? (
                                                              <>
                                                                  {renderDishInMenu(dia.cena.plato1, diaIndex, 'cena', 'plato1')}
                                                                  {dia.cena.plato2 && renderDishInMenu(dia.cena.plato2, diaIndex, 'cena', 'plato2')}
                                                              </>
                                                           ) : (
                                                              <button onClick={() => handleRefreshMeal(diaIndex, 'cena')} className="text-sm text-primary-600 hover:underline">Añadir cena</button>
                                                          )}
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="bg-slate-50 p-10 rounded-xl text-center text-slate-500 border-2 border-dashed">
                                      <h3 className="text-xl font-medium text-slate-700">¡Todo listo para empezar!</h3>
                                      <p className="mt-2">Ajusta los días que necesites y pulsa "Generar" para crear tu plan de comidas.</p>
                                  </div>
                              )}
                          </div>
                          <div className="lg:col-span-2">
                               <div className="flex justify-between items-center mb-4">
                                  <h2 className="text-2xl font-bold text-dark">Lista de la Compra</h2>
                                  <ShoppingListActions
                                      list={shoppingList}
                                      onOpen={handleOpenShoppingListWindow}
                                      onExport={handleExportShoppingList}
                                  />
                               </div>
                               <div className="bg-slate-50 p-4 rounded-xl max-h-[80vh] overflow-y-auto border border-slate-200">
                                  {groupedShoppingList ? (
                                      <div className="space-y-4">
                                          {Object.entries(groupedShoppingList).map(([category, items]) => (
                                              <div key={category}>
                                                  <h3 className="font-bold text-md text-secondary-800 bg-secondary-100 px-3 py-1 rounded-md mb-2">{category}</h3>
                                                  <ul className="space-y-1">
                                                      {(items as ShoppingListItem[]).map(item => (
                                                          <li key={item.nombre} className={`flex items-center p-2 rounded-lg transition-colors ${item.checked ? 'bg-green-50' : 'hover:bg-slate-50'}`}>
                                                              <input type="checkbox" checked={item.checked} onChange={() => handleToggleCheck(item.nombre)} className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 mr-4"/>
                                                              <span className={`flex-grow capitalize transition-colors ${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.nombre}</span>
                                                              <span className={`font-medium transition-colors ${item.checked ? 'text-slate-400' : 'text-slate-600'}`}>{item.cantidad} {item.unidad}</span>
                                                          </li>
                                                      ))}
                                                  </ul>
                                              </div>
                                          ))}
                                      </div>
                                  ) : (
                                      <p className="text-center text-slate-500 py-10">Tu lista de la compra aparecerá aquí cuando generes un menú.</p>
                                  )}
                               </div>
                          </div>
                      </div>
                  )}

                  {activeTab === 'platos' && (
                      <div className="relative">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                                <h2 className="text-2xl font-bold text-dark whitespace-nowrap">Gestor de Platos ({dishes.length})</h2>
                                <div className="relative w-full sm:w-auto">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <SearchIcon className="w-5 h-5 text-slate-400" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Buscar por plato o ingrediente..."
                                        value={dishSearchTerm}
                                        onChange={(e) => setDishSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300 w-full sm:w-64"
                                    />
                                </div>
                                 <div className="flex items-center gap-2">
                                    <button onClick={() => setViewMode('grid')} title="Vista de cuadrícula" className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                                        <GridViewIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setViewMode('list')} title="Vista de lista" className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-600 text-white shadow' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                                        <ListViewIcon className="w-5 h-5" />
                                    </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
                                 {isSelectionMode ? (
                                      <>
                                          <button onClick={handleDeleteSelectedDishes} disabled={selectedDishes.size === 0} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition-all flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed">
                                              <TrashIcon className="w-5 h-5"/> Eliminar ({selectedDishes.size})
                                          </button>
                                          <button onClick={() => { setIsSelectionMode(false); setSelectedDishes(new Set()); }} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-all">
                                              Cancelar
                                          </button>
                                      </>
                                  ) : (
                                      <>
                                          <input type="file" ref={importFileInputRef} onChange={handleFileImport} accept=".json" style={{ display: 'none' }} />
                                          <button onClick={() => importFileInputRef.current?.click()} title="Importar" className="bg-slate-200 text-slate-800 p-2 rounded-lg hover:bg-slate-300 transition-all">
                                              <UploadIcon className="w-5 h-5"/>
                                          </button>
                                          <button onClick={handleExportDishes} title="Exportar" className="bg-slate-200 text-slate-800 p-2 rounded-lg hover:bg-slate-300 transition-all">
                                              <DownloadIcon className="w-5 h-5"/>
                                          </button>
                                          <button onClick={() => setIsSelectionMode(true)} title="Seleccionar" className="bg-slate-200 text-slate-800 p-2 rounded-lg hover:bg-slate-300 transition-all">
                                               <CheckboxCheckedIcon className="w-5 h-5" />
                                          </button>
                                          <button onClick={handleDeleteAllDishes} disabled={dishes.length === 0} title="Borrar Todo" className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition-all disabled:bg-slate-100 disabled:text-slate-400">
                                              <TrashIcon className="w-5 h-5"/>
                                          </button>
                                      </>
                                  )}
                              </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 p-4 bg-slate-100 rounded-lg border">
                                <div className="font-semibold text-slate-700">
                                    Resultados: <span className="text-lg font-bold text-dark">{filteredDishes.length}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <span className="font-semibold text-slate-700 mr-2">Por País:</span>
                                    {Object.entries(dishesByCountry).length > 0 ? (
                                        Object.entries(dishesByCountry).map(([pais, count]) => {
                                            const isActive = activeFilter.type === 'country' && activeFilter.value === pais;
                                            return (
                                                <button 
                                                    key={pais} 
                                                    onClick={() => handleFilterClick('country', pais)}
                                                    className={`text-sm px-2.5 py-1 rounded-full shadow-sm border transition-all duration-200 ${
                                                        isActive 
                                                            ? 'bg-primary-600 text-white border-primary-600 ring-2 ring-primary-200' 
                                                            : 'bg-white hover:bg-slate-100 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {pais}: <span className="font-bold">{count}</span>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <span className="text-sm text-slate-500">Ninguno</span>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                     <span className="font-semibold text-slate-700 mr-2">Por Dificultad:</span>
                                     {Object.entries(dishesByDifficulty).length > 0 ? (
                                        Object.entries(dishesByDifficulty).map(([dificultad, count]) => {
                                            const isActive = activeFilter.type === 'difficulty' && activeFilter.value === dificultad;
                                            return (
                                                <button 
                                                    key={dificultad} 
                                                    onClick={() => handleFilterClick('difficulty', dificultad)}
                                                    className={`text-sm px-2.5 py-1 rounded-full shadow-sm border transition-all duration-200 ${
                                                        isActive 
                                                            ? 'bg-primary-600 text-white border-primary-600 ring-2 ring-primary-200' 
                                                            : 'bg-white hover:bg-slate-100 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {dificultad}: <span className="font-bold">{count}</span>
                                                </button>
                                            );
                                        })
                                     ) : (
                                         <span className="text-sm text-slate-500">Ninguno</span>
                                     )}
                                </div>
                                {activeFilter.type && (
                                    <button 
                                        onClick={() => setActiveFilter({ type: null, value: null })}
                                        className="text-sm text-red-600 font-semibold hover:underline flex items-center gap-1"
                                    >
                                        <XIcon className="w-4 h-4" />
                                        Limpiar filtro
                                    </button>
                                )}
                            </div>
                           {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredDishes.map(dish => (
                                        <DishCard 
                                            key={dish.id} 
                                            dish={dish} 
                                            onEdit={handleEditDish} 
                                            onDelete={handleDeleteDishFromList}
                                            onView={handleViewDish}
                                            isSelectionMode={isSelectionMode}
                                            isSelected={selectedDishes.has(dish.id)}
                                            onToggleSelection={handleToggleDishSelection}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {filteredDishes.map(dish => (
                                        <DishRow 
                                            key={dish.id} 
                                            dish={dish} 
                                            onEdit={handleEditDish} 
                                            onDelete={handleDeleteDishFromList}
                                            onView={handleViewDish}
                                            isSelectionMode={isSelectionMode}
                                            isSelected={selectedDishes.has(dish.id)}
                                            onToggleSelection={handleToggleDishSelection}
                                        />
                                    ))}
                                </div>
                            )}
                          <button onClick={handleAddNewDish} className="fixed bottom-8 right-8 bg-secondary-500 text-white p-4 rounded-full shadow-lg hover:bg-secondary-600 transition-transform hover:scale-110 z-20" aria-label="Añadir nuevo plato">
                             <PlusIcon className="w-7 h-7"/>
                          </button>
                      </div>
                  )}

                  {activeTab === 'saved' && (
                       <div>
                          <h2 className="text-2xl font-bold text-dark mb-4">Menús Guardados ({savedMenus.length})</h2>
                          {savedMenus.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                  {savedMenus.map(saved => (
                                      <div key={saved.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                                          <div className="flex-grow">
                                              <h4 className="font-bold text-slate-800 text-lg truncate">{saved.name}</h4>
                                              <p className="text-sm text-slate-600 mt-2 h-10 overflow-hidden text-ellipsis">
                                                  {saved.description || 'Sin descripción'}
                                              </p>
                                              <p className="text-sm text-slate-500 mt-2">
                                                  {new Date(saved.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                              </p>
                                              <p className="text-sm text-slate-500 mt-1">
                                                  Plan de {saved.menu.length} días
                                              </p>
                                          </div>
                                          <div className="flex items-center justify-end space-x-3 mt-4">
                                              <button onClick={() => handleLoadMenu(saved.id)} className="text-slate-400 hover:text-primary-600" aria-label={`Cargar ${saved.name}`}>
                                                  <FolderOpenIcon className="w-6 h-6" />
                                              </button>
                                              <button onClick={() => handleDeleteSavedMenu(saved.id)} className="text-slate-400 hover:text-red-500" aria-label={`Eliminar ${saved.name}`}>
                                                  <TrashIcon className="w-5 h-5" />
                                              </button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          ) : (
                              <div className="bg-slate-50 p-10 rounded-xl text-center text-slate-500 border-2 border-dashed">
                                  <h3 className="text-xl font-medium text-slate-700">No tienes menús guardados</h3>
                                  <p className="mt-2">Cuando generes un menú que te guste, ¡guárdalo aquí para más tarde!</p>
                                  </div>
                          )}
                      </div>
                  )}
                </div>
            </main>

            <DishFormModal 
                isOpen={isDishModalOpen}
                onClose={() => setIsDishModalOpen(false)}
                onSave={handleSaveDish}
                dishToEdit={dishToEdit}
                utensilsList={utensilsList}
                addUtensilToList={addUtensilToList}
            />
            <SaveMenuModal
                isOpen={isSaveMenuModalOpen}
                onClose={() => setIsSaveMenuModalOpen(false)}
                onSave={handleConfirmSaveMenu}
                defaultName={`Menú del ${new Date().toLocaleDateString()}`}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmationModal}
                onConfirm={handleConfirmDelete}
                title={getConfirmationModalContent().title}
                confirmButtonText="Eliminar"
            >
                {getConfirmationModalContent().body}
            </ConfirmationModal>
            <DishPickerModal 
                isOpen={isDishPickerOpen}
                onClose={() => { setIsDishPickerOpen(false); setDishPickerContext(null); }}
                onSelectDish={handleSelectDish}
                dishes={dishes}
                filterType={dishPickerContext?.filterType || 'plato_principal'}
                mealType={dishPickerContext?.mealType || 'comida'}
            />
            <DishViewModal
                dish={dishToView}
                onClose={() => setDishToView(null)}
                onEdit={(dish) => {
                    setDishToView(null);
                    handleEditDish(dish);
                }}
                onDelete={(id) => {
                    setDishToView(null);
                    handleDeleteDishFromList(id);
                }}
            />
        </div>
    );
};

export default App;