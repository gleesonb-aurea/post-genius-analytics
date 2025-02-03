// Chart rendering functions
import { validateDate } from './utils.js';

/**
 * Default options for all charts
 * @type {Object}
 */
const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
        },
        tooltip: {
            callbacks: {
                title: function(tooltipItems) {
                    const dataPoint = tooltipItems[0].raw;
                    return dataPoint.title || '';
                },
                afterBody: function(tooltipItems) {
                    const dataPoint = tooltipItems[0].raw;
                    let extraInfo = [];
                    if (dataPoint.totalPosts) {
                        extraInfo.push(`Total Posts: ${dataPoint.totalPosts}`);
                    }
                    if (dataPoint.numTitles) {
                        extraInfo.push(`Unique Posts: ${dataPoint.numTitles}`);
                    }
                    if (dataPoint.numTags) {
                        extraInfo.push(`Tags Used: ${dataPoint.numTags}`);
                    }
                    if (dataPoint.numPlatforms) {
                        extraInfo.push(`Active Platforms: ${dataPoint.numPlatforms}`);
                    }
                    return extraInfo;
                }
            }
        }
    }
};

/**
 * Renders the engagement rate chart
 * @param {Array<Object>} data - Array of platform engagement data
 * @returns {Chart} Chart.js instance
 */
export function renderEngagementRateChart(data) {
    const ctx = document.getElementById('engagement-rate-chart').getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.platform),
            datasets: [{
                label: 'Engagement Score',
                data: data.map(d => d.engagementScore),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            ...defaultChartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Engagement Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Platform'
                    }
                }
            }
        }
    });
}

/**
 * Renders the time-based trends chart
 * @param {Array<Object>} data - Array of daily engagement data
 * @returns {Chart} Chart.js instance
 */
export function renderTimeBasedTrendsChart(data) {
    const ctx = document.getElementById('time-based-trends-chart').getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => validateDate(d.date)),
            datasets: [
                {
                    label: 'Avg Comments',
                    data: data.map(d => d.avgComments),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false
                },
                {
                    label: 'Avg Views',
                    data: data.map(d => d.avgViews),
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false
                },
                {
                    label: 'Avg Reactions',
                    data: data.map(d => d.avgReactions),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false
                }
            ]
        },
        options: {
            ...defaultChartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average Engagement'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    });
}

/**
 * Renders the post format performance chart
 * @param {Array<Object>} data - Array of content type performance data
 * @returns {Chart} Chart.js instance
 */
export function renderPostFormatChart(data) {
    const ctx = document.getElementById('post-format-chart').getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.format),
            datasets: [{
                label: 'Average Engagement',
                data: data.map(d => d.engagementScore),
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            ...defaultChartOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average Engagement'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Post Format'
                    }
                }
            }
        }
    });
}

/**
 * Renders the tag performance chart
 * @param {Array<Object>} data - Array of tag performance data
 * @returns {Chart} Chart.js instance
 */
export function renderTagChart(data) {
    const ctx = document.getElementById('tags-chart').getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.tag),
            datasets: [{
                label: 'Engagement Score',
                data: data.map(d => d.engagementScore),
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            ...defaultChartOptions,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Engagement Score'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Tag'
                    }
                }
            }
        }
    });
}

/**
 * Renders the creator performance chart
 * @param {Array<Object>} data - Array of creator performance data
 * @returns {Chart} Chart.js instance
 */
export function renderCreatorChart(data) {
    const ctx = document.getElementById('creator-chart').getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.creator),
            datasets: [{
                label: 'Engagement Score',
                data: data.map(d => d.engagementScore),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            ...defaultChartOptions,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Engagement Score'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Creator'
                    }
                }
            }
        }
    });
}

/**
 * Renders the schedule impact heatmap
 * @param {Object} data - Schedule impact data
 * @returns {Chart} Chart.js instance
 */
export function renderScheduleImpactChart(data) {
    const ctx = document.getElementById('schedule-chart').getContext('2d');
    
    // Create datasets for the heatmap
    const datasets = [{
        label: 'Engagement Score',
        data: data.data.flatMap((dayData, dayIndex) => 
            dayData.map((value, hour) => ({
                x: hour,
                y: dayIndex,
                v: value || 0
            }))
        ),
        backgroundColor(context) {
            const value = context.dataset.data[context.dataIndex].v;
            const alpha = Math.min(value / 100, 1); // Normalize based on max engagement
            return `rgba(153, 102, 255, ${alpha})`;
        },
        borderWidth: 1,
        borderColor: 'white',
        width: ({ chart }) => (chart.chartArea || {}).width / 24 - 1,
        height: ({ chart }) => (chart.chartArea || {}).height / 7 - 1
    }];

    return new Chart(ctx, {
        type: 'matrix',
        data: {
            labels: data.days,
            datasets
        },
        options: {
            ...defaultChartOptions,
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    offset: true,
                    min: -0.5,
                    max: 23.5,
                    position: 'top',
                    ticks: {
                        stepSize: 1,
                        callback: value => `${value}:00`
                    },
                    title: {
                        display: true,
                        text: 'Hour of Day'
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    type: 'linear',
                    offset: true,
                    min: -0.5,
                    max: 6.5,
                    position: 'left',
                    ticks: {
                        stepSize: 1,
                        callback: value => data.days[value]
                    },
                    title: {
                        display: true,
                        text: 'Day of Week'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: context => {
                            const point = context[0];
                            const day = data.days[point.raw.y];
                            const hour = point.raw.x;
                            return `${day} at ${hour}:00`;
                        },
                        label: context => {
                            const value = context.raw.v;
                            return `Average Engagement: ${value.toFixed(2)}`;
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Renders the comment impact chart
 * @param {Array<Object>} data - Array of comment impact data
 * @returns {Chart} Chart.js instance
 */
export function renderCommentImpactChart(data) {
    const ctx = document.getElementById('comment-impact-chart').getContext('2d');
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.label),
            datasets: [
                {
                    label: 'Average Engagement',
                    data: data.map(d => d.avgEngagement),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Post Distribution (%)',
                    data: data.map(d => d.percentage),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            ...defaultChartOptions,
            plugins: {
                ...defaultChartOptions.plugins,
                tooltip: {
                    callbacks: {
                        afterBody: function(tooltipItems) {
                            const dataPoint = data[tooltipItems[0].dataIndex];
                            return [
                                `Posts in Range: ${dataPoint.postCount}`,
                                `Unique Posts: ${dataPoint.uniqueTitles}`,
                                `Distribution: ${dataPoint.percentage.toFixed(1)}%`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Average Engagement'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Post Distribution (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}