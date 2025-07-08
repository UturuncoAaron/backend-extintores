import { pool } from "../config/db";

interface ProductoDetalle {
    id_producto: number;
    cantidad: number;
}

interface Distribucion {
    id_cliente: number;
    fecha_entrega: string;
    responsable: string;
    estado: string;
    productos: ProductoDetalle[];
}

export const DistribucionModel = {
    crear: async (distribucion: Distribucion) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await client.query(
                `INSERT INTO distribuciones (id_cliente, fecha_entrega, responsable, estado) VALUES ($1, $2, $3, $4) RETURNING id_distribucion`,
                [distribucion.id_cliente, distribucion.fecha_entrega, distribucion.responsable, distribucion.estado]
            );
            const id_distribucion = result.rows[0].id_distribucion;

            for (const producto of distribucion.productos) {
                await client.query(
                    `INSERT INTO detalle_distribuciones (id_distribucion, id_producto, cantidad) VALUES ($1, $2, $3)`,
                    [id_distribucion, producto.id_producto, producto.cantidad]
                );
            }

            await client.query('COMMIT');
            return { id_distribucion };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    listar: async () => {
        const result = await pool.query(`
            SELECT d.id_distribucion, c.nombre AS cliente, d.fecha_entrega, d.estado, d.responsable
            FROM distribuciones d
            JOIN clientes c ON c.id_cliente = d.id_cliente
            ORDER BY d.fecha_entrega DESC
        `);
        return result.rows;
    },

    obtenerPorId: async (id: number) => {
        const cabeceraQuery = pool.query(
            `SELECT d.*, c.nombre AS cliente FROM distribuciones d JOIN clientes c ON d.id_cliente = c.id_cliente WHERE d.id_distribucion = $1`, [id]
        );
        const detalleQuery = pool.query(
            `SELECT p.nombre AS producto, dd.cantidad, p.id_producto FROM detalle_distribuciones dd JOIN productos p ON dd.id_producto = p.id_producto WHERE dd.id_distribucion = $1`, [id]
        );
        const [cabeceraResult, detalleResult] = await Promise.all([cabeceraQuery, detalleQuery]);
        return {
            distribucion: cabeceraResult.rows[0],
            detalle: detalleResult.rows
        };
    },

    actualizar: async (id: number, distribucion: Partial<Distribucion>) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                `UPDATE distribuciones SET id_cliente = $1, fecha_entrega = $2, responsable = $3 WHERE id_distribucion = $4`,
                [distribucion.id_cliente, distribucion.fecha_entrega, distribucion.responsable, id]
            );
            await client.query(`DELETE FROM detalle_distribuciones WHERE id_distribucion = $1`, [id]);

            if(distribucion.productos){
                for (const producto of distribucion.productos) {
                    await client.query(
                        `INSERT INTO detalle_distribuciones (id_distribucion, id_producto, cantidad) VALUES ($1, $2, $3)`,
                        [id, producto.id_producto, producto.cantidad]
                    );
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    actualizarEstado: async (id: number, estado: string) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`UPDATE distribuciones SET estado = $1 WHERE id_distribucion = $2`, [estado, id]);

            if (estado === "Entregado") {
                const detalles = await client.query(`SELECT id_producto, cantidad FROM detalle_distribuciones WHERE id_distribucion = $1`, [id]);
                for (const detalle of detalles.rows) {
                    await client.query(
                        `UPDATE inventario SET stock_actual = stock_actual - $1 WHERE id_producto = $2`,
                        [detalle.cantidad, detalle.id_producto]
                    );
                    await client.query(
                        `INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo) VALUES ($1, 'Salida', $2, $3)`,
                        [detalle.id_producto, detalle.cantidad, `Distribución #${id}`]
                    );
                }
            }
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    eliminar: async (id: number) => {
        return await pool.query(`DELETE FROM distribuciones WHERE id_distribucion = $1`, [id]);
    }
};