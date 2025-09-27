#!/usr/bin/env python3
"""
Modern Manga Bookmark Web Application
A responsive web interface to display manga reading bookmarks
"""

from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__)

class MangaWebApp:
    def __init__(self):
        self.data = None
        self.load_data()
    
    def load_data(self):
        """Load processed manga data"""
        try:
            if os.path.exists('processed_manga_data.json'):
                with open('processed_manga_data.json', 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
                print("Manga data loaded successfully")
            else:
                print("processed_manga_data.json not found. Run manga_processor.py first.")
                self.data = self._create_sample_data()
        except Exception as e:
            print(f"Error loading data: {e}")
            self.data = self._create_sample_data()
    
    def _create_sample_data(self):
        """Create sample data if no processed data exists"""
        return {
            'metadata': {
                'total_entries': 0,
                'export_date': datetime.now().isoformat(),
                'source_file': 'No data'
            },
            'statistics': {
                'total_manga': 0,
                'total_chapters_read': 0,
                'average_chapters_per_manga': 0,
                'reading_categories': {},
                'external_links': {'mal_count': 0, 'anilist_count': 0, 'mangaupdates_count': 0},
                'most_read_manga': [],
                'recently_read': []
            },
            'manga_list': []
        }
    
    def get_filtered_manga(self, search_query='', category='', sort_by='last_read'):
        """Filter and sort manga based on criteria"""
        if not self.data or not self.data['manga_list']:
            return []
        
        manga_list = self.data['manga_list'].copy()
        
        # Apply search filter
        if search_query:
            search_query = search_query.lower()
            manga_list = [
                manga for manga in manga_list
                if search_query in manga['title'].lower() or
                any(search_query in syn.lower() for syn in manga['synonyms'])
            ]
        
        # Apply category filter
        if category and category != 'all':
            manga_list = [manga for manga in manga_list if manga['reading_category'] == category]
        
        # Apply sorting
        if sort_by == 'title':
            manga_list.sort(key=lambda x: x['title'].lower())
        elif sort_by == 'chapters':
            manga_list.sort(key=lambda x: x['chapters_read'], reverse=True)
        elif sort_by == 'last_read':
            # Sort by original order (already sorted by last read in processor)
            pass
        
        return manga_list

# Initialize the web app
manga_app = MangaWebApp()

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html', 
                         statistics=manga_app.data['statistics'],
                         metadata=manga_app.data['metadata'])

@app.route('/api/manga')
def api_manga():
    """API endpoint for manga data"""
    search = request.args.get('search', '')
    category = request.args.get('category', '')
    sort_by = request.args.get('sort', 'last_read')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    
    # Get filtered manga
    filtered_manga = manga_app.get_filtered_manga(search, category, sort_by)
    
    # Pagination
    total = len(filtered_manga)
    start = (page - 1) * per_page
    end = start + per_page
    manga_page = filtered_manga[start:end]
    
    return jsonify({
        'manga': manga_page,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

@app.route('/api/statistics')
def api_statistics():
    """API endpoint for statistics"""
    return jsonify(manga_app.data['statistics'])

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    # Create static directory if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
        os.makedirs('static/css')
        os.makedirs('static/js')
    
    print("Starting Manga Web Application")
    print("Open your browser and go to: http://localhost:5000")
    print("The app will auto-reload when you make changes")
    
    app.run(debug=True, host='0.0.0.0', port=5000)