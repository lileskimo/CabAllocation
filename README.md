# Smart Cab Allocation (MVP)

A smart cab allocation system with separate server and client applications.

## Project Structure
```
/project-root
  /server          # Node.js + Express backend
  /client          # React frontend
```

## Run server
```bash
cd server
npm install
cp env.example .env    # edit .env with your values
npm run dev
```

## Database Setup
```bash
cd server
# Create PostgreSQL database named 'smartcab'
# Update .env with your DATABASE_URL
npx knex migrate:latest    # Create tables
npx knex seed:run          # Insert sample data
node scripts/testdb.js      # Test database connection
```

## Run client
```bash
cd client
npm install
npm start
```

## Environment Variables
- `PORT`: Server port (default: 4000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `GOOGLE_API_KEY`: Google Maps API key
- `NODE_ENV`: Environment (development/production)

## Features
- User authentication (Login, Employee, Admin roles)
- Cab management and allocation
- Trip tracking and management
- Real-time updates via Socket.IO
- Google Maps integration 