import { Router } from 'express';
// --- CORRECCIÓN: Importar los controladores que faltan ---
import {
    listarProductos,
    crearProducto,
    obtenerProducto,
    actualizarProducto,
    eliminarProducto
} from '../controllers/productos.controller';

const router = Router();

// Rutas existentes
router.get('/', listarProductos);
router.post('/', crearProducto);

// --- CORRECCIÓN: Añadir las rutas que faltan para editar, eliminar y ver detalle ---
router.get('/:id', obtenerProducto);
router.put('/:id', actualizarProducto);
router.delete('/:id', eliminarProducto);

export default router;