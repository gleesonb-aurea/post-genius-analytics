import { calculateMetrics, validateDate, validateData } from './utils.js';

/**
 * Processes engagement rate metrics by platform
 * @param {Array<Object>} data - Array of validated social media post data
 * @returns {Object} Object containing engagement metrics by platform
 */
export function processEngagementRate(data) {
    if (!Array.isArray(data)) {
        throw new Error('Expected data to be an array');
    }
    const platformStats = new Map();

    data.forEach(post => {
        // Normalize platform names
        const platform = normalizePlatformName(post.platform);
        
        if (!platformStats.has(platform)) {
            platformStats.set(platform, {
                totalPosts: 0,
                totalEngagement: 0
            });
        }

        const stats = platformStats.get(platform);
        stats.totalPosts++;
        stats.totalEngagement += calculateMetrics(post).engagementScore;
    });

    return Array.from(platformStats.entries())
        .map(([platform, stats]) => ({
            platform,
            engagementScore: stats.totalEngagement / stats.totalPosts,
            totalPosts: stats.totalPosts
        }))
        .sort((a, b) => b.engagementScore - a.engagementScore);
}

function normalizePlatformName(platform) {
    const name = platform.toLowerCase().trim();
    // Normalize X/Twitter to a single name
    if (name === 'x' || name === 'twitter') {
        return 'twitter';
    }
    return name;
}

/**
 * Processes time-based engagement trends
 * @param {Array<Object>} data - Array of validated social media post data
 * @returns {Array<Object>} Array of daily engagement metrics sorted by date
 */
