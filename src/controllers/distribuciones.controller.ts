// En: src/controllers/distribuciones.controller.ts

import { Request, Response } from "express";
import { pool } from "../config/db";

// -----------------------------------------------------------------------------
// CREAR una nueva distribución (Versión Transaccional)
// -----------------------------------------------------------------------------
export const crearDistribucion = async (req: Request, res: Response) => {
    const { id_cliente, fecha_entrega, responsable, productos, estado } = req.body;
    const client = await pool.connect(); // Obtiene una conexión para la transacción

    try {
        await client.query('BEGIN'); // Inicia la transacción

        // 1. Inserta la cabecera
        const result = await client.query(
            `INSERT INTO distribuciones (id_cliente, fecha_entrega, responsable, estado) VALUES ($1, $2, $3, $4) RETURNING id_distribucion`,
            [id_cliente, fecha_entrega, responsable, estado]
        );
        const id_distribucion = result.rows[0].id_distribucion;

        // 2. Inserta los detalles y actualiza el inventario
        for (const producto of productos) {
            await client.query(
                `INSERT INTO detalle_distribuciones (id_distribucion, id_producto, cantidad) VALUES ($1, $2, $3)`,
                [id_distribucion, producto.id_producto, producto.cantidad]
            );

            // Si la distribución ya se crea como "Entregado", actualizamos el inventario inmediatamente
            if (estado === 'Entregado') {
                await client.query(
                    `UPDATE inventario SET stock_actual = stock_actual - $1 WHERE id_producto = $2`,
                    [producto.cantidad, producto.id_producto]
                );
                await client.query(
                    `INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo) VALUES ($1, 'Salida', $2, $3)`,
                    [producto.id_producto, producto.cantidad, `Distribución #${id_distribucion}`]
                );
            }
        }

        await client.query('COMMIT'); // Confirma todos los cambios si no hubo errores
        res.status(201).json({ mensaje: "Distribución registrada con éxito", id_distribucion });

    } catch (error) {
        await client.query('ROLLBACK'); // Deshace todos los cambios si hubo algún error
        console.error("Error en transacción de crear distribución:", error);
        res.status(500).json({ mensaje: "Error al registrar la distribución", error });
    } finally {
        client.release(); // Libera la conexión de vuelta al pool
    }
};

// -----------------------------------------------------------------------------
// LISTAR todas las distribuciones
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// VER DETALLE de una distribución
// -----------------------------------------------------------------------------
export const detalleDistribucion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cabeceraResult = await pool.query(
            `SELECT d.*, c.nombre AS cliente FROM distribuciones d JOIN clientes c ON d.id_cliente = c.id_cliente WHERE d.id_distribucion = $1`,
            [id]
        );

        if (cabeceraResult.rows.length === 0) {
            return res.status(404).json({ mensaje: "Distribución no encontrada." });
        }

        const detalleResult = await pool.query(
            `SELECT p.nombre AS producto, dd.cantidad FROM detalle_distribuciones dd JOIN productos p ON dd.id_producto = p.id_producto WHERE dd.id_distribucion = $1`,
            [id]
        );

        res.json({
            distribucion: cabeceraResult.rows[0],
            detalle: detalleResult.rows
        });
    } catch (error) {
        console.error("Error en detalleDistribucion:", error);
        res.status(500).json({ mensaje: "Error al obtener el detalle", error });
    }
};

// -----------------------------------------------------------------------------
// ELIMINAR una distribución
// -----------------------------------------------------------------------------
export const eliminarDistribucion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`DELETE FROM distribuciones WHERE id_distribucion = $1`, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: "Distribución no encontrada." });
        }
        res.status(200).json({ mensaje: "Distribución eliminada exitosamente" });
    } catch (error) {
        console.error("Error en eliminarDistribucion:", error);
        res.status(500).json({ mensaje: "Error interno del servidor", error });
    }
};

// -----------------------------------------------------------------------------
// ACTUALIZAR ESTADO de una distribución (también hecho transaccional)
// -----------------------------------------------------------------------------
export const actualizarEstadoDistribucion = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { estado } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(`UPDATE distribuciones SET estado = $1 WHERE id_distribucion = $2`, [estado, id]);

        if (estado === "Entregado") {
            const detalles = await client.query(`SELECT id_producto, cantidad FROM detalle_distribuciones WHERE id_distribucion = $1`, [id]);
            for (const detalle of detalles.rows) {
                // Lógica para actualizar inventario y registrar movimiento...
            }
        }
        // Aquí podrías añadir lógica para si se "devuelve" una distribución, para re-ingresar stock.

        await client.query('COMMIT');
        res.json({ mensaje: "Estado actualizado correctamente" });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al cambiar estado de distribución:", error);
        res.status(500).json({ mensaje: "Error al cambiar estado", error });
    } finally {
        client.release();
    }
};