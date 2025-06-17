import express from 'express';
import cors from 'cors';

import productosRoutes from './routes/productos.routes';
import inventarioRoutes from './routes/inventario.routes';
import movimientosRoutes from './routes/movimientos.routes';
import comprasRoutes from './routes/compras.routes';
import clientesProveedoresRoutes from './routes/clientesProveedores.routes'; // NUEVO
import distribucionesRoutes from './routes/distribuciones.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/compras', comprasRoutes);
app.use('/api/distribuciones', distribucionesRoutes);
app.use('/api', clientesProveedoresRoutes);

export default app;
