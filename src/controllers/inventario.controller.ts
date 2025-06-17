import { Request, Response } from "express";
import {pool} from "../config/db";

// Ver inventario actual
export const verInventario = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT i.id_inventario, p.nombre, i.stock_actual, i.ubicacion
      FROM inventario i
      JOIN productos p ON p.id_producto = i.id_producto
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener inventario", error });
  }
};
