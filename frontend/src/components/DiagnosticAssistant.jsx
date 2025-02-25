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
  




};
export default Diagnostic;