import { Request, Response } from "express";
import { ClienteModel, ProveedorModel } from "../models/clientesProveedores.model";

// --- Funciones para Clientes ---

export const crearCliente = async (req: Request, res: Response) => {
    try {
        await ClienteModel.crear(req.body);
        res.status(201).json({ mensaje: "Cliente registrado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar cliente", error });
    }
};

export const listarClientes = async (_req: Request, res: Response) => {
    try {
        const clientes = await ClienteModel.listar();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar clientes", error });
    }
};

export const editarCliente = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        await ClienteModel.editar(id, req.body);
        res.json({ mensaje: "Cliente actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar cliente", error });
    }
};

export const eliminarCliente = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        await ClienteModel.eliminar(id);
        res.json({ mensaje: "Cliente eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar cliente", error });
    }
};


// --- Funciones para Proveedores ---

export const crearProveedor = async (req: Request, res: Response) => {
    try {
        await ProveedorModel.crear(req.body);
        res.status(201).json({ mensaje: "Proveedor registrado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al registrar proveedor", error });
    }
};

export const listarProveedores = async (_req: Request, res: Response) => {
    try {
        const proveedores = await ProveedorModel.listar();
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al listar proveedores", error });
    }
};

export const editarProveedor = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        await ProveedorModel.editar(id, req.body);
        res.json({ mensaje: "Proveedor actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar proveedor", error });
    }
};

export const eliminarProveedor = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        await ProveedorModel.eliminar(id);
        res.json({ mensaje: "Proveedor eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar proveedor", error });
    }
};