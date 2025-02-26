# Arogya: AI-Powered Healthcare Support System
- Use deployed application : https://arogya-roan.vercel.app/
- YouTube Link : https://youtu.be/5GKeNg_fuN0?si=4T58ngXhGjE-WTDX
## Overview

Arogya is a comprehensive healthcare support system that leverages advanced AI technologies to assist medical professionals and patients in **analyzing prescriptions**, **diagnosing scans** , **symptoms analysis** and **medical report analysis**. The platform uses cutting-edge image processing, natural language processing, and deep learning techniques to provide accurate medical insights and improve healthcare outcomes.

## Key Features

### 1. Prescription Analysis
- **Automated Medication Extraction**: Uses advanced OCR and AI to extract medication details from handwritten or printed prescriptions
- **Drug Interaction Detection**: Identifies potential harmful interactions between medications
- **Patient & Doctor Information Recognition**: Extracts and organizes patient demographics and physician credentials
- **Possible Disease Inference**: Analyzes prescribed medications to suggest potential underlying conditions
![Prescription Analysis](https://raw.githubusercontent.com/ishani-1255/Arogya/refs/heads/main/project%20photos/Prescription-1.png)
![Prescription Analysis](https://raw.githubusercontent.com/ishani-1255/Arogya/refs/heads/main/project%20photos/Prescription-2.png)
![Prescription Analysis](https://raw.githubusercontent.com/ishani-1255/Arogya/refs/heads/main/project%20photos/prescription-3.png)  

### 2. Diagnostic Assistant
1. **Symptom-Based Analysis**: Evaluates symptoms to identify possible medical conditions with corresponding urgency levels.
![Symptom-Based Analysis](https://raw.githubusercontent.com/ishani-1255/Arogya/refs/heads/main/project%20photos/Symptom%20Analysis.png)
![Symptom-Based Analysis](https://github.com/ishani-1255/Arogya/blob/main/project%20photos/symptom-analysis-result.png?raw=true)
4. **Medical Image Analysis**: Processes X-rays, MRIs, and other medical imagery to detect abnormalities and provides noise reduction, contrast boosting, and edge enhancement to improve medical image clarity.
![Medical Image Analysis](https://github.com/ishani-1255/Arogya/blob/main/project%20photos/image-analysis-1.png?raw=true)
![Medical Image Analysis](https://github.com/ishani-1255/Arogya/blob/main/project%20photos/image-analysis-2.png?raw=true)
7. **Lab Report Interpretation**: Analyzes lab results to identify abnormal values and provide actionable insights.
![Lab Report Interpretation](https://raw.githubusercontent.com/ishani-1255/Arogya/refs/heads/main/project%20photos/Lab%20Analysis-1.png)
![Lab Report Interpretation](https://raw.githubusercontent.com/ishani-1255/Arogya/refs/heads/main/project%20photos/lAB-2.png)
![Lab Report Interpretation](https://raw.githubusercontent.com/ishani-1255/Arogya/refs/heads/main/project%20photos/Lab-3.png)
![Lab Report Interpretation](https://raw.githubusercontent.com/ishani-1255/Arogya/refs/heads/main/project%20photos/Lab-4.png)

### 3. Early Cancer Detection
- **AI-Powered Detection Models**: Implements deep learning algorithms to identify early signs of cancer from medical images
- **Federated Learning Integration**: Uses distributed machine learning across institutions while preserving patient privacy
- **Multimodal Analysis**: Combines different data types to improve detection accuracy
- **Clinical Workflow Integration**: Seamlessly fits into existing healthcare workflows as a supplementary diagnostic tool
![Early Cancer Analysis](https://raw.githubusercontent.com/ishani-1255/Arogya/refs/heads/main/project%20photos/cancer-metrics.png)

## Demo & Deployment

### Live Application
The project is live and deployed at: [https://arogya-roan.vercel.app/](https://arogya-roan.vercel.app/)

### Test Samples
To test the deployed application, use the test samples provided in the `test-samples` folder of the repository:
1. Clone the repository or download the test-sample folder
2. Upload these samples when using the corresponding features in the live application
3. These samples are pre-validated and will demonstrate the full capabilities of each module

## Technology Stack

### Frontend
- React.js with Tailwind CSS for responsive, modern UI
- Recharts for data visualization
- Lucide for icons and UI elements

### Backend
- Flask with Python for the API server
- Google's Generative AI (Gemini 1.5 Flash) for medical text and image analysis
- OpenCV and PIL for advanced image processing and enhancement
- Custom LangChain pipelines for complex medical document processing

## Implementation Details

### AI-Powered Document Analysis
Arogya utilizes a sophisticated document analysis pipeline that combines OCR with specialized medical language models. The system:

1. **Preprocesses Images**: Enhances image quality through adaptive thresholding and noise reduction
2. **Performs Region-Specific OCR**: Uses specialized recognition for different sections of medical documents
3. **Applies Medical NER**: Identifies medications, dosages, and medical terms with high accuracy
4. **Contextual Understanding**: Interprets medical abbreviations and shorthand based on context

### Medical Insight Generation
The system employs several AI models working in concert:

1. **Symptom-Condition Mapping**: Trained on large medical datasets to match symptoms to potential conditions
2. **Medical Image Analysis**: Utilizes segmentation and classification models to identify abnormalities
3. **Lab Value Interpretation**: Compares values against reference ranges with consideration for patient demographics
4. **Cross-Referencing Engine**: Validates findings across multiple knowledge sources for increased reliability


## Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- Google Generative AI API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/arogya.git
cd arogya
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
pip install -r requirements.txt
```

4. Set up environment variables
```bash
# Create .env file in backend directory
GOOGLE_API_KEY=your_api_key
```

5. Start the backend server
```bash
python api.py
```

6. Start the frontend application
```bash
cd ../frontend
npm start
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.


---

**Disclaimer**: Arogya is designed as a supportive tool for healthcare professionals and should not replace professional medical consultation, diagnosis, or treatment.
