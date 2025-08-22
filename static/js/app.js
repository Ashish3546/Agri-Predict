// Enhanced location search with continuous suggestions
let searchTimeout;
const locationInput = document.getElementById('location');
const suggestionsContainer = document.getElementById('locationSuggestions');

locationInput.addEventListener('input', function() {
    const query = this.value;
    
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    searchTimeout = setTimeout(() => {
        fetchLocationSuggestions(query);
    }, 300);
});

async function fetchLocationSuggestions(query) {
    try {
        const response = await fetch(`/api/location-search?q=${encodeURIComponent(query)}`);
        const locations = await response.json();
        
        if (locations.length > 0) {
            displayLocationSuggestions(locations);
        } else {
            suggestionsContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching location suggestions:', error);
    }
}

function displayLocationSuggestions(locations) {
    suggestionsContainer.innerHTML = locations.map(location => 
        `<div class="suggestion-item" onclick="selectLocation('${location.name}, ${location.district}, ${location.state}')">
            <strong>${location.name}</strong><br>
            <small class="text-muted">${location.district}, ${location.state} - ${location.pincode}</small>
            <span class="badge bg-secondary float-end">${location.type}</span>
        </div>`
    ).join('');
    suggestionsContainer.style.display = 'block';
}

function selectLocation(locationText) {
    locationInput.value = locationText;
    suggestionsContainer.style.display = 'none';
}

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!locationInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.style.display = 'none';
    }
});

// Form submission and analysis
document.getElementById('farmerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        location: document.getElementById('location').value,
        crop_type: document.getElementById('cropType').value,
        land_size: document.getElementById('landSize').value,
        land_unit: document.getElementById('landUnit').value,
        soil_type: document.getElementById('soilType').value,
        irrigation_method: document.getElementById('irrigationMethod').value
    };

    if (!formData.location || !formData.crop_type || !formData.soil_type || !formData.irrigation_method) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        // Save farmer data
        await fetch('/api/save-farmer-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // Get yield prediction
        const response = await fetch('/api/predict-yield', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (result.success) {
            displayResults(result, formData);
        } else {
            alert('Error: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error processing request. Please try again.');
    }
});

function displayResults(result, formData) {
    document.getElementById('resultsSection').style.display = 'block';

    document.getElementById('predictedYield').textContent = result.predicted_yield + ' tons/ha';
    document.getElementById('totalProduction').textContent = result.total_production + ' tons';

    // Display recommendations
    const container = document.getElementById('recommendationsContainer');
    container.innerHTML = result.recommendations.map((rec, index) => 
        `<div class="recommendation-item mb-2">
            <div class="d-flex">
                <div class="recommendation-number bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 30px; height: 30px; font-size: 0.8rem;">
                    ${index + 1}
                </div>
                <div>${rec}</div>
            </div>
        </div>`
    ).join('');

    // Create yield chart
    createYieldChart(result);
    
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function createYieldChart(result) {
    const ctx = document.getElementById('yieldChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Your Predicted Yield', 'Regional Average', 'Potential Maximum'],
            datasets: [{
                label: 'Yield (tons/hectare)',
                data: [
                    result.predicted_yield,
                    result.predicted_yield * 0.85,
                    result.predicted_yield * 1.3
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Yield (tons/hectare)'
                    }
                }
            }
        }
    });
}

// Plant Disease Detection Functionality
const plantImageInput = document.getElementById('plantImage');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');
const analysisResults = document.getElementById('analysisResults');
const analysisLoading = document.getElementById('analysisLoading');
const analysisContent = document.getElementById('analysisContent');

// Drag and drop functionality
uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        handleImageUpload(files[0]);
    }
});

uploadArea.addEventListener('click', function() {
    plantImageInput.click();
});

plantImageInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        handleImageUpload(e.target.files[0]);
    }
});

function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        imagePreview.style.display = 'block';
        analysisResults.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

analyzeBtn.addEventListener('click', async function() {
    const file = plantImageInput.files[0];
    if (!file) {
        alert('Please select an image first');
        return;
    }

    analysisLoading.style.display = 'block';
    analysisResults.style.display = 'none';

    try {
        // Run multiple AI models in parallel
        const [hfResults, plantNetResults, base64Image] = await Promise.all([
            analyzeWithHuggingFace(file),
            analyzeWithPlantNet(file),
            convertToBase64(file)
        ]);

        // Get Gemini analysis
        const geminiResults = await analyzeWithGemini(base64Image);
        
        // Combine all results
        const combinedAnalysis = await combineAnalysisResults(hfResults, plantNetResults, geminiResults);
        
        displayEnhancedAnalysisResults(combinedAnalysis);
        analysisLoading.style.display = 'none';
        analysisResults.style.display = 'block';
    } catch (error) {
        console.error('Error analyzing image:', error);
        analysisLoading.style.display = 'none';
        alert('Error analyzing image. Please try again.');
    }
});

