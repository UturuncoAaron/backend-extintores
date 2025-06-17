import { Request, Response } from "express";
import { pool } from "../config/db";

// Crear una nueva compra
export const crearCompra = async (req: Request, res: Response) => {
    try {
        const { id_proveedor, fecha_compra, productos } = req.body;

        const result = await pool.query(
            `INSERT INTO compras (id_proveedor, fecha_compra) VALUES ($1, $2) RETURNING id_compra`,
            [id_proveedor, fecha_compra]
        );
        const id_compra = result.rows[0].id_compra;

        let totalCompra = 0;

        for (const item of productos) {
            const subtotal = item.cantidad * item.precio_unitario;
            totalCompra += subtotal;

            await pool.query(
                `INSERT INTO detalle_compras (id_compra, id_producto, cantidad, precio_unitario)
         VALUES ($1, $2, $3, $4)`,
                [id_compra, item.id_producto, item.cantidad, item.precio_unitario]
            );

            const existe = await pool.query(`SELECT * FROM inventario WHERE id_producto = $1`, [item.id_producto]);

            if (existe.rows.length > 0) {
                await pool.query(
                    `UPDATE inventario SET stock_actual = stock_actual + $1 WHERE id_producto = $2`,
                    [item.cantidad, item.id_producto]
                );
            } else {
                await pool.query(
                    `INSERT INTO inventario (id_producto, stock_actual) VALUES ($1, $2)`,
                    [item.id_producto, item.cantidad]
                );
            }
        }

        // Actualizar total de la compra
        await pool.query(`UPDATE compras SET total = $1 WHERE id_compra = $2`, [totalCompra, id_compra]);

        res.json({ mensaje: "Compra registrada exitosamente", id_compra });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar compra", error });
    }
};

// Listar todas las compras
export const listarCompras = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT c.id_compra, c.fecha_compra, c.estado, c.total, p.nombre AS proveedor
      FROM compras c
      JOIN proveedores p ON p.id_proveedor = c.id_proveedor
      ORDER BY c.fecha_compra DESC
    `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener compras", error });
    }
};

// Ver detalle de una compra
export const detalleCompra = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const cabecera = await pool.query(`
      SELECT c.*, p.nombre AS proveedor
      FROM compras c
      JOIN proveedores p ON p.id_proveedor = c.id_proveedor
      WHERE c.id_compra = $1
    `, [id]);

        const detalle = await pool.query(`
      SELECT dc.*, pr.nombre AS producto
      FROM detalle_compras dc
      JOIN productos pr ON pr.id_producto = dc.id_producto
      WHERE dc.id_compra = $1
    `, [id]);

        res.json({
            compra: cabecera.rows[0],
            detalle: detalle.rows
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener detalle", error });
    }
};

// Editar compra (fecha o proveedor)
export const editarCompra = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { fecha_compra, id_proveedor } = req.body;

        await pool.query(
            `UPDATE compras SET fecha_compra = $1, id_proveedor = $2 WHERE id_compra = $3`,
            [fecha_compra, id_proveedor, id]
        );

        res.json({ mensaje: "Compra actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al editar compra", error });
    }
};

// Cambiar estado de compra
export const actualizarEstadoCompra = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Actualizar el estado de la compra
        await pool.query(`UPDATE compras SET estado = $1 WHERE id_compra = $2`, [estado, id]);

        // Si la compra fue recibida, actualizar inventario y registrar movimientos
        if (estado === "Recibida") {
            // Obtener los productos del detalle de la compra
            const productos = await pool.query(`
                SELECT id_producto, cantidad
                FROM detalle_compras
                WHERE id_compra = $1
            `, [id]);

            // Recorrer los productos y actualizar inventario + registrar movimiento
            for (const producto of productos.rows) {
                const { id_producto, cantidad } = producto;

                // Actualizar inventario
                await pool.query(`
                    UPDATE inventario
                    SET stock_actual = stock_actual + $1
                    WHERE id_producto = $2
                `, [cantidad, id_producto]);

                // Registrar movimiento tipo Entrada
                await pool.query(`
                    INSERT INTO movimientos_inventario (id_producto, tipo, cantidad, motivo)
                    VALUES ($1, 'Entrada', $2, 'Compra recibida')
                `, [id_producto, cantidad]);
            }
        }

        res.json({ mensaje: "Estado actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: "Error al cambiar estado", error });
    }
};


// Eliminar una compra
export const eliminarCompra = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query(`DELETE FROM compras WHERE id_compra = $1`, [id]);
        res.json({ mensaje: "Compra eliminada" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar compra", error });
    }
};
