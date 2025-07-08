// src/config/db.ts
import { Pool } from 'pg';

export const pool = new Pool({
    user: 'postgres',               // Tu usuario de PostgreSQL
    host: 'localhost',              // O la IP de tu servidor
    database: 'extintores',  // Tu base de datos
    password: '123456',      // Pon tu contraseña real aquí
    port: 5432                      // Puerto por defecto
});

pool.connect()
    .then(() => console.log('📦 Conectado a PostgreSQL'))
    .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));
