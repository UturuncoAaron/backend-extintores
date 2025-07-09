import { Router } from "express";
// 1. Importamos la nueva función del controlador
import { listarMovimientos, obtenerHistorialPorProducto } from "../controllers/movimiento.controller";

const router = Router();

// Ruta para obtener el historial COMPLETO de todos los movimientos
router.get("/", listarMovimientos);

// Ruta para obtener el historial de UN SOLO producto por su ID
router.get("/:id", obtenerHistorialPorProducto);

// 2. Eliminamos la ruta POST. ¡Ya no es necesaria aquí!

export default router;
