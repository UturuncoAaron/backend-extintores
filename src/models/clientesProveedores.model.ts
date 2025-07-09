import { pool } from "../config/db";

// --- CLIENTES ---
interface Cliente {
    nombre: string;
    direccion: string;
    telefono: string;
    correo: string;
    estado?: boolean;
}

export const ClienteModel = {
    crear: async (cliente: Cliente) => {
        const { nombre, direccion, telefono, correo, estado = true } = cliente;
        return await pool.query(
            `INSERT INTO clientes (nombre, direccion, telefono, correo, estado)
             VALUES ($1, $2, $3, $4, $5)`,
            [nombre, direccion, telefono, correo, estado]
        );
    },
    // CORRECCIÓN: Se añade el filtro para mostrar solo los activos
    listar: async () => {
        const result = await pool.query(`SELECT * FROM clientes WHERE estado = TRUE ORDER BY id_cliente ASC`);
        return result.rows;
    },
    editar: async (id: number, cliente: Cliente) => {
        const { nombre, direccion, telefono, correo, estado } = cliente;
        return await pool.query(
            `UPDATE clientes
             SET nombre = $1, direccion = $2, telefono = $3, correo = $4, estado = $5
             WHERE id_cliente = $6`,
            [nombre, direccion, telefono, correo, estado, id]
        );
    },
    // CORRECCIÓN: Se cambia a un borrado lógico (desactivación)
    eliminar: async (id: number) => {
        return await pool.query(
            `UPDATE clientes SET estado = FALSE WHERE id_cliente = $1`,
            [id]
        );
    }
};


// --- PROVEEDORES ---
interface Proveedor {
    nombre: string;
    direccion: string;
    telefono: string;
    correo: string;
    estado?: boolean;
}

export const ProveedorModel = {
    crear: async (proveedor: Proveedor) => {
        const { nombre, direccion, telefono, correo, estado = true } = proveedor;
        return await pool.query(
            `INSERT INTO proveedores (nombre, direccion, telefono, correo, estado)
             VALUES ($1, $2, $3, $4, $5)`,
            [nombre, direccion, telefono, correo, estado]
        );
    },
    // CORRECCIÓN: Se añade el filtro para mostrar solo los activos
    listar: async () => {
        const result = await pool.query(`SELECT * FROM proveedores WHERE estado = TRUE ORDER BY id_proveedor ASC`);
        return result.rows;
    },
    editar: async (id: number, proveedor: Proveedor) => {
        const { nombre, direccion, telefono, correo, estado } = proveedor;
        return await pool.query(
            `UPDATE proveedores
             SET nombre = $1, direccion = $2, telefono = $3, correo = $4, estado = $5
             WHERE id_proveedor = $6`,
            [nombre, direccion, telefono, correo, estado, id]
        );
    },
    // CORRECCIÓN: Se cambia a un borrado lógico (desactivación)
    eliminar: async (id: number) => {
        return await pool.query(
            `UPDATE proveedores SET estado = FALSE WHERE id_proveedor = $1`,
            [id]
        );
    }
};
