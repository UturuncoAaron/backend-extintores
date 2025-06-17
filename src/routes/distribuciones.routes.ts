import { Router } from "express";
import {
    crearDistribucion,
    agregarDetalleDistribucion,
    listarDistribuciones,
    detalleDistribucion,
    actualizarEstadoDistribucion
} from "../controllers/distribuciones.controller";

const router = Router();

router.post("/", crearDistribucion);
router.post("/detalle", agregarDetalleDistribucion);
router.get("/", listarDistribuciones);
router.get("/:id", detalleDistribucion);
router.put("/:id/estado", actualizarEstadoDistribucion);

export default router;
