# FleetWise: Real-Time Cab Booking and Dispatch System

FleetWise is a full-stack web application designed to manage and allocate cabs for employee transportation. It features real-time cab tracking, intelligent trip assignment using advanced pathfinding algorithms, and separate dashboards for administrators and employees.

## ✨ Features

*   **User Roles & Authentication**: Secure JWT-based authentication with distinct roles for Employees and Administrators.
*   **Interactive Real-Time Map**: A live map interface (likely using a library like Leaflet) to visualize all available cabs in real-time.
*   **Trip Management**:
    *   Employees can request trips by selecting pickup and destination points directly on the map.
    *   View trip history and current trip status.
*   **Intelligent Cab Allocation**: The system automatically assigns the nearest available cab to a new trip request, optimizing for the shortest arrival time.
*   **Advanced Routing Algorithms**:
    *   **Dijkstra's Algorithm**: Used to calculate the shortest path and estimated travel time for a trip from pickup to destination.
    *   **A\* Algorithm**: A more optimized strategy is used to efficiently find the closest cab to a user's pickup point by running the search once from the pickup location.

## 🛠️ Tech Stack

*   **Frontend**:
    *   React
    *   React Router for client-side routing.
*   **Backend**:
    *   Node.js
    *   Express.js for the REST API.
    *   JSON Web Tokens (JWT) for securing endpoints.
*   **Database**:
    *   PostgreSQL (or any other SQL database compatible with the setup).

## 📂 Project Structure

The project is organized into two main directories:

```
├── client/         # Contains the React frontend application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── App.js
│       └── index.js
│
└── server/         # Contains the Node.js/Express backend
    ├── services/   # Business logic (e.g., TripService)
    ├── strategies/ # Cab allocation algorithms (Dijkstra, AStar)
    ├── utils/      # Utility classes (e.g., Graph)
    ├── routes/
    └── server.js   # Main server entry point
```

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v14 or later)
*   npm
*   A running instance of a SQL database (e.g., PostgreSQL).

### 1. Clone the Repository

```bash
git clone https://github.com/lileskimo/CabAllocation.git
cd CabAllocation
```

### 2. Backend Setup

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file in the server/ directory
# (copy from .env.example and fill in your details)
cp .env.example .env

# NOTE: Update the .env file with your database credentials and JWT secret.

# Run database migrations and seeders (if applicable)
# npm run db:migrate

# Start the backend server
npm start
```
The server will be running on `http://localhost:4000`.

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to the client directory
cd client

# Install dependencies
npm install

# Start the React development server
npm start
```
The client application will be available at `http://localhost:3000`.

