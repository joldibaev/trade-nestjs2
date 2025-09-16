import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { databaseConfig } from '../../src/config/database.config';

config();

async function resetDatabase() {
  console.log('🔄 Starting database reset...');

  // Create a new DataSource instance
  const dataSource = new DataSource({
    ...databaseConfig,
    entities: ['src/**/*.entity.ts'],
    migrations: ['migrations/*.ts'],
  });

  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Drop all tables
    console.log('🗑️  Dropping all tables...');
    await dataSource.query('DROP SCHEMA public CASCADE');
    await dataSource.query('CREATE SCHEMA public');
    console.log('✅ All tables dropped');

    // Enable UUID extension
    console.log('🔧 Enabling UUID extension...');
    await dataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled');

    // Run migrations
    console.log('🔄 Running migrations...');
    await dataSource.runMigrations();
    console.log('✅ Migrations completed');

    console.log('🎉 Database reset completed successfully!');
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  } finally {
    // Close the data source
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the reset function
void resetDatabase();
