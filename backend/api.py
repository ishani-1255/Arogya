from flask import Flask, request, jsonify
import os
import tempfile
from werkzeug.utils import secure_filename
import base64
import json
import google.generativeai as genai
from datetime import datetime
from PIL import Image
from flask_cors import CORS
from PIL import Image, ImageEnhance
import numpy as np
import cv2
import io
import random
# Import API key (in production, use environment variables)
from keys import GOOGLE_API_KEY

# Configure Google API
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(tempfile.gettempdir(), 'medical_images')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def enhance_image(image_path, enhancements):
    """Apply requested enhancements to the image."""
    try:
        img = Image.open(image_path)
        enhanced_img = img.copy()
        
        if 'contrastBoost' in enhancements:
            enhancer = ImageEnhance.Contrast(enhanced_img)
            enhanced_img = enhancer.enhance(1.5)  # Increase contrast by 50%
            
        if 'noiseReduction' in enhancements:
            # Convert to OpenCV format for noise reduction
            cv_img = np.array(enhanced_img)
            cv_img = cv2.cvtColor(cv_img, cv2.COLOR_RGB2BGR)
            # Apply non-local means denoising
            cv_img = cv2.fastNlMeansDenoisingColored(cv_img, None, 10, 10, 7, 21)
            # Convert back to PIL
            enhanced_img = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))
            
        if 'edgeEnhancement' in enhancements:
            # Convert to OpenCV format for edge enhancement
            cv_img = np.array(enhanced_img)
            cv_img = cv2.cvtColor(cv_img, cv2.COLOR_RGB2BGR)
            # Apply unsharp masking
            gaussian = cv2.GaussianBlur(cv_img, (0, 0), 3.0)
            cv_img = cv2.addWeighted(cv_img, 1.5, gaussian, -0.5, 0)
            # Convert back to PIL
            enhanced_img = Image.fromarray(cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB))
        
        # Save enhanced image
        enhanced_path = image_path.replace('.', '_enhanced.')
        enhanced_img.save(enhanced_path)
        
        return enhanced_path
    except Exception as e:
        print(f"Error enhancing image: {str(e)}")
        return image_path

if __name__ == "__main__":
    # Set host to 0.0.0.0 to make it accessible from outside the container
    # For production, use a production WSGI server like Gunicorn
    app.run(host='0.0.0.0', port=5001, debug=False)