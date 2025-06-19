// En: src/routes/distribuciones.routes.ts

import { Router } from "express";
import {
    crearDistribucion,
    listarDistribuciones,
    detalleDistribucion,
    actualizarEstadoDistribucion,
    eliminarDistribucion,editarDistribucion
} from "../controllers/distribuciones.controller";

const router = Router();
router.get("/", listarDistribuciones);
router.post("/", crearDistribucion);
router.get("/:id", detalleDistribucion);
router.put("/:id/estado", actualizarEstadoDistribucion);
router.put("/:id", editarDistribucion);
router.delete("/:id", eliminarDistribucion);

export default router;