# 📚 Manga Collection Web Application

A modern, responsive web application to display and manage your manga reading bookmarks with a beautiful UI and interactive features.

## ✨ Features

### 🎯 Core Features
- **Clean Data Processing**: Automatically processes and cleans your CSV manga data
- **Modern Web Interface**: Beautiful, responsive design that works on all devices
- **Smart Search**: Search by title or alternative names/synonyms
- **Advanced Filtering**: Filter by reading categories and sort options
- **Multiple View Modes**: Switch between grid and list views
- **External Links Integration**: Direct links to MyAnimeList, AniList, and MangaUpdates
- **Reading Statistics**: Comprehensive stats about your reading habits

### 🎨 Design Features
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Mode Support**: Automatic dark/light mode based on system preference
- **Modern UI**: Clean, professional interface with smooth animations
- **Interactive Elements**: Hover effects, modals, and smooth transitions
- **Accessibility**: Keyboard navigation and screen reader friendly

### 📊 Data Features
- **Reading Categories**: Automatically categorizes manga by chapters read
- **Progress Tracking**: Shows chapters read and last reading date
- **Statistics Dashboard**: Visual overview of your reading habits
- **Export Functionality**: Export processed data in multiple formats

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- Web browser (Chrome, Firefox, Safari, Edge)

### Installation & Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Application**
   ```bash
   python run_manga_app.py
   ```

3. **Open Your Browser**
   - Navigate to: `http://localhost:5000`
   - Enjoy your manga collection!

## 📁 Project Structure

```
manga-collection/
├── manga_processor.py          # Data processing script
├── manga_web_app.py           # Flask web application
├── run_manga_app.py           # Application runner
├── requirements.txt           # Python dependencies
├── comick-mylist-2025-09-18.csv  # Your manga data
├── templates/
│   └── index.html            # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css         # Modern CSS styles
│   └── js/
│       └── app.js            # Interactive JavaScript
└── README.md                 # This file
```

## 🔧 Manual Usage

### Step 1: Process Your Data
```bash
python manga_processor.py
```
This will:
- Load and clean your CSV data
- Generate reading statistics
- Export processed data as JSON and CSV
- Display a summary of your collection

### Step 2: Start the Web Application
```bash
python manga_web_app.py
```
This will:
- Start a local web server on port 5000
- Serve your manga collection with a modern interface
- Provide API endpoints for data access

## 📊 Data Processing Features

The data processor automatically:
- **Cleans Data**: Handles missing values and formats dates
- **Processes Synonyms**: Extracts and organizes alternative titles
- **Categorizes Reading**: Groups manga by reading progress
- **Generates Statistics**: Creates comprehensive reading stats
- **Validates Links**: Checks for available external links

### Reading Categories
- **Just Started**: 0 chapters
- **Early Chapters**: 1-49 chapters
- **Mid Progress**: 50-99 chapters
- **Well Advanced**: 100-199 chapters
- **Long Reader**: 200+ chapters

## 🌐 Web Interface Features

### Search & Filter
- **Smart Search**: Search titles and synonyms simultaneously
- **Category Filter**: Filter by reading progress categories
- **Sort Options**: Sort by last read, title, or chapter count
- **Real-time Results**: Instant filtering as you type

### View Modes
- **Grid View**: Card-based layout with full information
- **List View**: Compact list format for quick browsing
- **Responsive**: Automatically adapts to screen size

### Interactive Elements
- **Manga Details Modal**: Click any manga for detailed information
- **External Links**: Direct access to MAL, AniList, and MangaUpdates
- **Keyboard Shortcuts**: Press '/' to focus search, 'Escape' to close modals
- **Pagination**: Smooth navigation through large collections

## 🎨 Customization

### Themes
The application automatically detects your system's dark/light mode preference and applies the appropriate theme.

### Colors
You can customize the color scheme by modifying the CSS variables in `static/css/style.css`:

```css
:root {
    --primary-color: #6366f1;    /* Main accent color */
    --secondary-color: #f59e0b;  /* Secondary accent */
    --success-color: #10b981;    /* Success indicators */
    /* ... more variables */
}
```

## 📱 Mobile Support

The application is fully responsive and optimized for:
- **Mobile Phones**: Touch-friendly interface with optimized layouts
- **Tablets**: Balanced design for medium screens
- **Desktop**: Full-featured experience with all capabilities

## 🔒 Privacy & Security

- **Local Only**: All data processing happens locally on your machine
- **No Data Collection**: No personal data is sent to external servers
- **Secure Links**: External links open in new tabs with security attributes
- **Offline Capable**: Works without internet connection (except external links)

## 🐛 Troubleshooting

### Common Issues

1. **CSV File Not Found**
   - Ensure your CSV file is in the same directory as the scripts
   - Check the filename matches exactly: `comick-mylist-2025-09-18.csv`

2. **Missing Dependencies**
   - Run: `pip install -r requirements.txt`
   - Ensure you're using Python 3.7+

3. **Port Already in Use**
   - The app runs on port 5000 by default
   - Close other applications using this port
   - Or modify the port in `manga_web_app.py`

4. **Data Processing Errors**
   - Check your CSV file format
   - Ensure it has the required columns
   - Look for encoding issues (the processor handles most automatically)

### Performance Tips

- **Large Collections**: The app handles thousands of manga efficiently
- **Search Performance**: Search is optimized for real-time filtering
- **Memory Usage**: Data is loaded efficiently with pagination
- **Browser Cache**: Static assets are cached for faster loading

## 🔄 Updates & Maintenance

### Adding New Data
1. Replace your CSV file with updated data
2. Run `python manga_processor.py` to reprocess
3. Restart the web application

### Backup Your Data
- Keep backups of your original CSV files
- The processed JSON files can be used as backups
- Export functionality provides additional backup options

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome!

### Potential Enhancements
- **Reading Goals**: Set and track reading targets
- **Reading History**: Timeline of reading activity
- **Recommendations**: Suggest similar manga
- **Import/Export**: Support for other bookmark formats
- **Themes**: Additional color schemes and layouts

## 📄 License

This project is for personal use. Feel free to modify and adapt for your own manga collection needs.

## 🙏 Acknowledgments

- **Comick**: For providing the manga data export functionality
- **Flask**: For the lightweight web framework
- **Pandas**: For powerful data processing capabilities
- **Font Awesome**: For beautiful icons
- **Inter Font**: For clean, readable typography

---

**Enjoy exploring your manga collection with this modern, interactive interface!** 📚✨