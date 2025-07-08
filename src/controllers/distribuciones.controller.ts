import { Request, Response } from "express";
import { DistribucionModel } from "../models/distribucion.model";
import { InventarioModel } from "../models/inventario.model";

export const crearDistribucion = async (req: Request, res: Response) => {
    try {
        await InventarioModel.verificarStockSuficiente(req.body.productos);
        const { id_distribucion } = await DistribucionModel.crear(req.body);
        res.status(201).json({ mensaje: "Distribución registrada con éxito", id_distribucion });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ mensaje: error.message || "Error al registrar la distribución" });
    }
};

export const listarDistribuciones = async (_req: Request, res: Response) => {
    try {
        const distribuciones = await DistribucionModel.listar();
        res.json(distribuciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al listar distribuciones", error });
    }
};

export const detalleDistribucion = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const data = await DistribucionModel.obtenerPorId(id);
        if (!data.distribucion) {
            return res.status(404).json({ mensaje: "Distribución no encontrada." });
        }
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener el detalle", error });
    }
};

export const editarDistribucion = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        await InventarioModel.verificarStockSuficiente(req.body.productos);
        await DistribucionModel.actualizar(id, req.body);
        res.status(200).json({ mensaje: "Distribución actualizada correctamente" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ mensaje: error.message || "Error al actualizar la distribución" });
    }
};

export const actualizarEstadoDistribucion = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { estado } = req.body;

        if (estado === 'Entregado') {
            const data = await DistribucionModel.obtenerPorId(id);
            await InventarioModel.verificarStockSuficiente(data.detalle);
        }

        await DistribucionModel.actualizarEstado(id, estado);
        res.json({ mensaje: "Estado actualizado correctamente" });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ mensaje: error.message || "Error al cambiar estado" });
    }
};

export const eliminarDistribucion = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const result = await DistribucionModel.eliminar(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: "Distribución no encontrada." });
        }
        res.status(200).json({ mensaje: "Distribución eliminada exitosamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al eliminar la distribución", error });
    }
};