export function processTimeBasedTrends(data) {
    const trends = {};

    data.forEach(post => {
        const date = validateDate(post.post_created_at);
        if (!trends[date]) {
            trends[date] = {
                totalComments: 0,
                totalViews: 0,
                totalReactions: 0,
                totalPosts: 0,
                platforms: new Set(),
                creators: new Set(),
                scheduleWeeks: [],
                firstCommentTimes: []
            };
        }

        trends[date].totalComments += post.n_comments || 0;
        trends[date].totalViews += post.n_views || 0;
        trends[date].totalReactions += post.n_reactions || 0;
        trends[date].totalPosts++;
        trends[date].platforms.add(normalizePlatformName(post.platform));
        
        if (post.owner_email) {
            trends[date].creators.add(post.owner_email);
        }
        if (post.schedule_weeks_ahead) {
            trends[date].scheduleWeeks.push(post.schedule_weeks_ahead);
        }
        if (post.first_comment && post.post_created_at) {
            const timeDiff = new Date(post.first_comment) - new Date(post.post_created_at);
            if (timeDiff > 0) {
                trends[date].firstCommentTimes.push(timeDiff / (1000 * 60)); // Convert to minutes
            }
        }
    });

    return Object.entries(trends)
        .map(([date, stats]) => ({
            date,
            avgComments: stats.totalComments / stats.totalPosts,
            avgViews: stats.totalViews / stats.totalPosts,
            avgReactions: stats.totalReactions / stats.totalPosts,
            numPlatforms: stats.platforms.size,
            numCreators: stats.creators.size,
            avgScheduleWeeks: stats.scheduleWeeks.length > 0 ? 
                stats.scheduleWeeks.reduce((a, b) => a + b, 0) / stats.scheduleWeeks.length : 0,
            avgFirstCommentTime: stats.firstCommentTimes.length > 0 ?
                stats.firstCommentTimes.reduce((a, b) => a + b, 0) / stats.firstCommentTimes.length : 0,
            totalPosts: stats.totalPosts
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Analyzes post performance based on content type and tags
 * @param {Array<Object>} data - Array of validated social media post data
 * @returns {Array<Object>} Array of content type performance metrics
 */
export function processPostFormatPerformance(data) {
    const contentTypes = {};

    data.forEach(post => {
        // Determine content type
        const contentType = post.content.includes('http') ? 'Link' :
                          post.content.includes('img') || post.content.includes('video') ? 'Media' : 'Text';
        
        // Get tags if available
        const tags = post.family_tags ? post.family_tags.split(',').map(t => t.trim()) : [];
        
        if (!contentTypes[contentType]) {
            contentTypes[contentType] = {
                totalPosts: 0,
                totalEngagement: 0,
                avgScheduleWeeks: 0,
                totalScheduleWeeks: 0,
                tags: new Map(),
                services: new Set(),
                creators: new Set(),
                titles: new Set()
            };
        }

        contentTypes[contentType].totalPosts++;
        contentTypes[contentType].totalEngagement += 
            (post.n_views || 0) * 0.5 + 
            (post.n_comments || 0) * 2 + 
            (post.n_reactions || 0) * 1;
            
        if (post.schedule_weeks_ahead) {
            contentTypes[contentType].totalScheduleWeeks += post.schedule_weeks_ahead;
        }
        if (post.ext_post_service) {
            contentTypes[contentType].services.add(post.ext_post_service);
        }
        if (post.owner_email) {
            contentTypes[contentType].creators.add(post.owner_email);
        }
        if (post.title) {
            contentTypes[contentType].titles.add(post.title);
        }
        
        // Track tag performance
        tags.forEach(tag => {
            if (!contentTypes[contentType].tags.has(tag)) {
                contentTypes[contentType].tags.set(tag, {
                    count: 0,
                    totalEngagement: 0
                });
            }
            const tagStats = contentTypes[contentType].tags.get(tag);
            tagStats.count++;
            tagStats.totalEngagement += 
                (post.n_views || 0) * 0.5 + 
                (post.n_comments || 0) * 2 + 
                (post.n_reactions || 0) * 1;
        });
    });

    return Object.entries(contentTypes).map(([type, stats]) => ({
        format: type,
        engagementScore: stats.totalEngagement / stats.totalPosts,
        avgScheduleWeeks: stats.totalScheduleWeeks / stats.totalPosts,
        numServices: stats.services.size,
        numCreators: stats.creators.size,
        numTitles: stats.titles.size,
        topTags: Array.from(stats.tags.entries())
            .map(([tag, tagStats]) => ({
                tag,
                engagementScore: tagStats.totalEngagement / tagStats.count,
                count: tagStats.count
            }))
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, 5),
        totalPosts: stats.totalPosts
    }));
}

/**
 * Processes tag performance data
 * @param {Array<Object>} data - Array of validated social media post data
 * @returns {Array<Object>} Array of tag performance metrics
 */
export function processTagPerformance(data) {
    const tagStats = new Map();

    data.forEach(post => {
        const tags = post.tags || [];
        const engagement = calculateMetrics(post).engagementScore;

        tags.forEach(tag => {
            if (!tagStats.has(tag)) {
                tagStats.set(tag, {
                    totalPosts: 0,
                    totalEngagement: 0
                });
            }
            const stats = tagStats.get(tag);
            stats.totalPosts++;
            stats.totalEngagement += engagement;
        });
    });

    return Array.from(tagStats.entries())
        .map(([tag, stats]) => ({
            tag,
            engagementScore: stats.totalEngagement / stats.totalPosts,
            totalPosts: stats.totalPosts
        }))
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 10); // Top 10 tags
}

/**
 * Processes creator performance data
 * @param {Array<Object>} data - Array of validated social media post data
 * @returns {Array<Object>} Array of creator performance metrics
 */
export function processCreatorPerformance(data) {
    const creatorStats = new Map();

    data.forEach(post => {
        const creator = post.author || post.profile_name;
        if (!creator) return; // Skip if no creator info

        if (!creatorStats.has(creator)) {
            creatorStats.set(creator, {
                totalPosts: 0,
                totalEngagement: 0,
                platforms: new Set(),
                tags: new Set(),
                titles: new Set()
            });
        }

        const stats = creatorStats.get(creator);
        stats.totalPosts++;
        stats.totalEngagement += calculateMetrics(post).engagementScore;
        stats.platforms.add(normalizePlatformName(post.platform));
        stats.titles.add(post.title || post.family_name);
        
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => stats.tags.add(tag));
        }
    });

    return Array.from(creatorStats.entries())
        .map(([creator, stats]) => ({
            creator,
            engagementScore: stats.totalEngagement / stats.totalPosts,
            totalPosts: stats.totalPosts,
            numPlatforms: stats.platforms.size,
            numTags: stats.tags.size,
            numTitles: stats.titles.size,
            platforms: Array.from(stats.platforms).join(', ')
        }))
        .filter(creator => creator.totalPosts > 0) // Remove creators with no posts
        .sort((a, b) => b.engagementScore - a.engagementScore)
        .slice(0, 10); // Top 10 creators
}

/**
 * Processes schedule impact data for heatmap
 * @param {Array<Object>} data - Array of validated social media post data
 * @returns {Object} Heatmap data structure
 */
export function processScheduleImpact(data) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({length: 24}, (_, i) => i);
    
    // Initialize heatmap data structure
    const heatmapData = {
        days,
        hours,
        data: Array(7).fill().map(() => Array(24).fill(null))
    };

    // Aggregate data by day and hour
    const scheduleStats = new Map();
    data.forEach(post => {
        const date = new Date(post.post_created_at);
        const dayIndex = date.getDay();
        const hour = date.getHours();
        const key = `${dayIndex}-${hour}`;

        if (!scheduleStats.has(key)) {
            scheduleStats.set(key, {
                totalPosts: 0,
                totalEngagement: 0
            });
        }

        const stats = scheduleStats.get(key);
        stats.totalPosts++;
        stats.totalEngagement += calculateMetrics(post).engagementScore;
    });

    // Calculate average engagement for each time slot
    scheduleStats.forEach((stats, key) => {
        const [dayIndex, hour] = key.split('-').map(Number);
        heatmapData.data[dayIndex][hour] = stats.totalEngagement / stats.totalPosts;
    });

    return heatmapData;
}

