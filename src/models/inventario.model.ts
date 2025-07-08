import { pool } from "../config/db";

interface ProductoCantidad {
    id_producto: number;
    cantidad: number;
}

export const InventarioModel = {
    obtenerTodo: async () => {
        const result = await pool.query(`
            SELECT 
                p.id_producto, 
                p.nombre, 
                COALESCE(i.stock_actual, 0) AS stock_actual, 
                i.ubicacion
            FROM 
                productos p
            LEFT JOIN 
                inventario i ON p.id_producto = i.id_producto
            ORDER BY
                p.nombre ASC
        `);
        return result.rows;
    },

    verificarStockSuficiente: async (productos: ProductoCantidad[]) => {
        for (const producto of productos) {
            const res = await pool.query(
                `SELECT stock_actual FROM inventario WHERE id_producto = $1`,
                [producto.id_producto]
            );

            const stock_actual = res.rows[0]?.stock_actual || 0;
            if (stock_actual < producto.cantidad) {
                throw new Error(`Stock insuficiente para el producto ID ${producto.id_producto}. Solicitado: ${producto.cantidad}, Disponible: ${stock_actual}`);
            }
        }
        return true;
    }
};