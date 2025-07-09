// src/config/db.ts
import { Pool } from 'pg';

export const pool = new Pool({
    user: 'postgres',
    host: 'localhost', 
    database: 'extintores', 
    password: 'kikoyuter123',  
    port: 5432 
});

pool.connect()
    .then(() => console.log('📦 Conectado a PostgreSQL'))
    .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));
