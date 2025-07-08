import { pool } from "../config/db";

interface ProductoDetalle {
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
}

interface Compra {
    id_proveedor: number;
    fecha_compra: string;
    productos: ProductoDetalle[];
}

export const CompraModel = {
    crear: async (compra: Compra) => {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const result = await client.query(
                `INSERT INTO compras (id_proveedor, fecha_compra) VALUES ($1, $2) RETURNING id_compra`,
                [compra.id_proveedor, compra.fecha_compra]
            );
            const id_compra = result.rows[0].id_compra;

            let totalCompra = 0;
            for (const item of compra.productos) {
                const subtotal = item.cantidad * item.precio_unitario;
                totalCompra += subtotal;
                await client.query(
                    `INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)`,
                    [id_compra, item.id_producto, item.cantidad, item.precio_unitario]
                );
            }

            await client.query(`UPDATE compras SET total = $1 WHERE id_compra = $2`, [totalCompra, id_compra]);
            await client.query('COMMIT');
            return { id_compra };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    listar: async () => {
        const query = `
            SELECT c.id_compra, c.fecha_compra, c.estado, c.total, p.nombre AS proveedor
            FROM compras c
            JOIN proveedores p ON p.id_proveedor = c.id_proveedor
            ORDER BY c.fecha_compra DESC`;
        const result = await pool.query(query);
        return result.rows;
    },

    obtenerPorId: async (id: number) => {
        const cabeceraQuery = pool.query(
            `SELECT c.*, p.nombre AS proveedor FROM compras c JOIN proveedores p ON p.id_proveedor = c.id_proveedor WHERE c.id_compra = $1`,
            [id]
        );
        const detalleQuery = pool.query(
            `SELECT dc.*, pr.nombre AS producto FROM detalle_compras dc JOIN productos pr ON pr.id_producto = dc.id_producto WHERE dc.id_compra = $1`,
            [id]
        );

        const [cabeceraResult, detalleResult] = await Promise.all([cabeceraQuery, detalleQuery]);

        return {
            compra: cabeceraResult.rows[0],
            detalle: detalleResult.rows
        };
    },
    
    actualizar: async (id: number, datos: { fecha_compra: string, id_proveedor: number }) => {
        const { fecha_compra, id_proveedor } = datos;
        return await pool.query(
            `UPDATE compras SET fecha_compra = $1, id_proveedor = $2 WHERE id_compra = $3`,
            [fecha_compra, id_proveedor, id]
        );
    },

    // En src/models/compra.model.ts

actualizarEstado: async (id: number, estado: string) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log(`MODELO: Actualizando estado de la compra ${id} a: '${estado}'`); // <--- AÑADE ESTO

        await client.query(`UPDATE compras SET estado = $1 WHERE id_compra = $2`, [estado, id]);

        if (estado === "Recibida") {
            console.log("MODELO: El estado es 'Recibida'. Procediendo a actualizar inventario."); // <--- AÑADE ESTO

            const resProductos = await client.query(
                `SELECT id_producto, cantidad FROM detalle_compras WHERE id_compra = $1`,
                [id]
            );

            console.log(`MODELO: Se encontraron ${resProductos.rows.length} productos en la compra.`); // <--- AÑADE ESTO

            for (const producto of resProductos.rows) {
                console.log(`MODELO: Actualizando producto ID ${producto.id_producto}, cantidad ${producto.cantidad}`); // <--- AÑADE ESTO
                // ... (el resto del código sigue igual)
                await client.query(`
                    INSERT INTO inventario (id_producto, stock_actual)
                    VALUES ($1, $2)
                    ON CONFLICT (id_producto)
                    DO UPDATE SET stock_actual = inventario.stock_actual + $2;
                `, [producto.id_producto, producto.cantidad]);

                await client.query(
                    `INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo) VALUES ($1, 'Entrada', $2, 'Compra recibida')`,
                    [producto.id_producto, producto.cantidad]
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
        return await pool.query(`DELETE FROM compras WHERE id_compra = $1`, [id]);
    }
};