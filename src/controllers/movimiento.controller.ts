import { Request, Response } from "express";
import { MovimientoModel } from "../models/movimiento.model";

export const registrarMovimiento = async (req: Request, res: Response) => {
    try {
        await MovimientoModel.crear(req.body);
        res.status(201).json({ mensaje: "Movimiento registrado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al registrar movimiento", error });
    }
};

export const listarMovimientos = async (_req: Request, res: Response) => {
    try {
        const movimientos = await MovimientoModel.listar();
        res.json(movimientos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al obtener movimientos", error });
    }
};
export const obtenerHistorialPorProducto = async (req: Request, res: Response) => {
  try {
    const idProducto = parseInt(req.params.id, 10);
    const historial = await MovimientoModel.findByIdProducto(idProducto);
    res.json(historial);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el historial del producto", error });
  }
};