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

def analyze_symptoms(symptoms, patient_info=None):
    """Analyze symptoms and suggest possible conditions."""
    try:
        if not symptoms:
            return {"possible_conditions": []}
     
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        patient_age = patient_info.get('age', 'Not specified') if patient_info else 'Not specified'
        patient_gender = patient_info.get('gender', 'Not specified') if patient_info else 'Not specified'
        existing_conditions = patient_info.get('existingConditions', 'None') if patient_info else 'None'
        
        prompt = f"""
        You are an expert medical AI assistant. Based on the following symptoms, identify possible medical conditions:
        
        Symptoms:
        {', '.join(symptoms)}
        
        Additional patient information:
        Age: {patient_age}
        Gender: {patient_gender}
        Existing conditions: {existing_conditions}
        
        Provide a list of the most probable medical conditions with the following information for each:
        1. Condition name
        2. Probability (High, Medium, or Low)
        3. Brief description
        4. Urgency level (High, Medium, Low)
        5. Matched symptoms
        6. Recommended actions
        
        Format your response as valid JSON following this schema:
        
        {{
            "possible_conditions": [
                {{
                    "name": "string",
                    "probability": "string",
                    "description": "string",
                    "urgency": "string",
                    "matched_symptoms": ["string", "string", ...],
                    "recommended_actions": ["string", "string", ...]
                }}
            ]
        }}
        
        IMPORTANT: Your entire response must be a valid JSON object with no other text outside of it. 
        Do not include any explanations, only provide the JSON. Limit to the 5 most likely conditions.
        """
        response = model.generate_content(prompt, generation_config={"temperature": 0.3})
       
        text_response = response.text
       
        json_start = text_response.find('{')
        json_end = text_response.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = text_response[json_start:json_end]
            json_str = json_str.replace('```json', '').replace('```', '')
            result = json.loads(json_str)
            return result
        else:
            return {"possible_conditions": [], "error": "Failed to parse response"}
    except Exception as e:
        print(f"Error analyzing symptoms: {str(e)}")
        return {"possible_conditions": [], "error": str(e)}
    
