import { Router } from "express";
import {
    crearCliente,
    listarClientes,
    crearProveedor,
    listarProveedores
} from "../controllers/clientesProveedores.controller";

const router = Router();

// Clientes
router.post("/clientes", crearCliente);
router.get("/clientes", listarClientes);

// Proveedores
router.post("/proveedores", crearProveedor);
router.get("/proveedores", listarProveedores);

export default router;
