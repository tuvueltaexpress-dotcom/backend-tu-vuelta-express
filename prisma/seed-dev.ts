import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

/**
 * Data de prueba para entornos de desarrollo y de testing.
 *
 * Deliberadamente separado de `prisma/seed.ts` (el administrador inicial, que
 * sí corre en producción): esto planta tiendas y productos ficticios, y no
 * tiene nada que hacer en un entorno real. Se ejecuta con `npm run seed:dev`.
 *
 * Es idempotente: cada tienda y cada producto se resuelve por su `slug`, que
 * aquí es fijo y termina en SEED, así que volver a correrlo actualiza en vez
 * de duplicar. Ese sufijo también sirve para reconocer de un vistazo qué filas
 * son sembradas y cuáles se crearon a mano desde el panel.
 */

// Una sola imagen para todo. Las tiendas y los productos se suben normalmente
// a Cloudinary desde el panel; para la data de prueba no vale la pena subir 25
// imágenes distintas, y una URL ya existente evita depender de credenciales.
const PLACEHOLDER_IMAGE =
  'https://res.cloudinary.com/dfvbjkasx/image/upload/v1785874604/jf3/stores/melmpdajfnvbjzuwy3bg.png';
const PLACEHOLDER_COVER =
  'https://res.cloudinary.com/dfvbjkasx/image/upload/v1785874607/jf3/stores/cover/we6mcyyndhgu2spyw7om.png';

// Credenciales del partner de prueba, para poder entrar al panel de aliados.
const PARTNER_EMAIL = process.env.SEED_DEV_PARTNER_EMAIL ?? 'partner@demo.com';
const PARTNER_PASSWORD =
  process.env.SEED_DEV_PARTNER_PASSWORD ?? 'Partner123';

type ProductSeed = {
  slug: string;
  title: string;
  price: number;
  description: string;
  category: string;
};

type StoreSeed = {
  slug: string;
  name: string;
  category: string;
  ha: string;
  hc: string;
  // Sin coordenadas la tienda queda oculta de todo el sitio público: es a
  // propósito en una de las tiendas, para poder verificar ese filtrado.
  latitude: number | null;
  longitude: number | null;
  // Solo una tienda cuelga del partner de prueba; el resto son "de la casa".
  ofPartner?: boolean;
  productsCategories: string[];
  products: ProductSeed[];
};