/**
 * Processes comment impact data
 * @param {Array<Object>} data - Array of validated social media post data
 * @returns {Object} Comment impact metrics
 */
export function processCommentImpact(data) {
    // Group posts by comment ranges
    const commentRanges = [
        { min: 0, max: 0, label: 'No Comments' },
        { min: 1, max: 5, label: '1-5 Comments' },
        { min: 6, max: 10, label: '6-10 Comments' },
        { min: 11, max: 20, label: '11-20 Comments' },
        { min: 21, max: Infinity, label: '21+ Comments' }
    ];

    const rangeStats = commentRanges.map(range => ({
        ...range,
        posts: [],
        totalEngagement: 0,
        count: 0,
        titles: new Set()
    }));

    // Categorize posts into ranges
    data.forEach(post => {
        const commentCount = post.n_comments || 0;
        const range = rangeStats.find(r => 
            commentCount >= r.min && commentCount <= r.max
        );

        if (range) {
            range.count++;
            range.posts.push(post);
            range.totalEngagement += calculateMetrics(post).engagementScore;
            range.titles.add(post.title);
        }
    });

    // Calculate metrics for each range
    return rangeStats.map(range => ({
        label: range.label,
        avgEngagement: range.count > 0 ? range.totalEngagement / range.count : 0,
        postCount: range.count,
        percentage: (range.count / data.length) * 100,
        uniqueTitles: range.titles.size
    }));
}

/**
 * Generates analysis prompts for an LLM based on processed data
 * @param {Array<Object>} data - Array of validated social media post data
 * @returns {Object} Object containing various analysis prompts
 */
export function generateAnalysisPrompts(data) {
    // Get processed data from other functions
    const platformMetrics = processEngagementRate(data);
    const timeBasedMetrics = processTimeBasedTrends(data);
    const formatMetrics = processPostFormatPerformance(data);
    const tagMetrics = processTagPerformance(data);
    const creatorMetrics = processCreatorPerformance(data);
    const scheduleMetrics = processScheduleImpact(data);
    const commentMetrics = processCommentImpact(data);

    return {
        platformAnalysis: `Analyze the following platform engagement data and identify sustained high performers and emerging trends: ${JSON.stringify(platformMetrics)}. 
What variables appear to affect engagement across different platforms? Consider factors like content type, posting frequency, and audience demographics.`,

        timeBasedAnalysis: `Review these time-based engagement metrics: ${JSON.stringify(timeBasedMetrics)}. 
What daily, weekly, or seasonal patterns emerge? Identify significant peaks and dips, and suggest potential contributing factors.`,

        formatAnalysis: `Examine this content format performance data: ${JSON.stringify(formatMetrics)}. 
Which formats consistently drive higher engagement? What correlations exist between media types and audience interaction?`,

        tagAnalysis: `Based on this tag performance data: ${JSON.stringify(tagMetrics)}. 
Which tags drive the highest engagement rates? Are there notable tag combinations that correlate with improved performance?`,

        creatorAnalysis: `Analyze creator performance metrics: ${JSON.stringify(creatorMetrics)}. 
What patterns distinguish top performers? Consider posting frequency, content types, and engagement rates.`,

        scheduleAnalysis: `Review this posting schedule impact data: ${JSON.stringify(scheduleMetrics)}. 
How do posting times and frequency correlate with engagement? Identify optimal time slots for audience response.`,

        commentAnalysis: `Evaluate this comment impact data: ${JSON.stringify(commentMetrics)}. 
What's the relationship between comment volume and overall engagement? Do higher comment counts indicate deeper audience interest?`,

        anomalyAnalysis: `Using all available metrics, identify significant outliers and anomalies in the data. 
What potential causes might explain these unexpected performance patterns?`,

        predictiveAnalysis: `Based on all historical trends in the data, what patterns might help forecast future engagement? 
Suggest specific strategies for optimizing future posting approaches based on past performance.`
    };
}

/**
 * Generates recommendations based on analysis
 * @param {Array<Object>} data - Array of validated social media post data
 * @returns {Object} Structured recommendations
 */
export function generateRecommendations(data) {
    const metrics = {
        platform: processEngagementRate(data),
        timeBased: processTimeBasedTrends(data),
        format: processPostFormatPerformance(data),
        tags: processTagPerformance(data),
        creators: processCreatorPerformance(data),
        schedule: processScheduleImpact(data),
        comments: processCommentImpact(data)
    };

    return `Based on the following social media performance metrics: ${JSON.stringify(metrics, null, 2)},
provide specific, actionable recommendations for:
1. Platform strategy adjustments
2. Optimal posting schedules
3. Content format optimization
4. Tag strategy improvements
5. Creator performance enhancement
6. Engagement boosting tactics
7. Comment generation strategies

For each recommendation, include:
- The data points supporting the recommendation
- Expected impact on engagement
- Implementation steps
- Potential challenges to consider`;
}

// Export all functions...