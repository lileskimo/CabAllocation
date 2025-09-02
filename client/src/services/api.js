const API_BASE_URL = 'http://localhost:4000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return null;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
  }

  // Cab endpoints
  async getAllCabs() {
    return this.request('/cabs');
  }

  async getAvailableCabs() {
    return this.request('/cabs/available');
  }

  async createCab(cabData) {
    return this.request('/cabs', {
      method: 'POST',
      body: JSON.stringify(cabData)
    });
  }

  async updateCabLocation(cabId, lat, lon) {
    return this.request(`/cabs/${cabId}/location`, {
      method: 'PUT',
      body: JSON.stringify({ lat, lon })
    });
  }

  async updateCabStatus(cabId, status) {
    return this.request(`/cabs/${cabId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Trip endpoints
  async getTrips() {
    return this.request('/trips');
  }

  async getTripById(tripId) {
    return this.request(`/trips/${tripId}`);
  }

  async requestTrip(tripData) {
    return this.request('/trips/request', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  }

  async createTrip(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  }

  async patchTripComplete(tripId) {
    return fetch(`/api/trips/${tripId}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" }
    });
  }

  async patchCabStatus(cabId, status) {
    return fetch(`/api/cabs/${cabId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  }
}

export default new ApiService();
