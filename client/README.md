# Smart Cab Allocation - Frontend

This is the React frontend for the Smart Cab Allocation System.

## Features

### Admin Dashboard (`/admin`)
- **View All Cabs**: See all cabs in the system with their current status and location
- **Create New Cabs**: Add new cabs with driver name, vehicle number, and optional coordinates
- **Update Cab Status**: Change cab status between available, on_trip, and offline
- **Real-time Updates**: Refresh cab data to see latest changes

### Employee Dashboard (`/employee`)
- **View Available Cabs**: See only cabs that are available and recently updated (within 5 minutes)
- **Update Cab Locations**: Simulate driver location updates for testing
- **Real-time Monitoring**: Track cab availability and location changes

## API Integration

The frontend integrates with the following Cab API endpoints:

### Admin Endpoints (Admin only)
- `GET /api/cabs` - List all cabs
- `POST /api/cabs` - Create new cab
- `PUT /api/cabs/:id/status` - Update cab status

### Employee Endpoints (Any authenticated user)
- `GET /api/cabs/available` - List available cabs
- `PUT /api/cabs/:id/location` - Update cab location

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:4000

## Testing the Integration

### Admin Testing
1. Login as admin (admin@example.com / admin123)
2. Navigate to Admin Dashboard
3. Test creating a new cab
4. Test updating cab status
5. Verify all cabs are displayed

### Employee Testing
1. Login as employee (employee@example.com / employee123)
2. Navigate to Employee Dashboard
3. View available cabs (only shows cabs updated within 5 minutes)
4. Test updating cab locations
5. Verify location updates are reflected

## File Structure

```
src/
├── App.js                 # Main app component with routing
├── index.js              # App entry point
├── index.css             # Global styles
├── services/
│   └── api.js           # API service utility
└── pages/
    ├── Login.js         # Login page
    ├── Register.js      # Registration page
    ├── Admin.js         # Admin dashboard
    └── Employee.js      # Employee dashboard
```

## API Service

The `api.js` service provides a centralized way to make API calls:

```javascript
import apiService from '../services/api';

// Get all cabs (admin only)
const cabs = await apiService.getAllCabs();

// Get available cabs
const availableCabs = await apiService.getAvailableCabs();

// Create new cab
const newCab = await apiService.createCab({
  driver_name: 'John Doe',
  vehicle_no: 'MH01AB1234',
  lat: 19.0760,
  lon: 72.8777
});

// Update cab location
await apiService.updateCabLocation(cabId, 19.0760, 72.8777);

// Update cab status
await apiService.updateCabStatus(cabId, 'offline');
```

## Authentication

The frontend uses JWT tokens stored in localStorage for authentication. The API service automatically:
- Includes the token in all requests
- Redirects to login on 401 responses
- Handles token expiration

## Error Handling

All API calls include proper error handling:
- Network errors are caught and displayed
- API errors show user-friendly messages
- Authentication errors redirect to login
- Form validation prevents invalid submissions