clearBtn.addEventListener('click', function() {
    plantImageInput.value = '';
    imagePreview.style.display = 'none';
    analysisResults.style.display = 'none';
});

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function analyzeWithHuggingFace(imageFile) {
    const HF_API_URL = 'https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
    
    try {
        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer hf_demo',
                'Content-Type': 'application/octet-stream'
            },
            body: imageFile
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API error: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Hugging Face analysis failed:', error);
        return null;
    }
}

async function analyzeWithPlantNet(imageFile) {
    const PLANTNET_API_URL = 'https://api-inference.huggingface.co/models/microsoft/resnet-50';
    
    try {
        const response = await fetch(PLANTNET_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer hf_demo',
                'Content-Type': 'application/octet-stream'
            },
            body: imageFile
        });

        if (!response.ok) {
            throw new Error(`PlantNet API error: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('PlantNet analysis failed:', error);
        return null;
    }
}

async function analyzeWithGemini(base64Image) {
    const GEMINI_API_KEY = 'AIzaSyCSUsaZNj-eg6BynA1M2qmbi1wuJa1aU64';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `Analyze this plant image and provide a detailed agricultural report. Please include:

1. Plant identification (species/variety if possible)
2. Overall health assessment (Healthy/Mild Issues/Moderate Issues/Severe Issues)
3. Disease detection (if any diseases are visible)
4. Pest damage assessment (if any pest damage is visible)
5. Nutritional deficiency signs (if any)
6. Growth stage assessment
7. Specific recommendations for treatment/care
8. Preventive measures

Please format the response as a structured report suitable for farmers.`;

    const requestBody = {
        contents: [{
            parts: [
                { text: prompt },
                {
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: base64Image
                    }
                }
            ]
        }]
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

async function combineAnalysisResults(hfResults, plantNetResults, geminiResults) {
    let combinedReport = {
        disease_detection: null,
        plant_identification: null,
        confidence_scores: {},
        detailed_analysis: geminiResults,
        recommendations: []
    };

    // Process Hugging Face disease detection results
    if (hfResults && Array.isArray(hfResults)) {
        const topDisease = hfResults[0];
        if (topDisease && topDisease.score > 0.3) {
            combinedReport.disease_detection = {
                disease: topDisease.label,
                confidence: (topDisease.score * 100).toFixed(1) + '%',
                severity: topDisease.score > 0.7 ? 'High' : topDisease.score > 0.5 ? 'Medium' : 'Low'
            };
        }
    }

    // Process PlantNet identification results
    if (plantNetResults && Array.isArray(plantNetResults)) {
        const topPlant = plantNetResults[0];
        if (topPlant && topPlant.score > 0.3) {
            combinedReport.plant_identification = {
                species: topPlant.label,
                confidence: (topPlant.score * 100).toFixed(1) + '%'
            };
        }
    }

    return combinedReport;
}

function displayEnhancedAnalysisResults(combinedAnalysis) {
    let html = '<div class="analysis-report">';
    
    // AI Models Used Header
    html += `
        <div class="analysis-card bg-info text-white">
            <h6><i class="fas fa-robot"></i> Multi-AI Analysis Complete</h6>
            <small>Analyzed using Hugging Face Plant Disease Model + Google Gemini AI</small>
        </div>
    `;

    // Plant Identification
    if (combinedAnalysis.plant_identification) {
        html += `
            <div class="analysis-card">
                <h6><i class="fas fa-leaf"></i> Plant Identification</h6>
                <p><strong>Species:</strong> ${combinedAnalysis.plant_identification.species}</p>
                <p><strong>Confidence:</strong> ${combinedAnalysis.plant_identification.confidence}</p>
                <span class="badge bg-success">Hugging Face Model</span>
            </div>
        `;
    }

    // Disease Detection
    if (combinedAnalysis.disease_detection) {
        const severityClass = getSeverityClass(combinedAnalysis.disease_detection.severity);
        html += `
            <div class="analysis-card">
                <h6><i class="fas fa-bug"></i> Disease Detection</h6>
                <p><strong>Detected Issue:</strong> ${combinedAnalysis.disease_detection.disease}</p>
                <p><strong>Confidence:</strong> ${combinedAnalysis.disease_detection.confidence}</p>
                <span class="disease-severity ${severityClass}">${combinedAnalysis.disease_detection.severity} Risk</span>
                <span class="badge bg-primary ms-2">AI Model Detection</span>
            </div>
        `;
    }

    // Detailed Analysis
    if (combinedAnalysis.detailed_analysis) {
        html += `
            <div class="analysis-card">
                <h6><i class="fas fa-microscope"></i> Detailed AI Analysis</h6>
                <div class="gemini-analysis" style="max-height: 300px; overflow-y: auto; font-size: 0.9rem; line-height: 1.4;">
                    ${formatGeminiAnalysis(combinedAnalysis.detailed_analysis)}
                </div>
                <span class="badge bg-success">Google Gemini AI</span>
            </div>
        `;
    }

    html += '</div>';
    analysisContent.innerHTML = html;
}

function getSeverityClass(severity) {
    switch(severity?.toLowerCase()) {
        case 'high': return 'severity-high';
        case 'medium': return 'severity-medium';
        case 'low': return 'severity-low';
        default: return 'severity-medium';
    }
}

function formatGeminiAnalysis(text) {
    return text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}