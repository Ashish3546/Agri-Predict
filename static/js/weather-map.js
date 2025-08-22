// Simple World Map with Location Search Integration
class WeatherMap {
    constructor() {
        this.map = null;
        this.currentMarker = null;
        this.init();
    }
    
    init() {
        this.initMap();
        this.setupLocationListener();
    }
    
    initMap() {
        // Initialize simple world map with street-level zoom
        this.map = L.map('weatherMap', {
            center: [20.5937, 78.9629], // Center on India
            zoom: 5,
            maxZoom: 18, // Street level zoom
            minZoom: 2,
            zoomControl: true,
            scrollWheelZoom: true
        });
        
        // Add OpenStreetMap tiles
        const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        });
        
        // Add satellite layer
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            maxZoom: 18
        });
        
        // Add street layer by default
        streetLayer.addTo(this.map);
        
        // Layer control
        const baseLayers = {
            "Street View": streetLayer,
            "Satellite View": satelliteLayer
        };
        
        L.control.layers(baseLayers).addTo(this.map);
        L.control.scale().addTo(this.map);
        
        // Add click event for location info
        this.map.on('click', (e) => {
            this.showLocationInfo(e.latlng.lat, e.latlng.lng);
        });
    }
    
    setupLocationListener() {
        // Listen for location input from the dashboard form
        const locationInput = document.getElementById('location');
        if (locationInput) {
            locationInput.addEventListener('input', (e) => {
                const location = e.target.value;
                if (location.length > 3) {
                    this.searchAndNavigateToLocation(location);
                }
            });
        }
    }
    
    async searchAndNavigateToLocation(locationName) {
        try {
            // Use Nominatim API for geocoding (free OpenStreetMap service)
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                const location = data[0];
                const lat = parseFloat(location.lat);
                const lng = parseFloat(location.lon);
                
                // Navigate to location
                this.map.setView([lat, lng], 12);
                
                // Remove existing marker
                if (this.currentMarker) {
                    this.map.removeLayer(this.currentMarker);
                }
                
                // Add new marker
                this.currentMarker = L.marker([lat, lng]).addTo(this.map);
                this.currentMarker.bindPopup(`
                    <div class="location-popup">
                        <h6><i class="fas fa-map-marker-alt"></i> ${location.display_name}</h6>
                        <p><small>Click anywhere on map for detailed info</small></p>
                    </div>
                `).openPopup();
                
                // Show location information
                this.showLocationInfo(lat, lng, location.display_name);
            }
        } catch (error) {
            console.error('Error searching location:', error);
        }
    }
    
    async showLocationInfo(lat, lng, locationName = null) {
        const infoCard = document.getElementById('weatherDetailsCard');
        const infoContent = document.getElementById('weatherDetailsContent');
        
        console.log(`Showing location info for: ${lat}, ${lng}`);
        
        // Show loading
        infoContent.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2">Loading location information...</p>
            </div>
        `;
        infoCard.style.display = 'block';
        
        try {
            // Get weather data from backend
            console.log(`Fetching weather data from: /api/weather/${lat}/${lng}`);
            const response = await fetch(`/api/weather/${lat}/${lng}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('Weather API response:', result);
            
            if (result.success && result.data) {
                this.displayLocationInfo(result.data, lat, lng, locationName);
            } else if (result.data) {
                // Even if success is false, try to use the data
                this.displayLocationInfo(result.data, lat, lng, locationName);
            } else {
                console.log('No valid data, using mock data');
                this.displayMockLocationInfo(lat, lng, locationName);
            }
        } catch (error) {
            console.error('Error fetching location info:', error);
            this.displayMockLocationInfo(lat, lng, locationName);
        }
    }
    
    displayLocationInfo(data, lat, lng, locationName) {
        const infoContent = document.getElementById('weatherDetailsContent');
        
        // Generate soil information based on location
        const soilInfo = this.getSoilInfoForLocation(lat, lng);
        
        infoContent.innerHTML = `
            <div class="col-12 mb-3">
                <div class="location-header">
                    <h5><i class="fas fa-map-marker-alt text-primary"></i> ${locationName || data.location}</h5>
                    <small class="text-muted">Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}</small>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="info-card weather-card">
                    <h6><i class="fas fa-cloud-sun text-warning"></i> Weather Information</h6>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Temperature:</span>
                            <span class="info-value">${data.temperature}°C</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Humidity:</span>
                            <span class="info-value">${data.humidity}%</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Wind Speed:</span>
                            <span class="info-value">${data.windSpeed} m/s</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Conditions:</span>
                            <span class="info-value">${data.description}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="info-card soil-card">
                    <h6><i class="fas fa-seedling text-success"></i> Soil & Agriculture Info</h6>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Soil Type:</span>
                            <span class="info-value">${soilInfo.type}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">pH Level:</span>
                            <span class="info-value">${soilInfo.ph}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Best Crops:</span>
                            <span class="info-value">${soilInfo.crops}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Season:</span>
                            <span class="info-value">${soilInfo.season}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-12 mt-3">
                <div class="info-card recommendations-card">
                    <h6><i class="fas fa-lightbulb text-info"></i> Quick Recommendations</h6>
                    <ul class="recommendation-list">
                        <li>Current weather is ${data.description.toLowerCase()} - ${this.getWeatherRecommendation(data)}</li>
                        <li>Soil type (${soilInfo.type}) is suitable for ${soilInfo.crops}</li>
                        <li>Optimal planting season: ${soilInfo.season}</li>
                        <li>Consider ${data.humidity > 70 ? 'reducing irrigation' : 'adequate irrigation'} based on ${data.humidity}% humidity</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    displayMockLocationInfo(lat, lng, locationName) {
        const infoContent = document.getElementById('weatherDetailsContent');
        
        // Generate mock data
        const mockWeather = {
            temperature: Math.round(Math.random() * 20 + 15),
            humidity: Math.round(Math.random() * 40 + 40),
            windSpeed: Math.round(Math.random() * 10 + 2),
            description: ['Clear sky', 'Partly cloudy', 'Light clouds', 'Sunny'][Math.floor(Math.random() * 4)]
        };
        
        const soilInfo = this.getSoilInfoForLocation(lat, lng);
        
        infoContent.innerHTML = `
            <div class="col-12 mb-3">
                <div class="location-header">
                    <h5><i class="fas fa-map-marker-alt text-primary"></i> ${locationName || 'Selected Location'}</h5>
                    <small class="text-muted">Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}</small>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="info-card weather-card">
                    <h6><i class="fas fa-cloud-sun text-warning"></i> Weather Information</h6>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Temperature:</span>
                            <span class="info-value">${mockWeather.temperature}°C</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Humidity:</span>
                            <span class="info-value">${mockWeather.humidity}%</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Wind Speed:</span>
                            <span class="info-value">${mockWeather.windSpeed} m/s</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Conditions:</span>
                            <span class="info-value">${mockWeather.description}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="info-card soil-card">
                    <h6><i class="fas fa-seedling text-success"></i> Soil & Agriculture Info</h6>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Soil Type:</span>
                            <span class="info-value">${soilInfo.type}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">pH Level:</span>
                            <span class="info-value">${soilInfo.ph}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Best Crops:</span>
                            <span class="info-value">${soilInfo.crops}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Season:</span>
                            <span class="info-value">${soilInfo.season}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-12 mt-3">
                <div class="info-card recommendations-card">
                    <h6><i class="fas fa-lightbulb text-info"></i> Quick Recommendations</h6>
                    <ul class="recommendation-list">
                        <li>Current weather is ${mockWeather.description.toLowerCase()} - ${this.getWeatherRecommendation(mockWeather)}</li>
                        <li>Soil type (${soilInfo.type}) is suitable for ${soilInfo.crops}</li>
                        <li>Optimal planting season: ${soilInfo.season}</li>
                        <li>Consider ${mockWeather.humidity > 70 ? 'reducing irrigation' : 'adequate irrigation'} based on ${mockWeather.humidity}% humidity</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    getSoilInfoForLocation(lat, lng) {
        // Simple soil classification based on geographical location
        let soilType, ph, crops, season;
        
        // India regions
        if (lat >= 8 && lat <= 37 && lng >= 68 && lng <= 97) {
            if (lat >= 28) { // Northern India
                soilType = "Alluvial Soil";
                ph = "6.5-7.5";
                crops = "Wheat, Rice, Sugarcane";
                season = "Rabi & Kharif";
            } else if (lat >= 20) { // Central India
                soilType = "Black Soil";
                ph = "7.0-8.5";
                crops = "Cotton, Sugarcane, Wheat";
                season = "Kharif";
            } else { // Southern India
                soilType = "Red Soil";
                ph = "6.0-7.0";
                crops = "Rice, Millets, Groundnut";
                season = "Kharif & Rabi";
            }
        } else {
            // Default for other regions
            soilType = "Mixed Soil";
            ph = "6.0-7.5";
            crops = "Varies by region";
            season = "Seasonal";
        }
        
        return { type: soilType, ph, crops, season };
    }
    
    getWeatherRecommendation(weather) {
        if (weather.temperature > 35) {
            return "very hot, ensure adequate irrigation";
        } else if (weather.temperature < 10) {
            return "cold, protect crops from frost";
        } else if (weather.humidity > 80) {
            return "high humidity, watch for fungal diseases";
        } else if (weather.windSpeed > 15) {
            return "windy conditions, secure plant supports";
        } else {
            return "favorable conditions for farming";
        }
    }
}

// Global variable to store map instance
let weatherMapInstance = null;

// Test function to manually trigger weather data
function testWeatherData() {
    console.log('Testing weather data...');
    if (weatherMapInstance) {
        // Test with Hyderabad coordinates
        weatherMapInstance.showLocationInfo(17.3850, 78.4867, 'Hyderabad (Test)');
    } else {
        console.error('Weather map not initialized');
    }
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        weatherMapInstance = new WeatherMap();
        console.log('Weather map initialized');
    }, 1000);
});