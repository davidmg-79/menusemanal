import { ShoppingListItem } from '../types';

export type GroupedShoppingList = Record<string, ShoppingListItem[]>;

// A simple categorization based on keywords in the ingredient name.
const INGREDIENT_CATEGORIES: Record<string, string[]> = {
  'Frutas y Verduras': ['patata', 'cebolla', 'tomate', 'pimiento', 'pepino', 'ajo', 'zanahoria', 'guisante', 'limón', 'calabaza', 'puerro', 'cilantro', 'perejil', 'aguacate', 'piña', 'membrillo'],
  'Carne': ['pollo', 'gallina', 'chorizo', 'lomo', 'ternera'],
  'Pescado y Marisco': ['corvina', 'merluza', 'atún', 'pescado'],
  'Lácteos y Huevos': ['huevo', 'leche', 'queso', 'nata', 'mayonesa'],
  'Panadería y Repostería': ['pan', 'harina', 'azúcar', 'vainilla', 'galleta'],
  'Despensa y Secos': ['aceite', 'sal', 'lenteja', 'arroz', 'pimienta', 'vinagre', 'pimentón', 'tomillo', 'nuez', 'maíz', 'caldo', 'aceituna', 'soja'],
  'Bebidas': ['vino', 'cerveza'],
};

const DEFAULT_CATEGORY = 'Otros';

const categorizeIngredient = (name: string): string => {
  const lowerName = name.toLowerCase();
  for (const category in INGREDIENT_CATEGORIES) {
    if (INGREDIENT_CATEGORIES[category].some(keyword => lowerName.includes(keyword))) {
      return category;
    }
  }
  return DEFAULT_CATEGORY;
};

export const groupShoppingList = (list: ShoppingListItem[]): GroupedShoppingList => {
  const grouped = list.reduce((acc, item) => {
    const category = categorizeIngredient(item.nombre);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as GroupedShoppingList);

  // Sort categories alphabetically, but keep 'Otros' at the end
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
      if (a === DEFAULT_CATEGORY) return 1;
      if (b === DEFAULT_CATEGORY) return -1;
      return a.localeCompare(b);
  });

  const sortedGroupedList: GroupedShoppingList = {};
  sortedCategories.forEach(category => {
      sortedGroupedList[category] = grouped[category];
  });

  return sortedGroupedList;
};

const formatListToString = (groupedList: GroupedShoppingList, formatter: (item: ShoppingListItem) => string): string => {
    return Object.entries(groupedList)
        .map(([category, items]) => {
            const itemLines = items.map(formatter).join('\n');
            return `## ${category}\n${itemLines}`;
        })
        .join('\n\n');
};

export const formatAsText = (groupedList: GroupedShoppingList): string => {
    return formatListToString(groupedList, item => `- ${item.nombre} (${item.cantidad} ${item.unidad})`);
};

export const formatAsMarkdown = (groupedList: GroupedShoppingList): string => {
    return "# Lista de la Compra\n\n" + formatListToString(groupedList, item => `- [${item.checked ? 'x' : ' '}] ${item.nombre} (${item.cantidad} ${item.unidad})`);
};


export const getShoppingListHTML = (groupedList: GroupedShoppingList): string => {
    const listContent = Object.entries(groupedList).map(([category, items]) => {
        const itemsHTML = items.map((item, index) => {
            const uniqueId = `item-${category.replace(/\s/g, '-')}-${index}`;
            return `
                <li class="flex items-center p-2 rounded-lg transition-colors ${item.checked ? 'bg-green-50' : 'hover:bg-slate-50'}" onclick="toggleCheck(this, '${uniqueId}')">
                    <input 
                        type="checkbox" 
                        id="${uniqueId}" 
                        class="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 mr-4 shrink-0 cursor-pointer" 
                        ${item.checked ? 'checked' : ''}
                        onchange="event.stopPropagation();"
                    >
                    <label for="${uniqueId}" class="flex-grow flex justify-between items-center cursor-pointer">
                        <span class="text-slate-700 capitalize ${item.checked ? 'text-slate-400 line-through' : ''}">${item.nombre}</span>
                        <span class="font-medium text-slate-600 ${item.checked ? 'text-slate-400' : ''}">${item.cantidad} ${item.unidad}</span>
                    </label>
                </li>
            `;
        }).join('');

        return `
            <div class="mb-6">
                <h2 class="text-xl font-bold text-primary-700 border-b-2 border-primary-200 pb-2 mb-3">${category}</h2>
                <ul class="space-y-1">${itemsHTML}</ul>
            </div>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Lista de la Compra</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <script>
              tailwind.config = {
                theme: {
                  extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: { 
                        'primary': { '200': '#c7d2fe', '600': '#4f46e5', '700': '#4338ca' },
                        'green': { '50': '#f0fdf4' },
                        'slate': {
                            '50': '#f8fafc',
                            '100': '#f1f5f9',
                            '300': '#cbd5e1', 
                            '400': '#94a3b8',
                            '600': '#475569',
                            '700': '#334155',
                            '800': '#1e293b'
                        }
                    }
                  }
                }
              }
            </script>
        </head>
        <body class="bg-slate-50 text-slate-800 font-sans p-4 sm:p-6 md:p-8">
            <div class="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                <h1 class="text-3xl font-bold mb-8 text-slate-800 border-b pb-4">Lista de la Compra</h1>
                ${listContent}
            </div>
            <script>
                function toggleCheck(listItem, checkboxId) {
                    const checkbox = document.getElementById(checkboxId);
                    if (!checkbox) return;

                    // If the click was not directly on the checkbox, toggle its state
                    if (event.target.type !== 'checkbox') {
                        checkbox.checked = !checkbox.checked;
                    }

                    const isChecked = checkbox.checked;
                    const labelSpans = listItem.querySelectorAll('label span');

                    if (isChecked) {
                        listItem.classList.add('bg-green-50');
                        listItem.classList.remove('hover:bg-slate-50');
                        labelSpans.forEach(span => {
                           span.classList.add('text-slate-400');
                           if (span.classList.contains('capitalize')) {
                               span.classList.add('line-through');
                           }
                        });
                    } else {
                        listItem.classList.remove('bg-green-50');
                        listItem.classList.add('hover:bg-slate-50');
                        labelSpans.forEach(span => {
                           span.classList.remove('text-slate-400', 'line-through');
                        });
                    }
                }
            </script>
        </body>
        </html>
    `;
};