// Todas las ubicaciones son de Caracas, a distancias distintas entre sí para
// que las cotizaciones de delivery por km den valores diferenciados.
const STORES: StoreSeed[] = [
  {
    slug: 'saboreSEED01',
    name: 'Sabores del Ávila',
    category: 'Restaurantes',
    ha: '11:00',
    hc: '21:00',
    latitude: 10.5017,
    longitude: -66.9112,
    ofPartner: true,
    productsCategories: ['Platos principales', 'Postres'],
    products: [
      {
        slug: 'pabellSEED01',
        title: 'Pabellón criollo',
        price: 9.5,
        description: 'Carne mechada, caraotas, arroz y tajadas.',
        category: 'Platos principales',
      },
      {
        slug: 'asadonSEED02',
        title: 'Asado negro',
        price: 12.0,
        description: 'Asado negro en su salsa con puré de papas.',
        category: 'Platos principales',
      },
      {
        slug: 'quesilSEED03',
        title: 'Quesillo',
        price: 3.5,
        description: 'Quesillo casero bañado en caramelo.',
        category: 'Postres',
      },
    ],
  },
  {
    slug: 'pizzerSEED02',
    name: 'Pizzería Don Vito',
    category: 'Pizzerías',
    ha: '11:00',
    hc: '23:00',
    latitude: 10.5061,
    longitude: -66.9047,
    productsCategories: ['Pizzas', 'Bebidas'],
    products: [
      {
        slug: 'pizzamSEED04',
        title: 'Pizza Margarita',
        price: 8.5,
        description: 'Salsa de tomate, mozzarella fresca y albahaca.',
        category: 'Pizzas',
      },
      {
        slug: 'pizzapSEED05',
        title: 'Pizza Pepperoni',
        price: 10.0,
        description: 'Doble pepperoni con mozzarella y orégano.',
        category: 'Pizzas',
      },
      {
        slug: 'pizzacSEED06',
        title: 'Pizza Cuatro Quesos',
        price: 11.5,
        description: 'Mozzarella, parmesano, azul y provolone.',
        category: 'Pizzas',
      },
      {
        slug: 'refresSEED07',
        title: 'Refresco 2L',
        price: 3.0,
        description: 'Refresco frío de 2 litros para compartir.',
        category: 'Bebidas',
      },
      {
        slug: 'jugonaSEED08',
        title: 'Jugo natural',
        price: 2.5,
        description: 'Jugo de frutas naturales del día.',
        category: 'Bebidas',
      },
    ],
  },
  {
    slug: 'burgerSEED03',
    name: 'Burger House',
    category: 'Hamburgueserías',
    ha: '12:00',
    // Cierra pasada la medianoche a propósito: es el caso que ejercita la
    // lógica de abierto/cerrado cuando el horario cruza el día.
    hc: '00:00',
    latitude: 10.4956,
    longitude: -66.8452,
    productsCategories: ['Hamburguesas', 'Acompañantes'],
    products: [
      {
        slug: 'clasicSEED09',
        title: 'Clásica doble carne',
        price: 12.0,
        description: 'Dos carnes de res, queso cheddar y salsa de la casa.',
        category: 'Hamburguesas',
      },
      {
        slug: 'hamburSEED10',
        title: 'Hamburguesa de pollo',
        price: 9.5,
        description: 'Pechuga empanizada, lechuga y alioli.',
        category: 'Hamburguesas',
      },
      {
        slug: 'veggieSEED11',
        title: 'Veggie burger',
        price: 8.0,
        description: 'Medallón de lentejas y vegetales asados.',
        category: 'Hamburguesas',
      },
      {
        slug: 'papasfSEED12',
        title: 'Papas fritas grandes',
        price: 4.0,
        description: 'Papas crocantes con sal marina.',
        category: 'Acompañantes',
      },
      {
        slug: 'arosdeSEED13',
        title: 'Aros de cebolla',
        price: 4.5,
        description: 'Aros de cebolla empanizados y crujientes.',
        category: 'Acompañantes',
      },
    ],
  },
  {
    slug: 'panadeSEED04',
    name: 'Panadería La Espiga',
    category: 'Panaderías',
    ha: '06:00',
    hc: '19:00',
    latitude: 10.4914,
    longitude: -66.879,
    productsCategories: ['Panes', 'Dulces'],
    products: [
      {
        slug: 'pancanSEED14',
        title: 'Pan canilla',
        price: 1.5,
        description: 'Pan fresco horneado en el día.',
        category: 'Panes',
      },
      {
        slug: 'pandesSEED15',
        title: 'Pan de sándwich integral',
        price: 3.5,
        description: 'Pan integral en rebanadas.',
        category: 'Panes',
      },
      {
        slug: 'golfeaSEED16',
        title: 'Golfeado',
        price: 2.0,
        description: 'Golfeado con papelón y queso rallado.',
        category: 'Dulces',
      },
      {
        slug: 'tortadSEED17',
        title: 'Torta de chocolate',
        price: 15.0,
        description: 'Torta húmeda de chocolate, porción familiar.',
        category: 'Dulces',
      },
      {
        slug: 'cachitSEED18',
        title: 'Cachito de jamón',
        price: 2.2,
        description: 'Cachito relleno de jamón ahumado.',
        category: 'Dulces',
      },
    ],
  },
  {
    slug: 'farmacSEED05',
    name: 'Farmacia Vida',
    category: 'Farmacias',
    ha: '07:00',
    hc: '22:00',
    latitude: 10.515,
    longitude: -66.949,
    productsCategories: ['Cuidado personal', 'Medicamentos'],
    products: [
      {
        slug: 'jabonaSEED19',
        title: 'Jabón antibacterial',
        price: 3.2,
        description: 'Jabón líquido antibacterial de 250 ml.',
        category: 'Cuidado personal',
      },
      {
        slug: 'cremahSEED20',
        title: 'Crema hidratante',
        price: 7.8,
        description: 'Crema corporal hidratante para piel seca.',
        category: 'Cuidado personal',
      },
      {
        slug: 'analgeSEED21',
        title: 'Analgésico x20',
        price: 5.5,
        description: 'Caja de 20 tabletas para dolor y fiebre.',
        category: 'Medicamentos',
      },
      {
        slug: 'vitamiSEED22',
        title: 'Vitamina C x30',
        price: 9.0,
        description: 'Suplemento de vitamina C, 30 tabletas.',
        category: 'Medicamentos',
      },
    ],
  },
  {
    slug: 'tiendaSEED06',
    name: 'Tienda Sin Ubicación',
    category: 'Pizzerías',
    ha: '09:00',
    hc: '18:00',
    latitude: null,
    longitude: null,
    productsCategories: ['Varios'],
    products: [
      {
        slug: 'producSEED23',
        title: 'Producto oculto',
        price: 5.0,
        description: 'Este producto no debería verse en el sitio público.',
        category: 'Varios',
      },
    ],
  },
];

