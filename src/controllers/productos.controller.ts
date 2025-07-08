import { Request, Response } from 'express';
import * as ProductoModel from '../models/productos.model'; // Importamos el modelo

// CREATE: Controlador para crear un nuevo producto
export const crearProducto = async (req: Request, res: Response): Promise<void> => {
    try {
        const nuevoProducto = await ProductoModel.create(req.body);
        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear el producto' });
    }
};

// READ ALL: Controlador para listar todos los productos
export const listarProductos = async (_req: Request, res: Response): Promise<void> => {
    try {
        const productos = await ProductoModel.findAll();
        res.status(200).json(productos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener productos' });
    }
};

// READ ONE: Controlador para obtener un producto por ID
export const obtenerProducto = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const producto = await ProductoModel.findById(id);

        if (!producto) {
            res.status(404).json({ mensaje: 'Producto no encontrado' });
        } else {
            res.status(200).json(producto);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el producto' });
    }
};

// UPDATE: Controlador para actualizar un producto
export const actualizarProducto = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const productoActualizado = await ProductoModel.update(id, req.body);

        if (!productoActualizado) {
            res.status(404).json({ mensaje: 'Producto no encontrado' });
        } else {
            res.status(200).json(productoActualizado);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el producto' });
    }
};

// DELETE: Controlador para eliminar un producto
export const eliminarProducto = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id, 10);
        const productoEliminado = await ProductoModel.remove(id);

        if (!productoEliminado) {
            res.status(404).json({ mensaje: 'Producto no encontrado' });
        } else {
            // 204 No Content es una respuesta estándar para eliminaciones exitosas
            res.status(204).send();
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el producto' });
    }
};