def encode_image(image_path):
    """Load and encode image as base64."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')
    
def get_prescription_information(image_path):
    """Process prescription images using Gemini 1.5 Flash."""
    # Load images using PIL for Gemini API
    image = Image.open(image_path)
    
    # Initialize Gemini 1.5 Flash model
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    
    prompt = """
    You are an expert medical transcriptionist specializing in deciphering and accurately transcribing handwritten medical prescriptions. Your role is to meticulously analyze the provided prescription images and extract all relevant information with the highest degree of precision.

    Your job is to extract and accurately transcribe the following details from the provided prescription images:
    1. Patient's full name
    2. Patient's age (handle different formats like "42y", "42yrs", "42", "42 years")
    3. Patient's gender
    4. Doctor's full name
    5. Doctor's license number
    6. Prescription date (in YYYY-MM-DD format)
    7. List of medications including:
       - Medication name
       - Dosage
       - Frequency
       - Duration
    8. Additional notes or instructions

    Important Instructions:
    - Ensure that each extracted field is accurate and clear. If any information is not legible or missing, indicate it as 'Not available'.
    - Do not guess or infer any information that is not clearly legible.
    - Pay close attention to details like medication names, dosages, and frequencies.
    - Format your response as valid JSON following this exact schema:
    
    {
        "patient_name": "string",
        "patient_age": integer,
        "patient_gender": "string",
        "doctor_name": "string",
        "doctor_license": "string",
        "prescription_date": "YYYY-MM-DD",
        "medications": [
            {
                "name": "string",
                "dosage": "string",
                "frequency": "string",
                "duration": "string"
            }
        ],
        "additional_notes": "string"
    }
    
    IMPORTANT: Your entire response must be a valid JSON object with no other text outside of it. Do not include any explanations, only provide the JSON.
    """
    
    # Generate response using gemini-1.5-flash
    try:
        response = model.generate_content([prompt, image], generation_config={"temperature": 0.2})
        
        # Extract JSON from response
        text_response = response.text
        
        # Find JSON object
        json_start = text_response.find('{')
        json_end = text_response.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = text_response[json_start:json_end]
            # Clean up any potential formatting issues
            json_str = json_str.replace('```json', '').replace('```', '')
            result = json.loads(json_str)
            
            # Ensure patient_age is an integer
            if 'patient_age' in result and result['patient_age'] and isinstance(result['patient_age'], str):
                try:
                    result['patient_age'] = int(''.join(filter(str.isdigit, result['patient_age'])))
                except:
                    result['patient_age'] = 0
            
            # Add possible diseases based on medications
            result = enrich_with_possible_diseases(result)
            
            return result
        else:
            return create_empty_result("Failed to parse JSON from response")
    except Exception as e:
        return create_empty_result(f"Error calling Gemini API: {str(e)}")

def enrich_with_possible_diseases(prescription_data):
    """Enrich prescription data with possible diseases based on medications."""
    try:
        if 'medications' not in prescription_data or not prescription_data['medications']:
            prescription_data['possible_diseases'] = []
            return prescription_data
            
        # Initialize Gemini 1.5 Flash model for disease prediction
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        
        # Prepare medication list for prompt
        medication_list = "\n".join([f"- {med['name']} {med['dosage']}" for med in prescription_data['medications']])
        
        prompt = f"""
        You are an expert medical AI assistant. Based on the following list of medications prescribed to a patient, 
        identify the most likely medical conditions/diseases that the patient might have.
        
        Medications:
        {medication_list}
        
        Additional context (if available):
        Patient age: {prescription_data.get('patient_age', 'Not specified')}
        Patient gender: {prescription_data.get('patient_gender', 'Not specified')}
        Additional notes: {prescription_data.get('additional_notes', 'None')}
        
        Provide a list of the most probable medical conditions/diseases with the following information for each:
        1. Disease name
        2. Probability (high, medium, or low)
        3. Brief description of the condition
        4. Whether the condition is chronic or acute
        5. Key symptoms associated with this condition
        
        Format your response as valid JSON following this exact schema:
        
        {{
            "possible_diseases": [
                {{
                    "name": "string",
                    "probability": "string", 
                    "description": "string",
                    "type": "string",
                    "symptoms": ["string", "string", ...]
                }}
            ]
        }}
        
        IMPORTANT: Your entire response must be a valid JSON object with no other text outside of it. Do not include any explanations, only provide the JSON.
        """

        response = model.generate_content(prompt, generation_config={"temperature": 0.3})

        text_response = response.text

        json_start = text_response.find('{')
        json_end = text_response.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = text_response[json_start:json_end]

            json_str = json_str.replace('```json', '').replace('```', '')
            disease_result = json.loads(json_str)

            prescription_data['possible_diseases'] = disease_result.get('possible_diseases', [])
        else:
            prescription_data['possible_diseases'] = []
            
        return prescription_data
    except Exception as e:
        print(f"Error predicting diseases: {str(e)}")
        prescription_data['possible_diseases'] = []
        return prescription_data
    
def get_drug_interactions(medications):
    """Get interactions between medications."""
    try:
        if not medications or len(medications) < 2:
            return []

        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
 
        medication_names = [med['name'] for med in medications if 'name' in med and med['name']]

        if len(medication_names) < 2:
            return []
            
        prompt = f"""
        You are a pharmacology expert AI. Analyze the following list of medications and identify any potential interactions between them:
        
        Medications:
        {', '.join(medication_names)}
        
        For each potential drug interaction, provide:
        1. The interacting drugs (pair)
        2. Severity (mild, moderate, severe)
        3. Effect description
        4. Recommendation
        
        Format your response as valid JSON following this schema:
        
        {{
            "interactions": [
                {{
                    "drugs": ["Drug A", "Drug B"],
                    "severity": "string",
                    "effect": "string",
                    "recommendation": "string"
                }}
            ]
        }}
        
        IMPORTANT: Your entire response must be a valid JSON object with no other text outside of it. Do not include any explanations, only provide the JSON.
        """
    
        response = model.generate_content(prompt, generation_config={"temperature": 0.2})
   
        text_response = response.text

        json_start = text_response.find('{')
        json_end = text_response.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = text_response[json_start:json_end]
            # Clean up any potential formatting issues
            json_str = json_str.replace('```json', '').replace('```', '')
            interaction_result = json.loads(json_str)
            
            return interaction_result.get('interactions', [])
        else:
            return []
    except Exception as e:
        print(f"Error getting drug interactions: {str(e)}")
        return []

def create_empty_result(error_message="Failed to process prescription image."):
    """Create empty result dictionary for error cases."""
    return {
        "patient_name": "Error processing prescription",
        "patient_age": 0,
        "patient_gender": "",
        "doctor_name": "",
        "doctor_license": "",
        "prescription_date": "",
        "medications": [],
        "possible_diseases": [],
        "additional_notes": error_message
    }

@app.route('/api/process_prescription', methods=['POST'])
def process_prescription():
    """API endpoint to process prescription images."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
        
    if file:

        temp_dir = tempfile.mkdtemp()
        try:
            file_path = os.path.join(temp_dir, secure_filename(file.filename))
            file.save(file_path)

            result = get_prescription_information(file_path)

            if 'medications' in result and len(result['medications']) > 1:
                interactions = get_drug_interactions(result['medications'])
                result['drug_interactions'] = interactions
            else:
                result['drug_interactions'] = []
     
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
   
            if os.path.exists(temp_dir):
                import shutil
                shutil.rmtree(temp_dir)

