import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

export function useDataStore() {
  const [clientes, setClientes] = useLocalStorage('wp_clientes', []);
  const [precios, setPrecios] = useLocalStorage('wp_precios', []);
  const [presupuestos, setPresupuestos] = useLocalStorage('wp_presupuestos', []);

  // Clientes
  const addCliente = (cliente) => {
    const newCliente = { ...cliente, id: uuidv4() };
    setClientes((prev) => [...prev, newCliente]);
    return newCliente;
  };

  const updateCliente = (id, data) => {
    setClientes((prev) => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCliente = (id) => {
    setClientes((prev) => prev.filter(c => c.id !== id));
  };

  const getClienteById = (id) => clientes.find(c => c.id === id);

  // Precios Inteligentes
  const savePrecio = (concepto) => {
    setPrecios((prev) => {
      const exists = prev.find(p => p.descripcion.toLowerCase() === concepto.descripcion.toLowerCase());
      if (exists) {
        return prev.map(p => p.id === exists.id ? { ...p, ...concepto } : p);
      }
      return [...prev, { ...concepto, id: uuidv4() }];
    });
  };

  const deletePrecio = (id) => {
    setPrecios((prev) => prev.filter(p => p.id !== id));
  };

  // Presupuestos
  const getNextNumeroPresupuesto = () => {
    if (presupuestos.length === 0) return '#0001';
    const nums = presupuestos.map(p => parseInt(p.numero.replace('#', ''), 10)).filter(n => !isNaN(n));
    if (nums.length === 0) return '#0001';
    const max = Math.max(...nums);
    return `#${String(max + 1).padStart(4, '0')}`;
  };

  const savePresupuesto = (presupuesto) => {
    const isNew = !presupuesto.id;
    const saveable = {
      ...presupuesto,
      id: isNew ? uuidv4() : presupuesto.id,
      numero: isNew ? getNextNumeroPresupuesto() : presupuesto.numero,
      fecha: isNew ? new Date().toISOString() : presupuesto.fecha,
      estado: presupuesto.estado || 'Enviado'
    };

    if (isNew) {
      setPresupuestos((prev) => [...prev, saveable]);
    } else {
      setPresupuestos((prev) => prev.map(p => p.id === saveable.id ? saveable : p));
    }
    return saveable;
  };

  const deletePresupuesto = (id) => {
    setPresupuestos((prev) => prev.filter(p => p.id !== id));
  };

  const duplicarPresupuesto = (id) => {
    const original = presupuestos.find(p => p.id === id);
    if (!original) return null;
    const duplicado = {
      ...original,
      id: uuidv4(),
      numero: getNextNumeroPresupuesto(),
      fecha: new Date().toISOString(),
      estado: 'Borrador'
    };
    setPresupuestos((prev) => [duplicado, ...prev]);
    return duplicado;
  };

  const getPresupuestoById = (id) => presupuestos.find(p => p.id === id);

  return {
    clientes, addCliente, updateCliente, deleteCliente, getClienteById,
    precios, savePrecio, deletePrecio,
    presupuestos, savePresupuesto, deletePresupuesto, duplicarPresupuesto, getPresupuestoById, getNextNumeroPresupuesto
  };
}
