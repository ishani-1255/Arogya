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
    
    def analyze_medical_image(image_path, enhancements=None):
    """Analyze medical images using Gemini model."""
    try:
        # Apply enhancements if requested
        if enhancements and len(enhancements) > 0:
            processed_image_path = enhance_image(image_path, enhancements)
        else:
            processed_image_path = image_path
            
        # Load image
        image = Image.open(processed_image_path)
        
        # Initialize Gemini model
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        
        prompt = """
        You are an expert medical image analyst. Analyze the provided medical image and identify any 
        abnormalities, findings, or areas of concern. The image could be an X-ray, MRI, CT scan, 
        ultrasound, or other medical imaging.

        Provide your analysis in a structured JSON format with the following fields:
        1. findings: An array of findings, where each finding has:
           - area: The anatomical area or region
           - finding: Description of the finding
           - confidence: A number from 1-100 indicating your confidence level
        2. similar_cases: Estimated number of similar cases in medical literature (can be approximate)

        Format your response as valid JSON following this schema:
        
        {
            "findings": [
                {
                    "area": "string",
                    "finding": "string",
                    "confidence": number
                }
            ],
            "similar_cases": number
        }
        
        IMPORTANT: Your entire response must be a valid JSON object with no other text outside of it. 
        Do not include any explanations outside the JSON structure.
        """
        
        response = model.generate_content([prompt, image], generation_config={"temperature": 0.2})
    
        text_response = response.text
        
     
        json_start = text_response.find('{')
        json_end = text_response.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = text_response[json_start:json_end]
           
            json_str = json_str.replace('```json', '').replace('```', '')
            result = json.loads(json_str)
            return result
        else:
            return {"findings": [], "similar_cases": 0}
    except Exception as e:
        print(f"Error analyzing medical image: {str(e)}")
        return {"findings": [], "similar_cases": 0, "error": str(e)}


if __name__ == "__main__":
    # Set host to 0.0.0.0 to make it accessible from outside the container
    # For production, use a production WSGI server like Gunicorn
    app.run(host='0.0.0.0', port=5002, debug=False)