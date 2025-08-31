# Frontend-Backend Integration Test Guide

## Prerequisites
- Backend server running on http://localhost:4000
- Frontend server running on http://localhost:3000
- Database seeded with test data

## Test Scenarios

### 1. Admin Dashboard Testing

#### Login as Admin
1. Go to http://localhost:3000
2. Click "Login"
3. Use credentials: admin@example.com / admin123
4. Verify you're redirected to Admin Dashboard

#### View All Cabs
1. On Admin Dashboard, verify all cabs are displayed
2. Check that each cab shows:
   - Driver name
   - Vehicle number
   - Status (with color coding)
   - Location coordinates
   - Last update timestamp

#### Create New Cab
1. Click "Create New Cab" button
2. Fill in the form:
   - Driver Name: "Test Driver"
   - Vehicle Number: "MH99TEST123"
   - Latitude: 19.0760
   - Longitude: 72.8777
3. Click "Create Cab"
4. Verify success message appears
5. Verify new cab appears in the list

#### Update Cab Status
1. Find a cab in the list
2. Use the status dropdown to change status
3. Verify status updates immediately
4. Verify "Last Update" timestamp changes

### 2. Employee Dashboard Testing

#### Login as Employee
1. Go to http://localhost:3000
2. Click "Login"
3. Use credentials: employee@example.com / employee123
4. Verify you're redirected to Employee Dashboard

#### View Available Cabs
1. On Employee Dashboard, verify only available cabs are shown
2. Verify cabs with status "offline" or "on_trip" are NOT shown
3. Verify cabs with old timestamps (>5 minutes) are NOT shown

#### Update Cab Location
1. Click "Update Location" on any available cab
2. Modify the coordinates:
   - Latitude: 19.0800
   - Longitude: 72.8700
3. Click "Update Location"
4. Verify success message appears
5. Verify location updates in the list
6. Verify "Last Update" timestamp changes

### 3. Cross-User Testing

#### Test Admin-Employee Interaction
1. As Admin: Change a cab status to "offline"
2. As Employee: Refresh available cabs
3. Verify the offline cab no longer appears in employee view

#### Test Location Updates
1. As Employee: Update a cab location
2. As Admin: Refresh cabs list
3. Verify the location change is visible in admin view

### 4. Error Handling Testing

#### Invalid Token
1. Open browser dev tools
2. Clear localStorage: `localStorage.clear()`
3. Try to access Admin/Employee dashboard
4. Verify redirect to login page

#### Network Errors
1. Stop the backend server
2. Try to refresh cabs in either dashboard
3. Verify error message is displayed
4. Restart backend server
5. Verify functionality resumes

#### Form Validation
1. Try to create cab with empty required fields
2. Try to update location with invalid coordinates
3. Verify form validation prevents submission

## Expected Results

### Admin Dashboard
- ✅ All cabs visible regardless of status
- ✅ Create cab functionality works
- ✅ Status updates work
- ✅ Real-time data refresh works

### Employee Dashboard
- ✅ Only available cabs visible
- ✅ Location updates work
- ✅ 5-minute filter works correctly
- ✅ Real-time data refresh works

### Security
- ✅ Admin-only endpoints protected
- ✅ Authentication required for all endpoints
- ✅ Token expiration handled properly

### Data Consistency
- ✅ Changes reflect across both dashboards
- ✅ Timestamps update automatically
- ✅ Status changes affect availability

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has CORS enabled
2. **401 Errors**: Check if token is valid and not expired
3. **No cabs showing**: Verify database is seeded
4. **Location not updating**: Check coordinate format (numbers, not strings)

### Debug Commands

```bash
# Check backend status
curl http://localhost:4000/

# Check admin token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/cabs

# Check available cabs
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/cabs/available
```

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ All API calls successful
- ✅ UI updates reflect backend changes
- ✅ Authentication working properly
- ✅ Error handling graceful
