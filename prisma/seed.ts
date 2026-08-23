import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

// Credenciales del admin inicial. Los valores por defecto son los de desarrollo;
// en producción conviene sobreescribirlos por variables de entorno.
const username = process.env.ADMIN_SEED_USERNAME ?? 'admin';
const email = process.env.ADMIN_SEED_EMAIL ?? 'admin@admin.com';
const password = process.env.ADMIN_SEED_PASSWORD ?? 'Admin123*';

async function main() {
  const connectionString = process.env.DATABASE_URL;

  // Sin esto, `pg` intentaría conectar con sus defaults y el fallo llegaría
  // como un ECONNREFUSED opaco en vez de decir qué falta.
  if (!connectionString) {
    throw new Error('Falta DATABASE_URL en el entorno.');
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    // El sistema admite un solo administrador (misma regla que AdminService.register),
    // así que el seed no toca nada si ya hay uno: correrlo de nuevo no pisa la
    // contraseña de un admin existente.
    const existing = await prisma.userAdmin.count();

    if (existing > 0) {
      console.log('Seed: ya existe un administrador, no se planta ninguno.');
      return;
    }

    await prisma.userAdmin.create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });

    console.log(`Seed: administrador creado (usuario "${username}", ${email}).`);
    console.log('Seed: el login del panel se hace con el usuario, no con el email.');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seed: falló la creación del administrador.', error);
  process.exitCode = 1;
});