const DELIVERY_PRICE_PER_KM = 0.5;
const DELIVERY_MIN_FEE = 1;

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('Falta DATABASE_URL en el entorno.');
  }

  // Esto planta data ficticia: en producción sería basura visible para los
  // usuarios finales. La guarda se salta con SEED_DEV_FORCE=1 por si hace
  // falta poblar un entorno de demo que corra con NODE_ENV=production.
  if (process.env.NODE_ENV === 'production' && process.env.SEED_DEV_FORCE !== '1') {
    throw new Error(
      'seed:dev planta data de prueba y NODE_ENV=production. Usar SEED_DEV_FORCE=1 si de verdad se quiere.',
    );
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    // --- Partner de prueba -------------------------------------------------
    const partnerUser = await prisma.user.upsert({
      where: { email: PARTNER_EMAIL },
      update: {},
      create: {
        email: PARTNER_EMAIL,
        password: await bcrypt.hash(PARTNER_PASSWORD, 10),
        // Ya aprobado, para que se pueda entrar al panel sin pasar antes por
        // la aprobación del admin.
        status: 'ACTIVE',
      },
    });

    const partner = await prisma.storePartner.upsert({
      where: { userId: partnerUser.id },
      update: {},
      create: {
        userId: partnerUser.id,
        businessName: 'Sabores del Ávila',
        phone: '+584121234567',
      },
    });

    // --- Categorías de tienda ----------------------------------------------
    // `name` no es unique en el schema, así que el upsert no aplica: se busca
    // por nombre y se crea solo si falta.
    const categoryNames = [...new Set(STORES.map((store) => store.category))];
    const categoryIds = new Map<string, number>();

    for (const name of categoryNames) {
      const existing = await prisma.storesCategories.findFirst({
        where: { name },
      });

      const category =
        existing ?? (await prisma.storesCategories.create({ data: { name } }));

      categoryIds.set(name, category.id);
    }

    // --- Tiendas, sus categorías de producto y sus productos ---------------
    for (const storeSeed of STORES) {
      // El `update` no toca `image` ni `coverImage`: si alguien ya subió las
      // imágenes de verdad desde el panel, re-correr el seed no las revierte
      // al placeholder.
      const store = await prisma.stores.upsert({
        where: { slug: storeSeed.slug },
        update: {
          name: storeSeed.name,
          ha: storeSeed.ha,
          hc: storeSeed.hc,
          latitude: storeSeed.latitude,
          longitude: storeSeed.longitude,
          categoryId: categoryIds.get(storeSeed.category)!,
          partnerId: storeSeed.ofPartner ? partner.id : null,
        },
        create: {
          name: storeSeed.name,
          slug: storeSeed.slug,
          image: PLACEHOLDER_IMAGE,
          coverImage: PLACEHOLDER_COVER,
          ha: storeSeed.ha,
          hc: storeSeed.hc,
          latitude: storeSeed.latitude,
          longitude: storeSeed.longitude,
          categoryId: categoryIds.get(storeSeed.category)!,
          partnerId: storeSeed.ofPartner ? partner.id : null,
        },
      });

      const productCategoryIds = new Map<string, number>();

      for (const name of storeSeed.productsCategories) {
        const existing = await prisma.productsCategories.findFirst({
          where: { name, storeId: store.id },
        });

        const category =
          existing ??
          (await prisma.productsCategories.create({
            data: { name, storeId: store.id },
          }));

        productCategoryIds.set(name, category.id);
      }

      for (const productSeed of storeSeed.products) {
        const categoryId = productCategoryIds.get(productSeed.category);

        if (!categoryId) {
          throw new Error(
            `El producto "${productSeed.title}" apunta a la categoría "${productSeed.category}", que no está declarada en la tienda "${storeSeed.name}".`,
          );
        }

        await prisma.product.upsert({
          where: { slug: productSeed.slug },
          update: {
            title: productSeed.title,
            price: productSeed.price,
            description: productSeed.description,
            storeId: store.id,
            categoryId,
          },
          create: {
            title: productSeed.title,
            slug: productSeed.slug,
            price: productSeed.price,
            images: [PLACEHOLDER_IMAGE],
            description: productSeed.description,
            storeId: store.id,
            categoryId,
          },
        });
      }
    }

    // --- Configuración de delivery -----------------------------------------
    // Registro único (id=1). Solo se crea si falta: si el admin ya ajustó las
    // tarifas a mano, el seed no se las pisa.
    await prisma.deliverySettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        pricePerKm: DELIVERY_PRICE_PER_KM,
        minFee: DELIVERY_MIN_FEE,
      },
    });

    const located = STORES.filter((store) => store.latitude !== null).length;
    const products = STORES.reduce(
      (total, store) => total + store.products.length,
      0,
    );

    console.log(
      `Seed dev: ${STORES.length} tiendas (${located} con ubicación), ${products} productos, ${categoryNames.length} categorías de tienda.`,
    );
    console.log(
      `Seed dev: partner de prueba ${PARTNER_EMAIL} / ${PARTNER_PASSWORD}.`,
    );
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Seed dev: falló la carga de datos de prueba.', error);
  process.exitCode = 1;
});
