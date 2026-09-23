import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Inicialización diferida para evitar lecturas innecesarias
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error al leer de localStorage', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      // Permite que value sea una función (igual que el setState normal)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error al guardar en localStorage', error);
    }
  };

  return [storedValue, setValue];
}
