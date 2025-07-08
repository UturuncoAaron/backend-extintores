import { Request, Response } from "express";
import { pool } from "../config/db";


export const crearCliente = async (req: Request, res: Response) => {
    try {
        const { nombre, direccion, telefono, correo } = req.body;
        await pool.query(
            `INSERT INTO clientes (nombre, direccion, telefono, correo)
       VALUES ($1, $2, $3, $4)`,
            [nombre, direccion, telefono, correo]
        );
        res.json({ mensaje: "Cliente registrado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar cliente", error });
    }
};

export const listarClientes = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM clientes WHERE estado = TRUE`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar clientes", error });
    }
};



export const crearProveedor = async (req: Request, res: Response) => {
    try {
        const { nombre, direccion, telefono, correo } = req.body;
        await pool.query(
            `INSERT INTO proveedores (nombre, direccion, telefono, correo)
       VALUES ($1, $2, $3, $4)`,
            [nombre, direccion, telefono, correo]
        );
        res.json({ mensaje: "Proveedor registrado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar proveedor", error });
    }
};

export const listarProveedores = async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`SELECT * FROM proveedores WHERE estado = TRUE`);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar proveedores", error });
    }
};
