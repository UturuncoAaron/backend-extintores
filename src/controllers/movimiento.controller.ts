import { Request, Response } from "express";
import { pool } from "../config/db";

// Registrar movimiento (entrada, salida, ajuste)
export const registrarMovimiento = async (req: Request, res: Response) => {
    try {
        const { id_producto, tipo, cantidad, motivo } = req.body;

        // Insertar el movimiento
        await pool.query(
            `INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo)
       VALUES ($1, $2, $3, $4)`,
            [id_producto, tipo, cantidad, motivo]
        );

        // Actualizar el stock
        let operacion = "";
        if (tipo === "Entrada") operacion = "+";
        else if (tipo === "Salida") operacion = "-";

        if (operacion) {
            const result = await pool.query(
                `SELECT * FROM inventario WHERE id_producto = $1`,
                [id_producto]
            );

            if (result.rows.length === 0) {
                // No existe en inventario, insertar
                const stockInicial = tipo === "Entrada" ? cantidad : 0;
                await pool.query(
                    `INSERT INTO inventario (id_producto, stock_actual) VALUES ($1, $2)`,
                    [id_producto, stockInicial]
                );
            } else {
                // Ya existe, actualizar
                await pool.query(`
                        UPDATE inventario
                        SET stock_actual = stock_actual ${operacion} $1
                        WHERE id_producto = $2
                        `, [cantidad, id_producto]);
            }
        }


        res.json({ mensaje: "Movimiento registrado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar movimiento", error });
    }
};

// Listar historial de movimientos
export const listarMovimientos = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT m.id_movimiento, p.nombre, m.tipo, m.cantidad, m.fecha, m.motivo
      FROM movimientos_inventario m
      JOIN productos p ON p.id_producto = m.id_producto
      ORDER BY m.fecha DESC
    `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener movimientos", error });
    }
};
