# AgriPredict - Smart Farming Solutions

AgriPredict is an AI-powered agricultural platform that helps farmers make data-driven decisions using satellite imagery, weather data, and machine learning predictions.

## Features

- **Crop Yield Prediction**: AI-powered yield forecasting based on location, soil type, and weather conditions
- **Plant Disease Detection**: Multi-AI analysis using Hugging Face models and Google Gemini AI
- **Interactive World Map**: Street-level zoom with location-based agricultural information
- **Soil Analysis**: Comprehensive soil type classification and crop recommendations
- **Weather Integration**: Real-time weather data with farming recommendations
- **Agricultural Knowledge Base**: Essential information about soil types and irrigation methods

## Technology Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Maps**: Leaflet.js with OpenStreetMap
- **AI/ML**: 
  - Google Gemini AI for plant disease analysis
  - Hugging Face models for plant identification
  - Custom yield prediction algorithms
- **Data Sources**:
  - Google Earth Engine API
  - Kaggle agricultural datasets
  - OpenWeatherMap API

## Deployment

This application is deployed on Vercel and can be accessed at: [Your Vercel URL]

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/Ashish3546/Agri-Predict.git
cd Agri-Predict
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

4. Open your browser and navigate to `http://localhost:3002`

## API Endpoints

- `GET /` - Main dashboard
- `GET /api/location-search?q={query}` - Location search with autocomplete
- `POST /api/save-farmer-data` - Save farmer input data
- `POST /api/predict-yield` - Get crop yield predictions
- `GET /api/weather/{lat}/{lng}` - Get weather data for coordinates
- `GET /api/weather-config` - Get weather API configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact: [Your Email]