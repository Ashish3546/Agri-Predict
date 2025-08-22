from flask import Flask, render_template, request, jsonify
import json
import os
import random
from datetime import datetime

app = Flask(__name__)

# Google Earth Engine API Key
GEE_API_KEY = "AIzaSyCcOUNfaJiI-SsomExjw2FXW86eFiuEhMI"

# Mock MongoDB storage
farmer_data = []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/location-search')
def location_search():
    query = request.args.get('q', '')
    if len(query) < 2:
        return jsonify([])
    
    locations = [
        {"name": "Kharkhoda", "district": "Sonipat", "state": "Haryana", "pincode": "131402", "type": "village"},
        {"name": "Bahadurgarh", "district": "Jhajjar", "state": "Haryana", "pincode": "124507", "type": "city"},
        {"name": "Panipat", "district": "Panipat", "state": "Haryana", "pincode": "132103", "type": "city"},
        {"name": "Karnal", "district": "Karnal", "state": "Haryana", "pincode": "132001", "type": "city"},
        {"name": "Ambala", "district": "Ambala", "state": "Haryana", "pincode": "134003", "type": "city"}
    ]
    
    filtered = [loc for loc in locations if 
                query.lower() in loc['name'].lower() or 
                query.lower() in loc['district'].lower() or 
                query.lower() in loc['state'].lower()]
    
    return jsonify(filtered[:10])

@app.route('/api/save-farmer-data', methods=['POST'])
def save_farmer_data():
    try:
        data = request.json
        data['timestamp'] = datetime.now().isoformat()
        data['id'] = len(farmer_data) + 1
        farmer_data.append(data)
        
        return jsonify({'success': True, 'message': 'Data saved successfully', 'id': data['id']})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/predict-yield', methods=['POST'])
def predict_yield():
    try:
        data = request.json
        
        base_yields = {
            'rice': 5.5, 'wheat': 4.2, 'maize': 7.0, 
            'cotton': 2.8, 'sugarcane': 85, 'soybean': 3.2
        }
        
        base_yield = base_yields.get(data.get('crop_type', 'wheat'), 5.0)
        
        multiplier = 1.0
        if data.get('soil_type') == 'loamy':
            multiplier *= 1.1
        if data.get('irrigation_method') == 'drip':
            multiplier *= 1.15
            
        predicted_yield = base_yield * multiplier
        land_size = float(data.get('land_size', 1))
        total_production = predicted_yield * land_size
        
        return jsonify({
            'success': True,
            'predicted_yield': round(predicted_yield, 2),
            'total_production': round(total_production, 2),
            'recommendations': [
                f"Expected yield: {predicted_yield:.1f} tons/hectare",
                f"Total production: {total_production:.1f} tons",
                "Apply balanced fertilizer based on soil test",
                "Monitor crop health regularly",
                "Ensure proper irrigation scheduling"
            ]
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/analyze-plant', methods=['POST'])
def analyze_plant():
    try:
        return jsonify({'success': True, 'message': 'Analysis endpoint ready'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/api/weather-config')
def weather_config():
    # Return weather API configuration
    return jsonify({
        'apiKey': 'demo_key',
        'message': 'Using mock weather data for demonstration'
    })

@app.route('/api/weather/<lat>/<lng>')
def get_weather(lat, lng):
    try:
        print(f"Weather API called for coordinates: {lat}, {lng}")
        
        # Generate realistic weather data based on location
        lat_f = float(lat)
        lng_f = float(lng)
        
        # Determine location name based on coordinates (India focus)
        location_name = "Unknown Location"
        if 28.5 <= lat_f <= 28.7 and 77.1 <= lng_f <= 77.3:
            location_name = "Delhi"
        elif 19.0 <= lat_f <= 19.2 and 72.8 <= lng_f <= 73.0:
            location_name = "Mumbai"
        elif 12.9 <= lat_f <= 13.0 and 77.5 <= lng_f <= 77.7:
            location_name = "Bangalore"
        elif 17.3 <= lat_f <= 17.4 and 78.4 <= lng_f <= 78.5:
            location_name = "Hyderabad"
        elif 13.0 <= lat_f <= 13.1 and 80.2 <= lng_f <= 80.3:
            location_name = "Chennai"
        
        # Base temperature on latitude (closer to equator = warmer)
        base_temp = 35 - abs(lat_f) * 0.8
        temperature = round(base_temp + random.uniform(-3, 8), 1)
        
        # Generate other weather parameters
        weather_data = {
            'location': f"{location_name} ({lat}, {lng})",
            'temperature': max(15, min(45, temperature)),  # Realistic range
            'humidity': random.randint(45, 85),
            'pressure': random.randint(995, 1020),
            'windSpeed': round(random.uniform(1, 15), 1),
            'windDirection': random.randint(0, 360),
            'visibility': round(random.uniform(5, 20), 1),
            'uvIndex': random.randint(2, 11),
            'cloudCover': random.randint(5, 90),
            'precipitation': round(random.uniform(0, 5), 1),
            'description': random.choice([
                'Clear sky', 'Partly cloudy', 'Scattered clouds', 
                'Light breeze', 'Sunny', 'Overcast', 'Light rain',
                'Mostly sunny', 'Few clouds'
            ])
        }
        
        print(f"Generated weather data: {weather_data}")
        
        return jsonify({
            'success': True,
            'data': weather_data
        })
        
    except Exception as e:
        print(f"Error in weather API: {str(e)}")
        return jsonify({
            'success': False, 
            'error': str(e),
            'data': {
                'location': f"Error Location ({lat}, {lng})",
                'temperature': 25.0,
                'humidity': 60,
                'pressure': 1013,
                'windSpeed': 5.0,
                'windDirection': 180,
                'visibility': 10.0,
                'uvIndex': 5,
                'cloudCover': 50,
                'precipitation': 0.0,
                'description': 'Data unavailable'
            }
        })

# For Vercel deployment
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=3002)
else:
    # This is for Vercel
    app = app