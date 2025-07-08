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