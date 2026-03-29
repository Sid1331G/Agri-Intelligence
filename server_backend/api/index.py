import sys
import os

# Add the root directory to the sys.path
# This allows 'import app' to work when running on Vercel
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

# Vercel needs the 'app' variable to be available at the module level
# for it to correctly handle the serverless function.
