import { 
    processEngagementRate, 
    processTimeBasedTrends, 
    processPostFormatPerformance,
    processTagPerformance,
    processCreatorPerformance,
    processScheduleImpact,
    processCommentImpact
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

// Wait for PapaParse to load
const loadPapaParse = () => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Update the loadChartJs function in main.js
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

// Initialize chart instances
let charts = {
    engagementRate: null,
    timeBasedTrends: null,
    postFormat: null,
    tags: null,
    creator: null,
    schedule: null,
    commentImpact: null
};

// Initialize the application
async function init() {
    try {
        // Load required libraries
        await Promise.all([
            loadPapaParse(),
            loadChartJs()
        ]);
        
        console.log('Libraries loaded successfully');

        // Handle file upload
        const fileInput = document.getElementById('csv-upload');
        if (!fileInput) {
            throw new Error('File input element not found. Make sure the HTML has an element with id="csv-upload"');
        }

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            console.log('Processing file:', file.name);

            try {
                const results = await new Promise((resolve, reject) => {
                    Papa.parse(file, {
                        header: true,
                        dynamicTyping: true,
                        complete: resolve,
                        error: reject
                    });
                });

                console.log('Raw data:', results.data);
                
                const validatedData = validateData(results.data);
                console.log('Validated data:', validatedData);
                
                const processedData = {
                    engagementRate: processEngagementRate(validatedData),
                    timeBasedTrends: processTimeBasedTrends(validatedData),
                    postFormat: processPostFormatPerformance(validatedData),
                    tags: processTagPerformance(validatedData),
                    creator: processCreatorPerformance(validatedData),
                    schedule: processScheduleImpact(validatedData),
                    commentImpact: processCommentImpact(validatedData)
                };
                
                console.log('Processed data:', processedData);
                renderVisualizations(processedData);
                
            } catch (error) {
                console.error('Error processing data:', error);
                alert(`Error processing data: ${error.message}`);
            }
        });
        
    } catch (error) {
        console.error('Error initializing application:', error);
        alert('Error initializing application. Please check the console for details.');
    }
}

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
    charts.postFormat = renderPostFormatChart(data.postFormat);
    charts.tags = renderTagChart(data.tags);
    charts.creator = renderCreatorChart(data.creator);
    charts.schedule = renderScheduleImpactChart(data.schedule);
    charts.commentImpact = renderCommentImpactChart(data.commentImpact);
}

// Start the application
init();
