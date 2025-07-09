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
            p.tipo,                 -- Campo añadido
            p.categoria,            -- Campo añadido
            p.estado,               -- Campo añadido
            p.precio_unitario,      -- Campo añadido
            p.stock_minimo,         -- Campo añadido
            i.ubicacion,
            COALESCE(i.stock_actual, 0) AS stock_actual,
            -- Este es el campo calculado para el estado del stock
            CASE
                WHEN COALESCE(i.stock_actual, 0) <= 0 THEN 'Agotado'
                WHEN COALESCE(i.stock_actual, 0) <= p.stock_minimo THEN 'Stock Bajo'
                ELSE 'En Stock'
            END AS estado_stock
        FROM 
            productos p
        LEFT JOIN 
            inventario i ON p.id_producto = i.id_producto
        ORDER BY
            p.nombre ASC
    `);
        return result.rows;
    },
    // Dentro de tu InventarioModel

    verificarStockSuficiente: async (productos: ProductoCantidad[]) => {
        // 1. Obtenemos solo los IDs de los productos que queremos verificar.
        const idsDeProductos = productos.map(p => p.id_producto);

        // 2. Hacemos UNA SOLA consulta para traer el stock de todos esos productos.
        const query = `
        SELECT id_producto, stock_actual 
        FROM inventario 
        WHERE id_producto = ANY($1::int[])
    `;
        const res = await pool.query(query, [idsDeProductos]);

        // 3. Creamos un mapa para buscar el stock de cada producto fácilmente (id => stock).
        const stockMap = new Map<number, number>();
        res.rows.forEach(row => {
            stockMap.set(row.id_producto, row.stock_actual);
        });

        // 4. Ahora verificamos la disponibilidad usando el mapa (sin más consultas a la BD).
        for (const producto of productos) {
            const stock_actual = stockMap.get(producto.id_producto) || 0;
            if (stock_actual < producto.cantidad) {
                // Lanzas el error si un producto no tiene stock suficiente.
                throw new Error(`Stock insuficiente para el producto ID ${producto.id_producto}. Solicitado: ${producto.cantidad}, Disponible: ${stock_actual}`);
            }
        }

        return true; // Si el loop termina sin errores, hay stock suficiente.
    }
};