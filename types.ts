// Fix: Replaced entire file content to define and export all necessary types.
// This resolves the circular dependency and missing export errors.

import { ALLERGEN_NAMES } from './components/allergenData';

export const TIPOS_PLATO = ['plato_entrante', 'plato_principal', 'plato_unico', 'postre'] as const;
export type TipoPlato = typeof TIPOS_PLATO[number];

export const VALIDO_PARA_OPTIONS = ['comida', 'cena'] as const;
export type ValidoPara = typeof VALIDO_PARA_OPTIONS[number];

export const DIFICULTAD_OPTIONS = ['Fácil', 'Media', 'Difícil'] as const;
export type Dificultad = typeof DIFICULTAD_OPTIONS[number];

export type InstructionMode = 'texto' | 'pasos';

export interface Instrucciones {
  modo: InstructionMode;
  contenido: string | string[];
}

export interface Ingrediente {
  nombre: string;
  cantidad: number;
  unidad: string;
  categoria_ingrediente: string;
  opcional: boolean;
}

export type AllergenName = typeof ALLERGEN_NAMES[number];

export interface Plato {
  id: string;
  nombre: string;
  pais: string;
  raciones: number;
  tiempo_preparacion: number;
  dificultad: Dificultad;
  tipo_plato: TipoPlato;
  valido_para: ValidoPara[];
  ingredientes: Ingrediente[];
  receta_url: string;
  instrucciones: Instrucciones;
  alergenos?: AllergenName[];
  utensilios?: string[];
  sugerencias?: string;
}

export interface ComidaCena {
  plato1: Plato;
  plato2?: Plato;
}

export interface MenuDia {
  dia: number;
  fecha: string;
  comida: ComidaCena | null;
  cena: ComidaCena | null;
}

export interface ShoppingListItem {
  nombre: string;
  cantidad: number;
  unidad: string;
  checked: boolean;
}

export interface SavedMenu {
  id: string;
  name: string;
  description: string;
  menu: MenuDia[];
  shoppingList: ShoppingListItem[];
  createdAt: string;
}
