import app from './app';
import { pool } from './config/db';

const PORT = 3000;

app.listen(PORT, async () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);

    // Consulta simple para verificar que PostgreSQL responde
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('🧪 Prueba de conexión:', result.rows[0]);
    } catch (err: any) {
        console.error('❌ Error durante la prueba de conexión:', err);
    }
});
