import { Request, Response } from "express";
import { pool } from "../config/db";

// Crear nueva distribución
export const crearDistribucion = async (req: Request, res: Response) => {
    try {
        const { id_cliente, fecha_entrega, responsable } = req.body;

        const result = await pool.query(
            `INSERT INTO distribuciones (id_cliente, fecha_entrega, responsable)
       VALUES ($1, $2, $3) RETURNING id_distribucion`,
            [id_cliente, fecha_entrega, responsable]
        );

        res.status(201).json({ mensaje: "Distribución registrada", id_distribucion: result.rows[0].id_distribucion });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar distribución", error });
    }
};

// Agregar productos a una distribución
export const agregarDetalleDistribucion = async (req: Request, res: Response) => {
    try {
        const { id_distribucion, id_producto, cantidad } = req.body;

        await pool.query(
            `INSERT INTO detalle_distribuciones (id_distribucion, id_producto, cantidad)
       VALUES ($1, $2, $3)`,
            [id_distribucion, id_producto, cantidad]
        );

        res.json({ mensaje: "Producto agregado a la distribución" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al agregar producto", error });
    }
};

// Listar todas las distribuciones
export const listarDistribuciones = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT d.id_distribucion, c.nombre AS cliente, d.fecha_entrega, d.estado, d.responsable
      FROM distribuciones d
      JOIN clientes c ON c.id_cliente = d.id_cliente
      ORDER BY d.fecha_entrega DESC
    `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar distribuciones", error });
    }
};

// Ver detalle de una distribución
export const detalleDistribucion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
      SELECT p.nombre, dd.cantidad
      FROM detalle_distribuciones dd
      JOIN productos p ON p.id_producto = dd.id_producto
      WHERE dd.id_distribucion = $1
    `, [id]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener detalle", error });
    }
};

// Cambiar estado de una distribución
export const actualizarEstadoDistribucion = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { estado } = req.body;

    try {
        // 1. Actualizar el estado de la distribución
        await pool.query(
            `UPDATE distribuciones SET estado = $1 WHERE id_distribucion = $2`,
            [estado, id]
        );

        // 2. Si el nuevo estado es "Entregado", registrar movimientos
        if (estado === "Entregado") {
            // Traer el detalle de productos de esta distribución
            const detalles = await pool.query(`
        SELECT id_producto, cantidad FROM detalle_distribuciones
        WHERE id_distribucion = $1
      `, [id]);

            for (const detalle of detalles.rows) {
                const { id_producto, cantidad } = detalle;

                // Registrar el movimiento como salida
                await pool.query(`
          INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo)
          VALUES ($1, 'Salida', $2, 'Distribución al cliente')
        `, [id_producto, cantidad]);

                // Actualizar el stock
                await pool.query(`
          UPDATE inventario
          SET stock_actual = stock_actual - $1
          WHERE id_producto = $2
        `, [cantidad, id_producto]);
            }
        }

        res.json({ mensaje: "Estado actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al actualizar la distribución", error });
    }
};