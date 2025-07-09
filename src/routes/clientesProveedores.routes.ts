import { Router } from "express";
import {
    crearCliente,
    listarClientes,
    editarCliente,  
    eliminarCliente, 
    crearProveedor,
    listarProveedores,
    editarProveedor, 
    eliminarProveedor  
} from "../controllers/clientesProveedores.controller";

const router = Router();

// --- Rutas para Clientes ---
router.post("/clientes", crearCliente);
router.get("/clientes", listarClientes);
router.put("/clientes/:id", editarCliente);    
router.delete("/clientes/:id", eliminarCliente); 

// --- Rutas para Proveedores ---
router.post("/proveedores", crearProveedor);
router.get("/proveedores", listarProveedores);
router.put("/proveedores/:id", editarProveedor); 
router.delete("/proveedores/:id", eliminarProveedor); 

export default router;