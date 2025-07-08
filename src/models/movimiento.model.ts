 
import { pool } from "../config/db";

interface Movimiento {
    id_producto: number;
    tipo: 'Entrada' | 'Salida' | 'Ajuste';
    cantidad: number;
    motivo: string;
}

export const MovimientoModel = {
    crear: async (movimiento: Movimiento) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Insertar el movimiento en el historial
            await client.query(
                `INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo) VALUES ($1, $2, $3, $4)`,
                [movimiento.id_producto, movimiento.tipo, movimiento.cantidad, movimiento.motivo]
            );

            // 2. Actualizar el stock en la tabla de inventario
            if (movimiento.tipo === 'Entrada') {
                await client.query(
                    `INSERT INTO inventario (id_producto, stock_actual) VALUES ($1, $2)
                     ON CONFLICT (id_producto) DO UPDATE SET stock_actual = inventario.stock_actual + $2;`,
                    [movimiento.id_producto, movimiento.cantidad]
                );
            } else if (movimiento.tipo === 'Salida') {
                await client.query(
                    `UPDATE inventario SET stock_actual = stock_actual - $1 WHERE id_producto = $2`,
                    [movimiento.cantidad, movimiento.id_producto]
                );
            }
            // Nota: El tipo 'Ajuste' se maneja mejor con una lógica separada si es para establecer un valor fijo.

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    listar: async () => {
        const result = await pool.query(`
            SELECT m.id_movimiento, p.nombre, m.tipo, m.cantidad, m.fecha, m.motivo
            FROM movimientos_inventario m
            JOIN productos p ON p.id_producto = m.id_producto
            ORDER BY m.fecha DESC
        `);
        return result.rows;
    }
};