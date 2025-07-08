import { Router } from "express";
import {
  crearCompra,
  listarCompras,
  detalleCompra,
  editarCompra,
  actualizarEstadoCompra,
  eliminarCompra
} from "../controllers/compras.controller";

const router = Router();

router.post("/", crearCompra);
router.get("/", listarCompras);
router.get("/:id", detalleCompra);
router.put("/:id", editarCompra);
router.put("/:id/estado", actualizarEstadoCompra);
router.delete("/:id", eliminarCompra);

export default router;
