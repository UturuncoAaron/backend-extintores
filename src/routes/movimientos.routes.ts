import { Router } from "express";
import { registrarMovimiento, listarMovimientos } from "../controllers/movimiento.controller";

const router = Router();

router.post("/", registrarMovimiento);
router.get("/", listarMovimientos);

export default router;
