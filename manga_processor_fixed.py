#!/usr/bin/env python3
"""
Manga Bookmark Data Processor
Processes and cleans manga reading bookmark CSV data
"""

import pandas as pd
import json
from datetime import datetime
import re
from urllib.parse import urlparse

class MangaDataProcessor:
    def __init__(self, csv_file_path):
        self.csv_file_path = csv_file_path
        self.df = None
        self.processed_data = None
    
    def load_data(self):
        """Load CSV data with proper encoding handling"""
        try:
            # Try UTF-8 first, then UTF-8 with BOM
            self.df = pd.read_csv(self.csv_file_path, encoding='utf-8-sig')
            print(f"Successfully loaded {len(self.df)} manga entries")
        except UnicodeDecodeError:
            self.df = pd.read_csv(self.csv_file_path, encoding='latin-1')
            print(f"Successfully loaded {len(self.df)} manga entries (latin-1 encoding)")
        except Exception as e:
            print(f"Error loading CSV: {e}")
            return False
        return True
    
    def clean_data(self):
        """Clean and process the manga data"""
        if self.df is None:
            print("No data loaded")
            return False
        
        print("Cleaning data...")
        
        # Create a copy for processing
        df_clean = self.df.copy()
        
        # Clean column names
        df_clean.columns = df_clean.columns.str.strip()
        
        # Handle missing values
        df_clean = df_clean.fillna('')
        
        # Process dates
        df_clean['last_read_formatted'] = df_clean['last_read'].apply(self._format_date)
        
        # Process synonyms
        df_clean['synonyms_list'] = df_clean['synonyms'].apply(self._process_synonyms)
        
        # Extract domain from URLs
        df_clean['mal_available'] = df_clean['mal'].apply(lambda x: bool(x.strip()) if x else False)
        df_clean['anilist_available'] = df_clean['anilist'].apply(lambda x: bool(x.strip()) if x else False)
        df_clean['mangaupdates_available'] = df_clean['mangaupdates'].apply(lambda x: bool(x.strip()) if x else False)
        
        # Calculate reading progress
        df_clean['chapters_read'] = pd.to_numeric(df_clean['read'], errors='coerce').fillna(0).astype(int)
        
        # Add reading status categories
        df_clean['reading_category'] = df_clean.apply(self._categorize_reading_status, axis=1)
        
        # Sort by last read date (most recent first)
        df_clean = df_clean.sort_values('last_read', ascending=False, na_position='last')
        
        self.df = df_clean
        print("Data cleaning completed")
        return True
    
    def _format_date(self, date_str):
        """Format date string to readable format"""
        if not date_str or pd.isna(date_str):
            return "Not specified"
        
        try:
            # Handle the format YYYY-DD-MM (which seems to be the format in your data)
            if '-' in str(date_str):
                parts = str(date_str).split('-')
                if len(parts) == 3:
                    year, day, month = parts
                    # Create proper date format
                    formatted_date = f"{year}-{month.zfill(2)}-{day.zfill(2)}"
                    dt = datetime.strptime(formatted_date, "%Y-%m-%d")
                    return dt.strftime("%B %d, %Y")
        except:
            pass
        
        return str(date_str)
    
    def _process_synonyms(self, synonyms_str):
        """Process synonyms string into a clean list"""
        if not synonyms_str or pd.isna(synonyms_str):
            return []
        
        # Split by comma and clean each synonym
        synonyms = [s.strip().strip('"') for s in str(synonyms_str).split(',')]
        # Remove empty strings and duplicates
        synonyms = list(dict.fromkeys([s for s in synonyms if s]))
        return synonyms[:5]  # Limit to first 5 synonyms for display
    
    def _categorize_reading_status(self, row):
        """Categorize reading status based on chapters read"""
        chapters = row['chapters_read']
        if chapters == 0:
            return "Just Started"
        elif chapters < 50:
            return "Early Chapters"
        elif chapters < 100:
            return "Mid Progress"
        elif chapters < 200:
            return "Well Advanced"
        else:
            return "Long Reader"
    
    def generate_statistics(self):
        """Generate reading statistics"""
        if self.df is None:
            return {}
        
        stats = {
            'total_manga': len(self.df),
            'total_chapters_read': int(self.df['chapters_read'].sum()),
            'average_chapters_per_manga': round(self.df['chapters_read'].mean(), 1),
            'reading_categories': self.df['reading_category'].value_counts().to_dict(),
            'external_links': {
                'mal_count': int(self.df['mal_available'].sum()),
                'anilist_count': int(self.df['anilist_available'].sum()),
                'mangaupdates_count': int(self.df['mangaupdates_available'].sum())
            },
            'most_read_manga': self.df.nlargest(5, 'chapters_read')[['title', 'chapters_read']].to_dict('records'),
            'recently_read': self.df.head(10)[['title', 'last_read_formatted', 'chapters_read']].to_dict('records')
        }
        
        return stats
    
    def export_processed_data(self, output_format='json'):
        """Export processed data in specified format"""
        if self.df is None:
            print("No data to export")
            return False
        
        # Prepare data for export
        export_data = {
            'metadata': {
                'total_entries': len(self.df),
                'export_date': datetime.now().isoformat(),
                'source_file': self.csv_file_path
            },
            'statistics': self.generate_statistics(),
            'manga_list': []
        }
        
        # Convert dataframe to list of dictionaries
        for _, row in self.df.iterrows():
            manga_entry = {
                'id': row['hid'],
                'title': row['title'],
                'type': row['type'],
                'rating': row['rating'] if row['rating'] else None,
                'chapters_read': int(row['chapters_read']),
                'last_read': row['last_read_formatted'],
                'reading_category': row['reading_category'],
                'synonyms': row['synonyms_list'],
                'external_links': {
                    'mal': row['mal'] if row['mal'] else None,
                    'anilist': row['anilist'] if row['anilist'] else None,
                    'mangaupdates': row['mangaupdates'] if row['mangaupdates'] else None
                }
            }
            export_data['manga_list'].append(manga_entry)
        
        # Export based on format
        if output_format.lower() == 'json':
            output_file = 'processed_manga_data.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)
            print(f"Data exported to {output_file}")
        
        elif output_format.lower() == 'csv':
            output_file = 'processed_manga_data.csv'
            # Flatten the data for CSV
            csv_data = []
            for manga in export_data['manga_list']:
                flat_entry = {
                    'id': manga['id'],
                    'title': manga['title'],
                    'type': manga['type'],
                    'rating': manga['rating'],
                    'chapters_read': manga['chapters_read'],
                    'last_read': manga['last_read'],
                    'reading_category': manga['reading_category'],
                    'synonyms_count': len(manga['synonyms']),
                    'top_synonyms': ', '.join(manga['synonyms'][:3]),
                    'has_mal': bool(manga['external_links']['mal']),
                    'has_anilist': bool(manga['external_links']['anilist']),
                    'has_mangaupdates': bool(manga['external_links']['mangaupdates'])
                }
                csv_data.append(flat_entry)
            
            pd.DataFrame(csv_data).to_csv(output_file, index=False)
            print(f"Data exported to {output_file}")
        
        self.processed_data = export_data
        return True
    
    def print_summary(self):
        """Print a summary of the processed data"""
        if self.df is None:
            print("No data loaded")
            return
        
        stats = self.generate_statistics()
        
        print("\n" + "="*60)
        print("MANGA READING SUMMARY")
        print("="*60)
        print(f"Total Manga: {stats['total_manga']}")
        print(f"Total Chapters Read: {stats['total_chapters_read']:,}")
        print(f"Average Chapters per Manga: {stats['average_chapters_per_manga']}")
        
        print(f"\nExternal Links:")
        print(f"   - MyAnimeList: {stats['external_links']['mal_count']}")
        print(f"   - AniList: {stats['external_links']['anilist_count']}")
        print(f"   - MangaUpdates: {stats['external_links']['mangaupdates_count']}")
        
        print(f"\nReading Categories:")
        for category, count in stats['reading_categories'].items():
            print(f"   - {category}: {count}")
        
        print(f"\nTop 5 Most Read:")
        for i, manga in enumerate(stats['most_read_manga'], 1):
            print(f"   {i}. {manga['title']} - {manga['chapters_read']} chapters")
        
        print("="*60)

def main():
    """Main function to run the manga data processor"""
    print("Starting Manga Bookmark Data Processor")
    print("-" * 50)
    
    # Initialize processor
    csv_file = "comick-mylist-2025-09-18.csv"
    processor = MangaDataProcessor(csv_file)
    
    # Process data
    if not processor.load_data():
        return
    
    if not processor.clean_data():
        return
    
    # Print summary
    processor.print_summary()
    
    # Export data
    print(f"\nExporting processed data...")
    processor.export_processed_data('json')
    processor.export_processed_data('csv')
    
    print(f"\nProcessing completed successfully!")
    print(f"Check the generated files:")
    print(f"   - processed_manga_data.json (for web app)")
    print(f"   - processed_manga_data.csv (for spreadsheet)")

if __name__ == "__main__":
    main()