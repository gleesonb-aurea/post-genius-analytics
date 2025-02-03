import { 
    processEngagementRate, 
    processTimeBasedTrends, 
    processPostFormatPerformance,
    processTagPerformance,
    processCreatorPerformance,
    processScheduleImpact,
    processCommentImpact,
    generateAnalysisPrompts
} from './dataProcessing.js';

import { 
    renderEngagementRateChart, 
    renderTimeBasedTrendsChart, 
    renderPostFormatChart,
    renderTagChart,
    renderCreatorChart,
    renderScheduleImpactChart,
    renderCommentImpactChart
} from './chartRendering.js';

import { validateData } from './utils.js';
import { getLLMAnalysis, setApiKey } from './llmService.js';

// Global state
let currentData = null;
let charts = {};

// Wait for PapaParse to load
const loadPapaParse = () => {
    return new Promise((resolve, reject) => {
        if (window.Papa) {
            resolve();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        }
    });
};

// Wait for Chart.js and plugins to load
const loadChartJs = async () => {
    // Load Chart.js first
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.2.1/dist/chart.umd.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });

    // Then load matrix plugin
    await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chartjs-chart-matrix@2.0.0';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Initialize the application
const init = () => {
    Promise.all([loadPapaParse(), loadChartJs()]).then(() => {
        setupFileUpload();
        setupAIAnalysis();
    });
};

// Set up AI analysis functionality
const setupAIAnalysis = () => {
    const aiButton = document.getElementById('get-ai-analysis');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveKeyButton = document.getElementById('save-api-key');

    // Check for saved API key
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
        setApiKey(savedApiKey);
        apiKeyInput.value = '********'; // Show placeholder for saved key
    }

    saveKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey && apiKey !== '********') {
            localStorage.setItem('openai_api_key', apiKey);
            setApiKey(apiKey);
            apiKeyInput.value = '********';
        }
    });

    apiKeyInput.addEventListener('focus', () => {
        if (apiKeyInput.value === '********') {
            apiKeyInput.value = '';
        }
    });

    aiButton.addEventListener('click', () => {
        const savedApiKey = localStorage.getItem('openai_api_key');
        if (savedApiKey) {
            performAIAnalysis(savedApiKey);
        } else {
            document.getElementById('analysis-content').innerHTML = 
                '<div class="error">Please save your OpenAI API key first.</div>';
        }
    });
};

// Perform AI analysis
const performAIAnalysis = async (apiKey) => {
    try {
        setApiKey(apiKey);
        document.getElementById('loading-spinner').style.display = 'block';
        const prompt = generateAnalysisPrompts(currentData);
        const analysis = await getLLMAnalysis(prompt);
        document.getElementById('analysis-content').innerHTML = marked.parse(analysis);
    } catch (error) {
        console.error('Error getting LLM analysis:', error);
        document.getElementById('analysis-content').innerHTML = 
            '<div class="error">Failed to get AI analysis. Please try again later.</div>';
    } finally {
        document.getElementById('loading-spinner').style.display = 'none';
    }
};

// Set up file upload functionality
const setupFileUpload = () => {
    const fileInput = document.getElementById('csv-upload');
    
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        
        if (file) {
            try {
                const results = await new Promise((resolve, reject) => {
                    Papa.parse(file, {
                        header: true,
                        complete: resolve,
                        error: reject
                    });
                });
                
                console.log('Raw API response:', results);
                console.log('Raw data property:', results.data);
                const validatedData = validateData(results.data);
                console.log('Validated data structure:', validatedData);
                
                // Store the validated data for later use
                currentData = validatedData;
                
                const processedData = {
                    engagementRate: processEngagementRate(validatedData),
                    timeBasedTrends: processTimeBasedTrends(validatedData),
                    formatPerformance: processPostFormatPerformance(validatedData),
                    tagPerformance: processTagPerformance(validatedData),
                    creatorPerformance: processCreatorPerformance(validatedData),
                    scheduleImpact: processScheduleImpact(validatedData),
                    commentImpact: processCommentImpact(validatedData)
                };
                
                console.log('Processed data:', processedData);
                renderVisualizations(processedData);
                
                // Enable AI analysis button after data is loaded
                document.getElementById('get-ai-analysis').disabled = false;
                
            } catch (error) {
                console.error('Error processing data:', error);
                displayErrorMessage('Invalid data format. Please check your input file.');
            }
        }
    });
};

function renderVisualizations(data) {
    if (!data) {
        console.error('No data provided for visualization');
        return;
    }

    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });

    // Create new charts
    charts.engagementRate = renderEngagementRateChart(data.engagementRate);
    charts.timeBasedTrends = renderTimeBasedTrendsChart(data.timeBasedTrends);
    charts.postFormat = renderPostFormatChart(data.formatPerformance);
    charts.tags = renderTagChart(data.tagPerformance);
    charts.creator = renderCreatorChart(data.creatorPerformance);
    charts.schedule = renderScheduleImpactChart(data.scheduleImpact);
    charts.commentImpact = renderCommentImpactChart(data.commentImpact);
}

function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
    } else {
        const newErrorMessageElement = document.createElement('div');
        newErrorMessageElement.id = 'error-message';
        newErrorMessageElement.textContent = message;
        document.body.appendChild(newErrorMessageElement);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
