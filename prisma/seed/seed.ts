import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { XlsxReaderService } from '../../src/xlsx-reader/xlsx-reader.service';

const prisma = new PrismaClient();

interface SeedData {
  id: string;
  [key: string]: any;
}

async function loadSeedData(filename: string): Promise<SeedData[]> {
  const filePath = path.join(__dirname, 'seed-data', filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

async function loadXlsxData(
  filename: string,
  xlsxReaderService: XlsxReaderService,
): Promise<SeedData[]> {
  const filePath = path.join(__dirname, 'seed-data', filename);
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    const result = await xlsxReaderService.readXlsxFile(buffer, {
      startRow: 2, // Пропускаем заголовок
    });
    return result.data.map((item, index) => ({
      id: `temp_${index}`,
      ...item,
    }));
  }
  return [];
}

function detectBarcodeType(code: string): string {
  const cleanCode = code.replace(/\D/g, '');

  if (cleanCode.length === 13 && /^\d{13}$/.test(cleanCode)) {
    return 'EAN13';
  }
  if (cleanCode.length === 8 && /^\d{8}$/.test(cleanCode)) {
    return 'EAN8';
  }
  if (cleanCode.length === 12 && /^\d{12}$/.test(cleanCode)) {
    return 'UPC_A';
  }
  if (
    cleanCode.length >= 6 &&
    cleanCode.length <= 8 &&
    /^\d+$/.test(cleanCode)
  ) {
    return 'UPC_E';
  }
  if (code.length >= 4 && code.length <= 48 && /^[A-Za-z0-9]+$/.test(code)) {
    return 'CODE128';
  }
  if (code.length > 48) {
    return 'QR';
  }
  return 'OTHER';
}

// Функция для форматирования времени
function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

// Функция для измерения времени выполнения секции
async function measureTime<T>(
  name: string,
  operation: () => Promise<T>,
  count?: number
): Promise<T> {
  const startTime = Date.now();
  const result = await operation();
  const time = Date.now() - startTime;
  const countText = count ? `: ${count}` : '';
  console.log(`✅ ${name} созданы${countText} (${formatTime(time)})`);
  return result;
}

// Функция для массового создания записей с использованием createMany
async function createManyRecords(
  model: any,
  data: any[],
  batchSize: number = 1000
): Promise<void> {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await model.createMany({
      data: batch,
      skipDuplicates: true,
    });
  }
}

