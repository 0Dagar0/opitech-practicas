import apiClient from './client';
import type { Category, Area } from '../types';
import { sortCategories } from '../utils/helpers';

/**
 * Obtiene la lista de categorías desde el backend.
 * Se devuelven ordenadas para presentación (Software, Hardware, Red, ...).
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/categories');
  return sortCategories(response.data);
};

/**
 * Obtiene la lista de áreas desde el backend
 */
export const getAreas = async (): Promise<Area[]> => {
  const response = await apiClient.get<Area[]>('/areas');
  return response.data;
};