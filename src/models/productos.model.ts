import { pool } from '../config/db';

// Interfaz para definir la estructura de un Producto
export interface Producto {
    id_producto: number;
    nombre: string;
    descripcion: string;
    tipo: string;
    peso_kg: number;
    categoria: string;
    precio_unitario: number;
    estado: boolean;
}

// --- FUNCIONES CRUD ---

// CREATE: Crear un nuevo producto
export const create = async (datosProducto: Omit<Producto, 'id_producto' | 'estado'>): Promise<Producto> => {
    const { nombre, descripcion, tipo, peso_kg, categoria, precio_unitario } = datosProducto;
    const consulta = `
        INSERT INTO productos (nombre, descripcion, tipo, peso_kg, categoria, precio_unitario) 
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *
    `;
    const valores = [nombre, descripcion, tipo, peso_kg, categoria, precio_unitario];
    const resultado = await pool.query(consulta, valores);
    return resultado.rows[0];
};

// READ ALL: Obtener todos los productos
export const findAll = async (): Promise<Producto[]> => {
    const consulta = 'SELECT * FROM productos ORDER BY id_producto ASC';
    const resultado = await pool.query(consulta);
    return resultado.rows;
};

// READ ONE: Obtener un producto por su ID
export const findById = async (id: number): Promise<Producto | null> => {
    const consulta = 'SELECT * FROM productos WHERE id_producto = $1';
    const resultado = await pool.query(consulta, [id]);
    return resultado.rows[0] || null;
};

// UPDATE: Actualizar un producto existente
export const update = async (id: number, datosProducto: Partial<Producto>): Promise<Producto | null> => {
    const { nombre, descripcion, tipo, peso_kg, categoria, precio_unitario, estado } = datosProducto;
    const consulta = `
        UPDATE productos 
        SET 
            nombre = $1, 
            descripcion = $2, 
            tipo = $3, 
            peso_kg = $4, 
            categoria = $5, 
            precio_unitario = $6,
            estado = $7
        WHERE id_producto = $8 
        RETURNING *
    `;
    const valores = [nombre, descripcion, tipo, peso_kg, categoria, precio_unitario, estado, id];
    const resultado = await pool.query(consulta, valores);
    return resultado.rows[0] || null;
};

// DELETE: Eliminar un producto por su ID
export const remove = async (id: number): Promise<Producto | null> => {
    const consulta = 'DELETE FROM productos WHERE id_producto = $1 RETURNING *';
    const resultado = await pool.query(consulta, [id]);
    return resultado.rows[0] || null;
};