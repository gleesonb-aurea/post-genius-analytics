// Utility functions for data processing

/**
 * Validates and formats a date string
 * @param {string} dateStr - Date string to validate
 * @returns {string} Formatted date string
 */
export function validateDate(dateStr) {
    if (!dateStr) return null;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Extracts tag names from JSON string
 * @param {string} tagsStr - JSON string containing tags
 * @returns {Array<string>} Array of tag names
 */
function extractTagNames(tagsStr) {
    if (!tagsStr) return [];
    try {
        const tags = JSON.parse(tagsStr);
        return tags.map(tag => tag.name.replace(/\s+/g, '-'));
    } catch (e) {
        console.warn('Error parsing tags:', e);
        return [];
    }
}

/**
 * Validates and processes social media data
 * @param {Array<Object>} data - Raw data from CSV
 * @returns {Array<Object>} Validated data
 */
export function validateData(data) {
    if (!data || !data.length) {
        throw new Error('No data provided');
    }

    // Required fields in the CSV
    const requiredFields = [
        'platform',
        'post_created_at',
        'status',
        'n_views',
        'n_comments',
        'n_reactions',
        'family_name',
        'profile_name'
    ];

    // Check for required fields
    const missingFields = requiredFields.filter(field => 
        !Object.prototype.hasOwnProperty.call(data[0], field)
    );

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return data
        .filter(row => {
            // Only include posted content with valid dates and required fields
            if (!row) return false;
            
            const date = new Date(row.post_created_at);
            return !isNaN(date.getTime()) && 
                   row.platform && 
                   row.status === 'posted' &&
                   (row.n_views != null || row.n_comments != null || row.n_reactions != null);
        })
        .map(row => {
            // Extract tag names from JSON
            let tags = [];
            if (row.family_tags) {
                try {
                    const tagsJson = JSON.parse(row.family_tags);
                    tags = tagsJson.map(tag => tag.name.replace(/\s+/g, '-'));
                } catch (e) {
                    console.warn('Error parsing tags:', e);
                }
            }
            
            // Transform the data
            const transformedRow = {
                ...row,
                post_created_at: new Date(row.post_created_at).toISOString(),
                n_views: Number(row.n_views) || 0,
                n_comments: Number(row.n_comments) || 0,
                n_reactions: Number(row.n_reactions) || 0,
                title: row.family_name,
                author: row.profile_name,
                tags: tags
            };
            
            // Remove original fields to avoid confusion
            delete transformedRow.family_tags;
            delete transformedRow.family_name;
            delete transformedRow.profile_name;
            
            return transformedRow;
        })
        .sort((a, b) => new Date(a.post_created_at) - new Date(b.post_created_at));
}

/**
 * Calculates engagement metrics
 * @param {Object} post - Post data
 * @returns {Object} Engagement metrics
 */
export function calculateMetrics(post) {
    return {
        engagementScore: 
            (post.n_views || 0) * 0.5 + 
            (post.n_comments || 0) * 2 + 
            (post.n_reactions || 0) * 1
    };
}

/**
 * Validates a value based on its type
 * @param {*} value - Value to validate
 * @param {string} type - Type of validation to perform ('string'|'number'|'email'|'phone'|'object'|'any')
 * @returns {boolean} True if value is valid according to type
 */
export function validateValue(value, type = 'any') {
    switch (type) {
        case 'string':
            return typeof value === 'string' && value.trim() !== '';
        case 'number':
            return typeof value === 'number' && !isNaN(value);
        case 'email':
            return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        case 'phone':
            return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value);
        case 'object':
            return value !== null && typeof value === 'object' && Object.keys(value).length > 0;
        default:
            return value !== null && value !== undefined;
    }
}