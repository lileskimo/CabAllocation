# Cab Management Map Feature

## Overview
The Admin Dashboard now includes a powerful map-based interface for managing cab locations and statuses in real-time. This feature allows administrators to visually manage all cabs, update their locations, and change their statuses directly from an interactive map.

## Features

### 🗺️ Interactive Map Interface
- **Real-time cab visualization**: All cabs are displayed as colored markers on the map
- **Status-based color coding**:
  - 🟢 Green: Available cabs
  - 🟡 Yellow: Cabs on trip
  - 🔴 Red: Offline cabs
- **IIT Jodhpur campus mapping**: Centered on the IIT Jodhpur campus area

### 📍 Location Management
- **Click-to-select**: Click on any cab marker to select it
- **Drag-and-drop location editing**: Click "Edit Location" and then click anywhere on the map to move a cab
- **Precise coordinates**: Shows exact latitude and longitude coordinates
- **Location preview**: Preview new location before confirming changes

### 🔄 Status Management
- **Quick status updates**: Change cab status directly from the map interface
- **Real-time updates**: Status changes are reflected immediately
- **Multiple status options**:
  - Available: Cab is ready for trips
  - On Trip: Cab is currently serving a passenger
  - Offline: Cab is not available

### 📋 Cab Information Panel
- **Detailed cab info**: Driver name, vehicle number, current status
- **Location details**: Precise coordinates and last update time
- **Quick actions**: Status dropdown and location edit button
- **Visual feedback**: Selected cab is highlighted

### 📱 Responsive Design
- **Mobile-friendly**: Works on tablets and mobile devices
- **Touch-optimized**: Touch-friendly controls for mobile users
- **Adaptive layout**: Adjusts to different screen sizes

## How to Use

### Accessing the Map
1. Log in as an administrator
2. Navigate to the Admin Dashboard
3. Click the "Show Map" button to toggle the map interface

### Managing Cabs on the Map

#### Selecting a Cab
- Click on any cab marker (colored circle) on the map
- The cab will be highlighted and its details will appear in the left panel
- You can also click on cabs in the right-side cab list

#### Changing Cab Status
1. Select a cab by clicking its marker
2. Use the status dropdown in the left panel or popup
3. Choose from: Available, On Trip, or Offline
4. Changes are saved automatically

#### Moving a Cab Location
1. Select a cab by clicking its marker
2. Click the "Edit Location" button
3. Click anywhere on the map where you want to move the cab
4. Review the new coordinates in the preview
5. Click "Confirm" to save the new location or "Cancel" to abort

### Map Controls

#### Left Panel - Cab Management
- **Selected Cab Details**: Shows information about the currently selected cab
- **Status Controls**: Dropdown to change cab status
- **Location Controls**: Button to edit cab location
- **Status Legend**: Color-coded legend showing what each color means

#### Right Panel - Cab List
- **All Cabs**: Complete list of all cabs in the system
- **Quick Selection**: Click any cab to select it on the map
- **Status Indicators**: Visual status indicators for each cab

#### Bottom Panel - Instructions
- **Usage Guide**: Quick reference for map controls
- **Color Legend**: Explanation of marker colors

## Technical Implementation

### Frontend Components
- **AdminMap.js**: Main map component with all interactive features
- **MapContainer**: React-Leaflet container for the map
- **Custom Markers**: Status-based colored markers for each cab
- **Interactive Controls**: Click handlers and event management

### Backend API Endpoints
- **GET /api/cabs**: Retrieve all cabs for admin
- **PUT /api/cabs/:id/status**: Update cab status
- **PUT /api/cabs/:id/admin-location**: Update cab location (admin override)

### Map Features
- **OpenStreetMap Tiles**: Free, open-source map tiles
- **Custom Icons**: Status-based cab markers with car emoji
- **Click Events**: Interactive map click handling
- **Popup Information**: Detailed cab info in popups

## Security Features
- **Admin-only access**: Map interface requires admin privileges
- **Authentication**: All API calls require valid admin token
- **Input validation**: Coordinates and status values are validated
- **Error handling**: Comprehensive error handling and user feedback

## Performance Optimizations
- **Efficient rendering**: Only re-render when necessary
- **Debounced updates**: Prevent excessive API calls
- **Lazy loading**: Map loads only when needed
- **Optimized markers**: Efficient marker rendering for large numbers of cabs

## Browser Compatibility
- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **Touch support**: Full touch interaction support
- **Responsive design**: Adapts to different screen sizes

## Future Enhancements
- **Real-time updates**: WebSocket integration for live updates
- **Route visualization**: Show cab routes and trip paths
- **Geofencing**: Define service areas and boundaries
- **Analytics**: Trip statistics and performance metrics
- **Bulk operations**: Select multiple cabs for batch operations

## Troubleshooting

### Common Issues
1. **Map not loading**: Check internet connection and browser console
2. **Markers not appearing**: Verify cab data is being fetched correctly
3. **Location updates failing**: Check admin permissions and API connectivity
4. **Performance issues**: Reduce number of displayed cabs or zoom level

### Debug Information
- Check browser console for JavaScript errors
- Verify API responses in Network tab
- Ensure all required dependencies are installed
- Check server logs for backend errors

## Dependencies
- **react-leaflet**: React wrapper for Leaflet maps
- **leaflet**: JavaScript mapping library
- **react-router-dom**: Navigation and routing
- **react**: Core React library

## API Documentation
See the server routes documentation for detailed API endpoint information.
