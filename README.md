# Post Genius Analytics

A modern web-based analytics dashboard for social media performance analysis. Visualize engagement metrics, identify trends, and optimize your social media strategy.

## Features

- Interactive heatmap with purple gradient colors
- Consolidated platform name analysis
- Stable Chart.js v4.2.1 integration

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/post-genius-analytics.git
   cd post-genius-analytics
   ```

2. Open `index.html` in your browser or serve with a local web server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve
   ```

3. Visit `http://localhost:8000` in your browser

## CSV Data Format

Your CSV file should include the following columns:

### Required Fields
- `platform`: Social media platform name
- `post_created_at`: Post creation timestamp
- `status`: Post status (only "posted" items are analyzed)
- `n_views`: Number of views
- `n_comments`: Number of comments
- `n_reactions`: Number of reactions (likes, shares, etc.)
- `family_name`: Post title
- `profile_name`: Content creator name

### Optional Fields
- `family_tags`: JSON array of tags in format:
  ```json
  [
    {
      "id": "tag-id",
      "name": "Tag Name",
      "color": "#HEX"
    }
  ]
  ```

## Development

### Project Structure

```
post-genius-analytics/
├── index.html          # Main entry point
├── styles/
│   └── main.css       # Styles
├── scripts/
│   ├── main.js        # Application initialization
│   ├── dataProcessing.js # Data processing logic
│   ├── chartRendering.js # Chart creation
│   └── utils.js       # Utility functions
└── README.md
```

### Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Chart.js](https://www.chartjs.org/) for visualization
- [PapaParse](https://www.papaparse.com/) for CSV parsing
