import type { Category } from '../types';

/**
 * Orden funcional en el que se presentan las categorías (especialidades).
 * El backend las devuelve alfabéticamente; aquí se fija un orden más natural
 * para el usuario: Software, Hardware, Red, Infraestructura y Otro.
 */
const CATEGORY_DISPLAY_ORDER = [
    'Software',
    'Hardware',
    'Red',
    'Infraestructura / Instalaciones',
    'Otro',
];

const normalize = (value: string) => value.trim().toLowerCase();

/**
 * Devuelve una copia ordenada de las categorías:
 * primero el orden funcional definido y, al final, las que no estén en la lista
 * (ordenadas alfabéticamente para que el resultado sea estable).
 */
export const sortCategories = (categories: Category[]): Category[] => {
    const rank = (name: string) => {
        const index = CATEGORY_DISPLAY_ORDER.findIndex(
            (item) => normalize(item) === normalize(name)
        );
        return index === -1 ? CATEGORY_DISPLAY_ORDER.length : index;
    };

    return [...categories].sort((a, b) => {
        const rankDifference = rank(a.name) - rank(b.name);
        if (rankDifference !== 0) return rankDifference;
        return a.name.localeCompare(b.name, 'es');
    });
};
