require('dotenv').config();

module.exports = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/smartcab',
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
}; 