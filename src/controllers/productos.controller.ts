import { Request, Response } from 'express';
import { pool } from '../config/db';

export const listarProductos = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM productos');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al obtener productos', error: err });
    }
};

export const crearProducto = async (req: Request, res: Response) => {
    const { nombre,
        descripcion,
        tipo,
        peso_kg,
        categoria,
        precio_unitario } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO productos 
            (nombre, descripcion, tipo, peso_kg, categoria, precio_unitario) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [nombre, descripcion, tipo, peso_kg, categoria, precio_unitario]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ mensaje: 'Error al crear producto', error: err });
    }
};
