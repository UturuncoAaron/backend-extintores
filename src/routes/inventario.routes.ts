import { Router } from "express";
import { verInventario } from "../controllers/inventario.controller";

const router = Router();

router.get("/", verInventario);

export default router;
