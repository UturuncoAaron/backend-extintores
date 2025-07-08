import { Request, Response } from "express";
import { CompraModel } from "../models/compra.model";

export const crearCompra = async (req: Request, res: Response) => {
    try {
        const { id_compra } = await CompraModel.crear(req.body);
        res.status(201).json({ mensaje: "Compra registrada exitosamente", id_compra });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al registrar compra", error });
    }
};

export const listarCompras = async (_req: Request, res: Response) => {
    try {
        const compras = await CompraModel.listar();
        res.json(compras);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener compras", error });
    }
};

export const detalleCompra = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = await CompraModel.obtenerPorId(id);
        if (!data.compra) {
            return res.status(404).json({ mensaje: "Compra no encontrada" });
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener detalle de la compra", error });
    }
};

export const editarCompra = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await CompraModel.actualizar(id, req.body);
        res.json({ mensaje: "Compra actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al editar la compra", error });
    }
};

export const actualizarEstadoCompra = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { estado } = req.body;
        await CompraModel.actualizarEstado(id, estado);
        res.json({ mensaje: "Estado de la compra actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al cambiar estado de la compra", error });
    }
};

export const eliminarCompra = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await CompraModel.eliminar(id);
        res.json({ mensaje: "Compra eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la compra", error });
    }
};