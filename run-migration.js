import { pool } from './src/db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración de password_reset_tokens...\n');

    const migrationSQL = fs.readFileSync(
      join(__dirname, 'migration_password_reset.sql'),
      'utf8'
    );

    await pool.query(migrationSQL);

    console.log('✅ Migración completada exitosamente!\n');
    console.log('📋 Tabla creada: password_reset_tokens');
    console.log('📋 Índices creados:');
    console.log('   - idx_password_reset_token');
    console.log('   - idx_password_reset_user\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.error('\nDetalles:', error);
    process.exit(1);
  }
}

runMigration();
