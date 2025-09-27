#!/usr/bin/env python3
"""
Manga Collection Application Runner
Runs both data processing and web application
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_requirements():
    """Check if required packages are installed"""
    required_packages = ['flask', 'pandas']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\nInstall them with: pip install -r requirements.txt")
        return False
    
    return True

def run_data_processor():
    """Run the manga data processor"""
    print("Processing manga data...")
    try:
        result = subprocess.run([sys.executable, 'manga_processor.py'], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("Data processing completed successfully!")
            return True
        else:
            print("Data processing failed:")
            print(result.stderr)
            return False
    except subprocess.TimeoutExpired:
        print("Data processing timed out")
        return False
    except Exception as e:
        print(f"Error running data processor: {e}")
        return False

def start_web_app():
    """Start the web application"""
    print("Starting web application...")
    print("Open your browser and go to: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("-" * 60)
    
    try:
        subprocess.run([sys.executable, 'manga_web_app.py'])
    except KeyboardInterrupt:
        print("\nWeb application stopped")
    except Exception as e:
        print(f"Error starting web application: {e}")

def main():
    """Main function"""
    print("=" * 60)
    print("MANGA COLLECTION APPLICATION")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists('comick-mylist-2025-09-18.csv'):
        print("CSV file not found in current directory")
        print("Make sure you're running this from the directory containing your CSV file")
        return
    
    # Check requirements
    if not check_requirements():
        return
    
    # Process data first
    if not run_data_processor():
        print("Cannot start web app without processed data")
        return
    
    print("\n" + "=" * 60)
    print("Setup completed! Starting web application...")
    print("=" * 60)
    
    # Start web application
    start_web_app()

if __name__ == "__main__":
    main()