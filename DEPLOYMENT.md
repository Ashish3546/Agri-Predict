# Deployment Guide for AgriPredict

## Vercel Deployment

### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy when you push to the `main` branch
3. The `vercel.json` configuration file handles the deployment settings

### Manual Deployment Steps
1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy: `vercel --prod`

### Environment Variables in Vercel
Set these in your Vercel dashboard under Settings > Environment Variables:
- `FLASK_ENV=production`
- `OPENWEATHER_API_KEY=your_key` (optional)
- `GEMINI_API_KEY=your_key` (optional)

## Local Development

### Prerequisites
- Python 3.8+
- Git

### Setup
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

4. Open http://localhost:3002

## Making Updates

### Using the Deployment Script (Windows)
1. Make your changes to the code
2. Run `deploy.bat`
3. Enter a commit message
4. The script will automatically push to GitHub and trigger Vercel deployment

### Manual Git Commands
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## Project Structure
```
AgriPredict/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── vercel.json           # Vercel deployment configuration
├── static/               # Static assets
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       ├── app.js        # Dashboard functionality
│       └── weather-map.js # Map and weather features
├── templates/
│   └── index.html        # Main HTML template
└── README.md             # Project documentation
```

## Features Deployed
- ✅ Crop Yield Prediction
- ✅ Plant Disease Detection (AI-powered)
- ✅ Interactive World Map
- ✅ Weather Integration
- ✅ Soil Analysis
- ✅ Agricultural Knowledge Base
- ✅ Location-based Recommendations

## Troubleshooting

### Common Issues
1. **Build Fails**: Check `requirements.txt` for correct dependencies
2. **Static Files Not Loading**: Ensure proper Flask static file configuration
3. **API Errors**: Check if environment variables are set correctly in Vercel

### Logs
- View deployment logs in Vercel dashboard
- Check browser console for JavaScript errors
- Use `vercel logs` command for detailed logs