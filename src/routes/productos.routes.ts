import { Router } from 'express';
import { listarProductos, crearProducto } from '../controllers/productos.controller';

const router = Router();

router.get('/', listarProductos);
router.post('/', crearProducto);

export default router;