async function main() {
  const startTime = Date.now();
  console.log('🌱 Начинаем заполнение базы данных...');

  // Создаем XlsxReaderService
  const xlsxReaderService = new XlsxReaderService();

  // Загружаем пользователей из JSON
  let users = await loadSeedData('users.json');
  if (users.length > 0) {
    await measureTime('Пользователи', async () => {
      for (const userData of users) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await prisma.user.upsert({
          where: { username: userData.username },
          update: {},
          create: {
            username: userData.username,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'user',
          },
        });
      }
    }, users.length);
  } else {
    console.log(
      '⚠️ Файл users.json не найден, пропускаем создание пользователей',
    );
  }

  // Загружаем валюты из JSON
  let currencies = await loadSeedData('currencies.json');
  if (currencies.length > 0) {
    await measureTime('Валюты', async () => {
      for (const currencyData of currencies) {
        await prisma.currency.upsert({
          where: { code: currencyData.code },
          update: {},
          create: {
            code: currencyData.code,
            name: currencyData.name,
            symbol: currencyData.symbol,
            rate: currencyData.rate,
          },
        });
      }
    }, currencies.length);
  } else {
    console.log('⚠️ Файл currencies.json не найден, пропускаем создание валют');
  }

  // Загружаем склады из JSON
  let stores = await loadSeedData('stores.json');
  let storeIds: string[] = [];
  let totalCashboxes = 0;

  if (stores.length > 0) {
    await measureTime('Склады', async () => {
      for (const storeData of stores) {
        const store = await prisma.store.upsert({
          where: { name: storeData.name },
          update: {},
          create: {
            name: storeData.name,
          },
        });
        storeIds.push(store.id);

        // Создаем кассы для этого склада
        if (storeData.cashboxes && Array.isArray(storeData.cashboxes)) {
          for (const cashboxData of storeData.cashboxes) {
            await prisma.cashbox.upsert({
              where: {
                storeId_name: {
                  storeId: store.id,
                  name: cashboxData.name,
                },
              },
              update: {},
              create: {
                name: cashboxData.name,
                storeId: store.id,
              },
            });
            totalCashboxes++;
          }
        }
      }
    }, stores.length);
    console.log(`✅ Кассы созданы: ${totalCashboxes}`);
  } else {
    console.log('⚠️ Файл stores.json не найден, пропускаем создание складов');
  }

  // Загружаем категории из JSON
  let categories = await loadSeedData('categories.json');
  const categoryIdMapping: { [oldId: string]: string } = {};
  const categoryNameMapping: { [name: string]: string } = {};

  if (categories.length > 0) {
    await measureTime('Категории', async () => {
      // Обрабатываем иерархические категории из JSON
      const processedCategories: any[] = [];
      const parentCategories: { [name: string]: string } = {};

      for (const category of categories) {
        const categoryName = category.name;

        if (categoryName.includes('/')) {
          const parts = categoryName.split('/');
          const parentName = parts[0].trim();
          const childName = parts[1].trim();

          // Создаем родительскую категорию
          if (!parentCategories[parentName]) {
            const parentCategory = await prisma.category.upsert({
              where: { name: parentName },
              update: {},
              create: {
                name: parentName,
                description: category.description,
              },
            });
            parentCategories[parentName] = parentCategory.id;
            categoryNameMapping[parentName] = parentCategory.id;
          }

          // Создаем дочернюю категорию
          const childCategory = await prisma.category.upsert({
            where: { name: childName },
            update: {},
            create: {
              name: childName,
              description: category.description,
              parentId: parentCategories[parentName],
            },
          });
          categoryIdMapping[category.id.toString()] = childCategory.id;
          categoryNameMapping[categoryName] = childCategory.id;
        } else {
          // Обычная категория
          const categoryRecord = await prisma.category.upsert({
            where: { name: categoryName },
            update: {},
            create: {
              name: categoryName,
              description: category.description,
            },
          });
          categoryIdMapping[category.id.toString()] = categoryRecord.id;
          categoryNameMapping[categoryName] = categoryRecord.id;
        }
      }
    }, categories.length);
  } else {
    console.log(
      '⚠️ Файл categories.json не найден, пропускаем создание категорий',
    );
  }

  // Загружаем поставщиков из JSON
  let vendors = await loadSeedData('vendors.json');
  if (vendors.length > 0) {
    await measureTime('Поставщики', async () => {
      for (const vendorData of vendors) {
        await prisma.vendor.upsert({
          where: { name: vendorData.name },
          update: {},
          create: {
            name: vendorData.name,
            contactPerson: vendorData.contactPerson,
            phone: vendorData.phone,
            email: vendorData.email,
            address: vendorData.address,
          },
        });
      }
    }, vendors.length);
  } else {
    console.log(
      '⚠️ Файл vendors.json не найден, пропускаем создание поставщиков',
    );
  }

  // Загружаем клиентов из JSON
  let customers = await loadSeedData('customers.json');
  if (customers.length > 0) {
    await measureTime('Клиенты', async () => {
      for (const customerData of customers) {
        await prisma.customer.upsert({
          where: { name: customerData.name },
          update: {},
          create: {
            name: customerData.name,
            contactPerson: customerData.contactPerson,
            phone: customerData.phone,
            email: customerData.email,
            address: customerData.address,
          },
        });
      }
    }, customers.length);
  } else {
    console.log(
      '⚠️ Файл customers.json не найден, пропускаем создание клиентов',
    );
  }

  // Загружаем типы цен из JSON
  let priceTypes = await loadSeedData('price-types.json');
  const priceTypeIdMapping: { [oldId: string]: string } = {};

  if (priceTypes.length > 0) {
    await measureTime('Типы цен', async () => {
      for (const priceTypeData of priceTypes) {
        const priceType = await prisma.priceType.upsert({
          where: { name: priceTypeData.name },
          update: {},
          create: {
            name: priceTypeData.name,
            isActive: priceTypeData.isActive !== false,
          },
        });
        priceTypeIdMapping[priceTypeData.id.toString()] = priceType.id;
      }
    }, priceTypes.length);
  } else {
    console.log(
      '⚠️ Файл price-types.json не найден, пропускаем создание типов цен',
    );
  }

  // Загружаем товары из XLSX
  let products = await loadXlsxData('products.xlsx', xlsxReaderService);
  const productIdMapping: { [oldId: string]: string } = {};
  const usedArticles = new Set<string>();

  if (products.length > 0) {
    // Обрабатываем товары из XLSX
    console.log(`📊 Найдено ${products.length} товаров в XLSX файле`);

    await measureTime('Товары', async () => {
      // Создаем маппинг старых ID продуктов на новые UUID
      for (let i = 0; i < products.length; i++) {
        const oldId = `xlsx_${i}`;
        const newId = `temp_${i}`;
        productIdMapping[oldId] = newId;
      }

      // Функция для генерации уникального артикула
      const generateUniqueArticle = (
        originalArticle: string | undefined,
        index: number,
      ): string => {
        if (originalArticle && originalArticle.trim() !== '') {
          let article = originalArticle.trim();
          let counter = 1;

          while (usedArticles.has(article)) {
            article = `${originalArticle.trim()}-${counter}`;
            counter++;
          }

          usedArticles.add(article);
          return article;
        } else {
          const article = `ART-${String(index + 1).padStart(6, '0')}`;
          usedArticles.add(article);
          return article;
        }
      };

      // Подготавливаем данные для массовой вставки
      const productsData: any[] = [];
      for (let i = 0; i < products.length; i++) {
        const product = products[i];

        // Определяем categoryId на основе поля category из XLSX
        let categoryId =
          Object.values(categoryNameMapping)[0] ||
          Object.values(categoryIdMapping)[0];

        if (product.category) {
          const categoryName = product.category.toString().trim();

          if (categoryNameMapping[categoryName]) {
            categoryId = categoryNameMapping[categoryName];
          } else {
            const parentName = categoryName.split('/')[0].trim();
            if (categoryNameMapping[parentName]) {
              categoryId = categoryNameMapping[parentName];
            }
          }
        }

        productsData.push({
          name: product.name,
          code: product.code || `PROD-${i}`,
          article: generateUniqueArticle(product.article, i),
          description: product.description,
          wac: product.wac || 0,
          categoryId: categoryId,
        });
      }

      // Используем createMany для массовой вставки
      await createManyRecords(prisma.product, productsData, 500);

      // Получаем созданные товары для маппинга ID
      const createdProducts = await prisma.product.findMany({
        where: {
          code: {
            in: productsData.map(p => p.code)
          }
        }
      });

      // Создаем маппинг ID
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const code = product.code || `PROD-${i}`;
        const createdProduct = createdProducts.find(p => p.code === code);
        if (createdProduct) {
          productIdMapping[`xlsx_${i}`] = createdProduct.id;
        }
      }
    }, products.length);
  } else {
    console.log('⚠️ Файл products.xlsx не найден, пропускаем создание товаров');
  }

  // Создаем штрихкоды
  if (products.length > 0) {
    await measureTime('Штрихкоды', async () => {
      // Создаем штрихкоды из XLSX данных
      const barcodes: any[] = [];
      const usedBarcodes = new Set<string>();

      const generateUniqueBarcode = (originalBarcode: string): string => {
        let barcode = originalBarcode.trim();
        let counter = 1;

        while (usedBarcodes.has(barcode)) {
          barcode = `${originalBarcode.trim()}-${counter}`;
          counter++;
        }

        usedBarcodes.add(barcode);
        return barcode;
      };

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productId = productIdMapping[`xlsx_${i}`];

        if (product.barcode && product.barcode.toString().trim() !== '') {
          const barcodeValue = product.barcode.toString().trim();
          const barcodeList = barcodeValue
            .split(',')
            .map(b => b.trim())
            .filter(b => b !== '');

          for (const barcode of barcodeList) {
            if (barcode) {
              const uniqueBarcode = generateUniqueBarcode(barcode);
              barcodes.push({
                code: uniqueBarcode,
                type: detectBarcodeType(uniqueBarcode),
                productId: productId,
              });
            }
          }
        }
      }

      // Используем createMany для массовой вставки штрихкодов
      await createManyRecords(prisma.barcode, barcodes, 1000);
    }, 0); // Количество будет показано в логе
  } else {
    console.log('⚠️ Нет товаров для создания штрихкодов');
  }

  // Создаем цены
  if (products.length > 0) {
    await measureTime('Цены', async () => {
      // Создаем цены из XLSX данных
      const defaultPriceTypeId = Object.values(priceTypeIdMapping)[0];
      const pricesData: any[] = [];

      if (defaultPriceTypeId) {
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          const productId = productIdMapping[`xlsx_${i}`];

          if (
            product.price &&
            typeof product.price === 'number' &&
            product.price > 0
          ) {
            pricesData.push({
              value: product.price,
              productId: productId,
              typeId: defaultPriceTypeId,
            });
          }
        }

        // Используем createMany для массовой вставки цен
        await createManyRecords(prisma.price, pricesData, 1000);
      }
    }, 0); // Количество будет показано в логе
  } else {
    console.log('⚠️ Нет товаров для создания цен');
  }

  // Создаем остатки товаров
  if (products.length > 0) {
    await measureTime('Остатки товаров', async () => {
      // Создаем остатки из XLSX данных
      const defaultStoreId = storeIds[0];
      const quantitiesData: any[] = [];

      if (defaultStoreId) {
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          const productId = productIdMapping[`xlsx_${i}`];

          if (
            product.quantity &&
            typeof product.quantity === 'number' &&
            product.quantity > 0
          ) {
            quantitiesData.push({
              quantity: Math.floor(product.quantity),
              productId: productId,
              storeId: defaultStoreId,
            });
          }
        }

        // Используем createMany для массовой вставки остатков
        await createManyRecords(prisma.productQuantity, quantitiesData, 1000);
      }
    }, 0); // Количество будет показано в логе
  } else {
    console.log('⚠️ Нет товаров для создания остатков');
  }

  const totalTime = Date.now() - startTime;
  console.log(`🎉 База данных успешно заполнена! Общее время: ${formatTime(totalTime)}`);
}

main()
  .catch(e => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
