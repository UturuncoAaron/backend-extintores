import { pool } from "../config/db";

// Interfaces para tipado de datos
interface Cliente {
    nombre: string;
    direccion: string;
    telefono: string;
    correo: string;
}

interface Proveedor {
    nombre: string;
    direccion: string;
    telefono: string;
    correo: string;
}

export const ClienteModel = {
    crear: async (cliente: Cliente) => {
        const { nombre, direccion, telefono, correo } = cliente;
        return await pool.query(
            `INSERT INTO clientes (nombre, direccion, telefono, correo)
             VALUES ($1, $2, $3, $4)`,
            [nombre, direccion, telefono, correo]
        );
    },

    listar: async () => {
        const result = await pool.query(`SELECT * FROM clientes WHERE estado = TRUE`);
        return result.rows;
    }
};

export const ProveedorModel = {
    crear: async (proveedor: Proveedor) => {
        const { nombre, direccion, telefono, correo } = proveedor;
        return await pool.query(
            `INSERT INTO proveedores (nombre, direccion, telefono, correo)
             VALUES ($1, $2, $3, $4)`,
            [nombre, direccion, telefono, correo]
        );
    },

    listar: async () => {
        const result = await pool.query(`SELECT * FROM proveedores WHERE estado = TRUE`);
        return result.rows;
    }
};