@app.route('/api/analyze_symptoms', methods=['POST'])
def analyze_symptoms():
    """API endpoint to analyze symptoms and suggest possible conditions."""
    try:

        data = request.json
        
        if not data or 'symptoms' not in data or not data['symptoms']:
            return jsonify({"error": "No symptoms provided"}), 400
            
        symptoms = data['symptoms']
        patient_info = data.get('patientInfo', {})

        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        
        prompt = f"""
        You are an expert medical AI assistant. Based on the following symptoms, identify possible medical conditions:
        
        Symptoms:
        {', '.join(symptoms)}
        
        Additional patient information:
        Age: {patient_info.get('age', 'Not specified')}
        Gender: {patient_info.get('gender', 'Not specified')}
        Existing conditions: {patient_info.get('existingConditions', 'None')}
        
        Provide a list of the most probable medical conditions with the following information for each:
        1. Condition name
        2. Probability (high, medium, or low)
        3. Brief description
        4. Urgency level (emergency, urgent, routine)
        5. Recommended actions
        
        Format your response as valid JSON following this schema:
        
        {{
            "possible_conditions": [
                {{
                    "name": "string",
                    "probability": "string",
                    "description": "string",
                    "urgency": "string",
                    "matched_symptoms": ["string", "string", ...],
                    "recommended_actions": ["string", "string", ...]
                }}
            ]
        }}
        
        IMPORTANT: Your entire response must be a valid JSON object with no other text outside of it. Do not include any explanations, only provide the JSON.
        """

        response = model.generate_content(prompt, generation_config={"temperature": 0.3})

        text_response = response.text

        json_start = text_response.find('{')
        json_end = text_response.rfind('}') + 1
        
        if json_start >= 0 and json_end > json_start:
            json_str = text_response[json_start:json_end]
        
            json_str = json_str.replace('```json', '').replace('```', '')
            result = json.loads(json_str)
            
            return jsonify(result)
        else:
            return jsonify({"error": "Failed to analyze symptoms"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze_medical_image', methods=['POST'])
def analyze_medical_image_endpoint():
    """API endpoint to analyze uploaded medical images."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        if file:

            enhancements = []
            if 'enhancements' in request.form:
                try:
                    enhancements = json.loads(request.form['enhancements'])
                except Exception as e:
                    print(f"Error parsing enhancements: {str(e)}")
            

            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            try:

                result = analyze_medical_image(filepath, enhancements)
                return jsonify(result)
            except Exception as e:
                return jsonify({"error": str(e)}), 500
            finally:
   
                if os.path.exists(filepath):
                    os.remove(filepath)

                enhanced_path = filepath.replace('.', '_enhanced.')
                if os.path.exists(enhanced_path):
                    os.remove(enhanced_path)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "timestamp": str(os.path.getmtime(__file__))}), 200

def analyze_medical_report(report_path):
    """Analyze medical reports (lab tests, pathology, etc.) using Gemini model."""
    try:
        image = Image.open(report_path)
        
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        
        prompt = """
        You are an expert medical report analyzer. Analyze the provided medical report image (which could be 
        a lab test, blood work, pathology report, etc.) and extract all relevant information.

        Focus on:
        1. Identifying all test parameters and their values
        2. Highlighting abnormal values (too high or too low)
        3. Providing a brief interpretation of what the abnormal values might indicate
        4. Suggesting follow-up actions if necessary

        Provide your analysis in a structured JSON format with the following fields:
        1. report_type: The type of medical report (e.g., "Complete Blood Count", "Comprehensive Metabolic Panel", etc.)
        2. patient_info: Any patient information visible in the report
        3. test_date: The date when the test was conducted
        4. parameters: An array of test parameters, where each parameter has:
           - name: Parameter name
           - value: Parameter value
           - unit: Unit of measurement
           - reference_range: Normal reference range
           - status: "normal", "high", or "low"
        5. abnormal_findings: Array of objects containing:
           - parameter: The abnormal parameter name
           - interpretation: Brief medical interpretation
           - severity: "mild", "moderate", or "severe"
        6. summary: A brief summary of the overall report findings
        7. recommendations: Array of follow-up recommendations

        Format your response as valid JSON following this schema:
        
        {
            "report_type": "string",
            "patient_info": {
                "name": "string",
                "id": "string",
                "age": "string",
                "gender": "string"
            },
            "test_date": "string",
            "parameters": [
                {
                    "name": "string",
                    "value": number,
                    "unit": "string",
                    "reference_range": "string",
                    "status": "string"
                }
            ],
            "abnormal_findings": [
                {
                    "parameter": "string",
                    "interpretation": "string",
                    "severity": "string"
                }
            ],
            "summary": "string",
            "recommendations": ["string"]
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
            return {
                "report_type": "Unknown",
                "parameters": [],
                "abnormal_findings": [],
                "summary": "Failed to analyze report",
                "recommendations": ["Please consult with a healthcare professional"]
            }
    except Exception as e:
        print(f"Error analyzing medical report: {str(e)}")
        return {
            "report_type": "Error",
            "parameters": [],
            "abnormal_findings": [],
            "summary": f"Error analyzing report: {str(e)}",
            "recommendations": ["Please consult with a healthcare professional"]
        }

@app.route('/api/analyze_medical_report', methods=['POST'])
def analyze_medical_report_endpoint():
    """API endpoint to analyze uploaded medical report images."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        if file:
 
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            try:
                result = analyze_medical_report(filepath)
                return jsonify(result)
            except Exception as e:
                return jsonify({"error": str(e)}), 500
            finally:
              
                if os.path.exists(filepath):
                    os.remove(filepath)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    # Set host to 0.0.0.0 to make it accessible from outside the container
    # For production, use a production WSGI server like Gunicorn
    app.run(debug=False)