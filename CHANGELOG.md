# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-03

### Added
- Initial social media analytics dashboard
- Core visualization modules for engagement metrics
- CSV data processing pipeline
- Data validation and normalization system

### Changed
- Improved heatmap visualization with viridis color scheme
- Normalized platform names to lowercase for consistency
- Updated documentation to reflect current features

### Fixed
- Resolved chart initialization errors
- Fixed duplicate platform columns in visualizations
- Addressed schedule impact chart rendering issues
- Corrected file upload event handling
- Removed duplicate dependency loading
- Restored preferred purple gradient heatmap colors
- Ensured stable Chart.js and matrix plugin versions

### Technical Details
- **File Structure**:
  - `index.html`: Main entry point with chart containers
  - `scripts/`:
    - `main.js`: Application initialization and file handling
    - `dataProcessing.js`: Data validation and processing
    - `chartRendering.js`: Chart.js visualization logic
    - `utils.js`: Shared utility functions
  - `styles/main.css`: Responsive layout and styling

- **Dependencies**:
  - Chart.js: v3.x for data visualization
  - PapaParse: v5.3.0 for CSV parsing

- **Data Processing**:
  - Required Fields:
    - platform, post_created_at, content, n_comments, n_views, n_reactions, family_name, profile_name
  - Optional Fields (for enhanced analytics):
    - schedule_weeks_ahead: Advance scheduling analysis
    - status: Post status tracking
    - first_comment: Response time analysis
    - family_tags: Content categorization
    - ext_post_service: Service performance
    - owner_email: Creator performance
    - created_by_process: Process tracking
  - Engagement score calculation: `views * 0.5 + comments * 2 + reactions * 1`
  - Content type detection based on post content
  - Platform-specific metrics including family and profile counts
  - Time-based trend analysis with daily aggregation

### Notes
- Charts are responsive and will resize with the window
- All dates are displayed in local timezone format
- Tag analysis is case-sensitive
