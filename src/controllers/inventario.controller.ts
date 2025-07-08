import { Request, Response } from "express";
import { InventarioModel } from "../models/inventario.model";

export const verInventario = async (_req: Request, res: Response) => {
    try {
        const inventario = await InventarioModel.obtenerTodo();
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener inventario", error });
    }
};