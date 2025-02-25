import React, { useState, useRef } from 'react';
import LabValueChart from './LabValueChart';
import { 
  Upload, Search, X, CheckCircle, AlertTriangle, 
  Brain, Info, ExternalLink, RefreshCw, 
  FileText, Activity, User, Calendar, Image as ImageIcon,
  FileBarChart, ArrowUpDown, ThumbsUp, ThumbsDown
} from 'lucide-react';
import axios from 'axios';

const Diagnostic=() =>{
  // State for managing tabs
  const [activeTab, setActiveTab] = useState('symptoms');
  
  // State for symptom analysis
  const [processing, setProcessing] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [patientInfo, setPatientInfo] = useState({
    age: '',
    gender: '',
    existingConditions: ''
  });
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  
  // State for image analysis
  const [medicalImageFile, setMedicalImageFile] = useState(null);
  const [medicalImagePreview, setMedicalImagePreview] = useState(null);
  const [imageEnhancementOptions, setImageEnhancementOptions] = useState({
    contrastBoost: false,
    noiseReduction: false,
    edgeEnhancement: false
  });
  const [imageAnalysisResults, setImageAnalysisResults] = useState(null);
  
  // State for medical report analysis
  const [reportFile, setReportFile] = useState(null);
  const [reportPreview, setReportPreview] = useState(null);
  const [reportAnalysisResults, setReportAnalysisResults] = useState(null);
  
  // Shared state
  const [error, setError] = useState(null);
  const [showDiseaseModal, setShowDiseaseModal] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

  // Process symptoms
  const processSymptoms = async () => {
    if (symptoms.length === 0) {
      setError("Please enter at least one symptom.");
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      const symptomsData = {
        symptoms: symptoms,
        patientInfo: {
          age: patientInfo.age || '',
          gender: patientInfo.gender || '',
          existingConditions: patientInfo.existingConditions || '',
          userInput: symptomInput || '' // Include current user input if any
        }
      };
      
      const symptomsResponse = await axios.post(
        `${API_URL}/api/analyze_symptoms`, 
        symptomsData
      );
      
      setDiagnosticResults(symptomsResponse.data);
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      setError("Failed to analyze symptoms. Please try again. " + 
        (error.response?.data?.error || error.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };
  
// Process medical image
const processImage = async () => {
    if (!medicalImageFile) {
      setError("Please upload a medical image.");
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      const imageFormData = new FormData();
      imageFormData.append('file', medicalImageFile);
      
      // Add enhancement options
      const enhancementsArray = Object.keys(imageEnhancementOptions).filter(key => 
        imageEnhancementOptions[key]
      );
      
      if (enhancementsArray.length > 0) {
        imageFormData.append('enhancements', JSON.stringify(enhancementsArray));
      }
      
      const imageResponse = await axios.post(
        `${API_URL}/api/analyze_medical_image`, 
        imageFormData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setImageAnalysisResults(imageResponse.data);
    } catch (error) {
      console.error("Error analyzing medical image:", error);
      setError("Failed to analyze the image. Please try again. " + 
        (error.response?.data?.error || error.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };
  
  // Process medical report
  const processReport = async () => {
    if (!reportFile) {
      setError("Please upload a medical report.");
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      const reportFormData = new FormData();
      reportFormData.append('file', reportFile);
      
      const reportResponse = await axios.post(
        `${API_URL}/api/analyze_medical_report`, 
        reportFormData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setReportAnalysisResults(reportResponse.data);
    } catch (error) {
      console.error("Error analyzing medical report:", error);
      setError("Failed to analyze the report. Please try again. " + 
        (error.response?.data?.error || error.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle symptom input change
  const handleSymptomInputChange = (e) => {
    setSymptomInput(e.target.value);
  };
  
  // Add symptom to list
  const addSymptom = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && symptomInput.trim() !== '') {
      if (!symptoms.includes(symptomInput.trim())) {
        setSymptoms([...symptoms, symptomInput.trim()]);
      }
      setSymptomInput('');
    }
  };
  
  // Remove symptom from list
  const removeSymptom = (symptomToRemove) => {
    setSymptoms(symptoms.filter(s => s !== symptomToRemove));
  };
  
  // Toggle image enhancement option
  const toggleEnhancement = (option) => {
    setImageEnhancementOptions({
      ...imageEnhancementOptions,
      [option]: !imageEnhancementOptions[option]
    });
  };
  
  // Reset forms
  const resetSymptomsForm = () => {
    setDiagnosticResults(null);
    setSymptoms([]);
    setPatientInfo({
      age: '',
      gender: '',
      existingConditions: ''
    });
    setSymptomInput('');
    setError(null);
  };
  
  const resetImageForm = () => {
    setImageAnalysisResults(null);
    setMedicalImageFile(null);
    setImageEnhancementOptions({
      contrastBoost: false,
      noiseReduction: false,
      edgeEnhancement: false
    });
    setError(null);
    
    // Clear preview URL to prevent memory leaks
    if (medicalImagePreview) {
      URL.revokeObjectURL(medicalImagePreview);
      setMedicalImagePreview(null);
    }
  };
  
  const resetReportForm = () => {
    setReportAnalysisResults(null);
    setReportFile(null);
    setError(null);

     
    // Clear preview URL to prevent memory leaks
    if (reportPreview) {
        URL.revokeObjectURL(reportPreview);
        setReportPreview(null);
      }
    };
    



};
export default Diagnostic;