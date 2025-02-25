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
  
  const API_URL = process.env.REACT_APP_API_URL || 'https://arogya-899z.onrender.com';

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

    // Show disease details in a modal
  const showDiseaseDetails = (disease) => {
    setSelectedDisease(disease);
    setShowDiseaseModal(true);
  };
  
  // Handle patient info changes
  const handlePatientInfoChange = (e) => {
    const { name, value } = e.target;
    setPatientInfo({
      ...patientInfo,
      [name]: value
    });
  };

  // Handle file selection for medical images
  const handleImageFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (!file.type.includes('image/')) {
        setError("Please upload a valid image file (JPEG, PNG, etc.)");
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit. Please upload a smaller image.");
        return;
      }
      
      setMedicalImageFile(file);
      // Create and store preview URL
      const previewUrl = URL.createObjectURL(file);
      setMedicalImagePreview(previewUrl);
      setError(null);
    }
  };
  // Handle file selection
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (!file.type.includes('image/')) {
        setError("Please upload a valid image file (JPEG, PNG, etc.)");
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit. Please upload a smaller image.");
        return;
      }
      
      setMedicalImageFile(file);
      // Create and store preview URL
      const previewUrl = URL.createObjectURL(file);
      setMedicalImagePreview(previewUrl);
      setError(null);
    }
  };
  // Handle file selection for medical reports
  const handleReportFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file type
      if (!file.type.includes('image/')) {
        setError("Please upload a valid image file (JPEG, PNG, etc.)");
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit. Please upload a smaller image.");
        return;
      }
      
      setReportFile(file);
      // Create and store preview URL
      const previewUrl = URL.createObjectURL(file);
      setReportPreview(previewUrl);
      setError(null);
    }
  };
// Get severity class for condition probability and urgency
const getSeverityClass = (level) => {
    const lowLevel = level?.toLowerCase();
    if (lowLevel === 'high' || lowLevel === 'emergency' || lowLevel === 'severe') {
      return 'bg-red-100 text-red-700';
    } else if (lowLevel === 'medium' || lowLevel === 'urgent' || lowLevel === 'moderate') {
      return 'bg-yellow-100 text-yellow-700';
    } else {
      return 'bg-green-100 text-green-700';
    }
  };
  
  // Get status class for lab values
  const getStatusClass = (status) => {
    const lowStatus = status?.toLowerCase();
    if (lowStatus === 'high') {
      return 'bg-red-100 text-red-700';
    } else if (lowStatus === 'low') {
      return 'bg-blue-100 text-blue-700';
    } else {
      return 'bg-green-100 text-green-700';
    }
  };
    
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'symptoms'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('symptoms')}
            >
              <div className="flex items-center">
                <Activity className="mr-2" size={18} />
                Symptom Analysis
              </div>
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'image'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('image')}
            >
              <div className="flex items-center">
                <ImageIcon className="mr-2" size={18} />
                Image Analysis
              </div>
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'report'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('report')}
            >
              <div className="flex items-center">
                <FileBarChart className="mr-2" size={18} />
                Lab Report Analysis
              </div>
            </button>
          </li>
        </ul>
      </div>
      
      {/* Error message display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {/* Symptom Analysis Tab */}
      {/* Symptom Analysis Tab */}
      {activeTab === 'symptoms' && (
        <>
          {diagnosticResults ? (
            // Symptoms Analysis Results
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Symptom Analysis Results</h2>
                <button 
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded flex items-center"
                  onClick={resetSymptomsForm}
                >
                  <X className="mr-2" size={18} />
                  New Analysis
                </button>
              </div>
              
              {/* Patient Information Summary */}
              {(patientInfo.age || patientInfo.gender || patientInfo.existingConditions) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Patient Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                    {patientInfo.age && (
                      <div className="flex items-center">
                        <Calendar className="text-gray-500 mr-2" size={18} />
                        <span className="text-gray-700">Age: {patientInfo.age}</span>
                      </div>
                    )}
                    {patientInfo.gender && (
                      <div className="flex items-center">
                        <User className="text-gray-500 mr-2" size={18} />
                        <span className="text-gray-700">Gender: {patientInfo.gender}</span>
                      </div>
                    )}
                    {patientInfo.existingConditions && (
                      <div className="flex items-center">
                        <FileText className="text-gray-500 mr-2" size={18} />
                        <span className="text-gray-700">Existing Conditions: {patientInfo.existingConditions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Symptoms Summary */}
              {symptoms.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Reported Symptoms</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {symptoms.map((symptom, index) => (
                        <div key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                          {symptom}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Possible Conditions Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Possible Conditions</h3>
                {diagnosticResults.possible_conditions && diagnosticResults.possible_conditions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="py-3 px-4 text-left border-b">Condition</th>
                          <th className="py-3 px-4 text-left border-b">Probability</th>
                          <th className="py-3 px-4 text-left border-b">Urgency</th>
                          <th className="py-3 px-4 text-left border-b">Matched Symptoms</th>
                          <th className="py-3 px-4 text-left border-b">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnosticResults.possible_conditions.map((condition, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-3 px-4 border-b font-medium">{condition.name}</td>
                            <td className="py-3 px-4 border-b">
                              <span className={`px-2 py-1 rounded text-sm ${getSeverityClass(condition.probability)}`}>
                                {condition.probability}
                              </span>
                            </td>
                            <td className="py-3 px-4 border-b">
                              <span className={`px-2 py-1 rounded text-sm ${getSeverityClass(condition.urgency)}`}>
                                {condition.urgency}
                              </span>
                            </td>
                            <td className="py-3 px-4 border-b">
                              {condition.matched_symptoms && condition.matched_symptoms.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {condition.matched_symptoms.slice(0, 3).map((symptom, idx) => (
                                    <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                                      {symptom}
                                    </span>
                                  ))}
                                  {condition.matched_symptoms.length > 3 && (
                                    <span className="text-gray-500 text-xs">+{condition.matched_symptoms.length - 3} more</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">None</span>
                              )}
                            </td>
                            <td className="py-3 px-4 border-b">
                              <button 
                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm"
                                onClick={() => showDiseaseDetails(condition)}
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
                    No conditions identified based on the provided information.
                  </div>
                )}
              </div>
              
              {/* Disclaimer */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                <h4 className="font-medium flex items-center mb-2">
                  <AlertTriangle className="mr-2" size={18} />
                  Important Medical Disclaimer
                </h4>
                <p>
                  This analysis is for informational purposes only and does not constitute medical advice.
                  Please consult with a qualified healthcare professional for proper diagnosis and treatment.
                  If you are experiencing severe symptoms, seek immediate medical attention.
                </p>
              </div>
            </div>
          ) : (
            // Symptom Input Form
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div>
                {/* Patient Information */}
                <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="patientAge" className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        id="patientAge"
                        name="age"
                        value={patientInfo.age}
                        onChange={handlePatientInfoChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="Enter age"
                        min="0"
                        max="120"
                      />
                    </div>
                    <div>
                      <label htmlFor="patientGender" className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                      </label>
                      <select
                        id="patientGender"
                        name="gender"
                        value={patientInfo.gender}
                        onChange={handlePatientInfoChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="existingConditions" className="block text-sm font-medium text-gray-700 mb-1">
                      Existing Conditions (if any)
                    </label>
                    <textarea
                      id="existingConditions"
                      name="existingConditions"
                      value={patientInfo.existingConditions}
                      onChange={handlePatientInfoChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Enter any existing medical conditions"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                
                {/* Symptom Input */}
                <h3 className="text-lg font-semibold mb-4">Enter Symptoms</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="relative flex">
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-l-lg"
                      placeholder="Type a symptom..."
                      value={symptomInput}
                      onChange={handleSymptomInputChange}
                      onKeyPress={(e) => e.key === 'Enter' && addSymptom(e)}
                    />
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg flex items-center"
                      onClick={addSymptom}
                    >
                      
                      Add
                    </button>
                  </div>
                  
                  {symptoms.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Added Symptoms:</h4>
                      <div className="flex flex-wrap gap-2">
                        {symptoms.map((symptom, index) => (
                          <div key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center">
                            <span>{symptom}</span>
                            <button 
                              className="ml-2 text-blue-700 hover:text-blue-900"
                              onClick={() => removeSymptom(symptom)}
                              aria-label={`Remove symptom ${symptom}`}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Common Symptoms Suggestions */}
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Common Symptoms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Dizziness'].map((symptom) => (
                        <button
                          key={symptom}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm"
                          onClick={() => {
                            if (!symptoms.includes(symptom)) {
                              setSymptoms([...symptoms, symptom]);
                            }
                          }}
                        >
                          {symptom}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Information and Buttons Section */}
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-blue-800">
                    <Info className="mr-2" size={20} />
                    How Symptom Analysis Works
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Our symptom analyzer uses AI to analyze your symptoms and suggest possible conditions and recommended tests.
                  </p>
                  <ul className="space-y-3 text-blue-800">
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Enter your symptoms using the symptom input field</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Provide any relevant patient information</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Our AI analyzes the data to identify possible conditions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Receive recommendations for tests and next steps</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Review the results with a healthcare professional</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Important Note</h4>
                      <p className="text-yellow-800 text-sm">
                        This tool is for informational purposes only and should not replace proper medical consultation.
                        Always consult with a healthcare professional for medical advice.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col space-y-4">
                  <button
                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                      symptoms.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={symptoms.length === 0 || processing}
                    onClick={processSymptoms}
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="mr-2 animate-spin" size={20} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2" size={20} />
                        Analyze Symptoms
                      </>
                    )}
                  </button>
                  
                  <button
                    className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center"
                    onClick={resetSymptomsForm}
                  >
                    <RefreshCw className="mr-2" size={20} />
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Image Analysis Tab */}
      {activeTab === 'image' && (
        <>
          {imageAnalysisResults ? (
            // Image Analysis Results
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Medical Image Analysis Results</h2>
                <button 
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded flex items-center"
                  onClick={resetImageForm}
                >
                  <X className="mr-2" size={18} />
                  New Analysis
                </button>
              </div>
              
              {/* Medical Image Display */}
              {medicalImagePreview && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Analyzed Medical Image</h3>
                  <div className="bg-gray-50 p-4 rounded-LG max-w-xs">
                    <img 
                      src={medicalImagePreview} 
                      alt="Analyzed medical image" 
                      className="max-w-sm h-auto rounded-lg border border-gray-200 mx-auto"
                      style={{ maxHeight: '300px' }} 
                    />
                    {imageAnalysisResults.enhancementApplied && imageAnalysisResults.enhancementApplied.length > 0 && (
                      <p className="mt-2 text-sm text-gray-600 text-center">
                        Enhancements applied: {imageAnalysisResults.enhancementApplied.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Image Findings Section */}
              {imageAnalysisResults.findings && imageAnalysisResults.findings.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Image Analysis Findings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {imageAnalysisResults.findings.map((finding, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium">{finding.area}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-600">{finding.finding}</span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                            {finding.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Similar Cases Section */}
              {imageAnalysisResults.similar_cases > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Similar Cases</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="flex items-center text-gray-700">
                      <Brain className="mr-2" size={18} />
                      Analysis based on {imageAnalysisResults.similar_cases} similar cases from medical database
                    </p>
                  </div>
                </div>
              )}
              
              {/* Disclaimer */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                <h4 className="font-medium flex items-center mb-2">
                  <AlertTriangle className="mr-2" size={18} />
                  Important Medical Disclaimer
                </h4>
                <p>
                  This image analysis is for informational purposes only and does not constitute medical advice.
                  Please consult with a qualified healthcare professional for proper diagnosis and treatment.
                  The findings should be reviewed by a medical professional.
                </p>
              </div>
            </div>
          ) : (
            // Image Upload Form
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div>
                {/* Medical Image Upload */}
                <h3 className="text-lg font-semibold mb-4">Upload Medical Image</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="medicalImageUpload"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                  />
                  
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      Upload X-ray, MRI, CT scan, or other relevant images
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Supported formats: JPEG, PNG, GIF, WEBP (Max: 5MB)
                    </p>
                    
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
                      onClick={() => document.getElementById('medicalImageUpload').click()}
                    >
                      <Upload className="mr-2" size={16} />
                      Select Image
                    </button>
                  </div>
                  
                  {medicalImageFile && medicalImagePreview && (
                    <div className="mt-4 text-left">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600">Selected: {medicalImageFile.name}</p>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setMedicalImageFile(null);
                            URL.revokeObjectURL(medicalImagePreview);
                            setMedicalImagePreview(null);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <img 
                          src={medicalImagePreview} 
                          alt="Medical image preview" 
                          className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 mx-auto" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {medicalImageFile && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Image Enhancement Options:</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={imageEnhancementOptions.contrastBoost}
                          onChange={() => toggleEnhancement('contrastBoost')}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>Contrast Boost</span>
                        <span className="text-xs text-gray-500 ml-2">(Enhances visibility of features)</span>
                      </label>
                      <label className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={imageEnhancementOptions.noiseReduction}
                          onChange={() => toggleEnhancement('noiseReduction')}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>Noise Reduction</span>
                        <span className="text-xs text-gray-500 ml-2">(Smooths grainy areas)</span>
                      </label>
                      <label className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={imageEnhancementOptions.edgeEnhancement}
                          onChange={() => toggleEnhancement('edgeEnhancement')}
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span>Edge Enhancement</span>
                        <span className="text-xs text-gray-500 ml-2">(Sharpens boundaries)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Information and Buttons Section */}
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-blue-800">
                    <Info className="mr-2" size={20} />
                    How Image Analysis Works
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Our medical image analyzer uses AI to identify structures and abnormalities in your medical images.
                  </p>
                  <ul className="space-y-3 text-blue-800">
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Upload your X-ray, MRI, CT scan, or other medical image</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Apply enhancement options if needed for better visualization</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Our AI analyzes the image and identifies key findings</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Review the findings with a healthcare professional</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Important Note</h4>
                      <p className="text-yellow-800 text-sm">
                        This tool is for informational purposes only and should not replace proper medical consultation.
                        Always have medical images interpreted by a qualified healthcare professional.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col space-y-4">
                  <button
                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                      medicalImageFile
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!medicalImageFile || processing}
                    onClick={processImage}
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="mr-2 animate-spin" size={20} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2" size={20} />
                        Analyze Image
                      </>
                    )}
                  </button>
                  
                  <button
                    className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center"
                    onClick={resetImageForm}
                  >
                    <RefreshCw className="mr-2" size={20} />
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Medical Report Analysis Tab */}
      {activeTab === 'report' && (
        <>
          {reportAnalysisResults ? (
            // Report Analysis Results
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Lab Report Analysis Results</h2>
                <button 
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded flex items-center"
                  onClick={resetReportForm}
                >
                  <X className="mr-2" size={18} />
                  New Analysis
                </button>
              </div>
              
              {/* Medical Report Display */}
              {reportPreview && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Analyzed Report</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <img 
                      src={reportPreview} 
                      alt="Analyzed medical report" 
                      className="max-w-sm h-auto rounded-lg border border-gray-200 mx-auto"
                      style={{ maxHeight: '300px' }} 
                    />
                  </div>
                </div>
              )}
              
              {/* Report Summary Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Report Summary</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-700">Report Type</h4>
                      <p className="text-gray-900 font-semibold">{reportAnalysisResults.report_type || "N/A"}</p>
                    </div>
                    
                    {reportAnalysisResults.test_date && (
                      <div>
                        <h4 className="font-medium text-gray-700">Test Date</h4>
                        <p className="text-gray-900">{reportAnalysisResults.test_date}</p>
                      </div>
                    )}
                  </div>
                  
                  {reportAnalysisResults.patient_info && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Patient Information</h4>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {reportAnalysisResults.patient_info.name && (
                            <div>
                              <span className="text-gray-600 text-sm">Name:</span>
                              <p className="font-medium">{reportAnalysisResults.patient_info.name}</p>
                            </div>
                          )}
                          
                          {reportAnalysisResults.patient_info.id && (
                            <div>
                              <span className="text-gray-600 text-sm">ID:</span>
                              <p className="font-medium">{reportAnalysisResults.patient_info.id}</p>
                            </div>
                          )}
                          
                          {reportAnalysisResults.patient_info.age && (
                            <div>
                              <span className="text-gray-600 text-sm">Age:</span>
                              <p className="font-medium">{reportAnalysisResults.patient_info.age}</p>
                            </div>
                          )}
                          
                          {reportAnalysisResults.patient_info.gender && (
                            <div>
                              <span className="text-gray-600 text-sm">Gender:</span>
                              <p className="font-medium">{reportAnalysisResults.patient_info.gender}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {reportAnalysisResults.summary && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Key Findings</h4>
                      <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-100">
                        {reportAnalysisResults.summary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Test Parameters Section */}
              {reportAnalysisResults.parameters && reportAnalysisResults.parameters.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Test Parameters</h3>
                  <div className="overflow-x-auto">
                  <div className="mb-6">
                    <LabValueChart parameters={reportAnalysisResults.parameters} />
                  </div>
                    <table className="min-w-full bg-white shadow-sm border border-gray-200">
                      <thead className="bg-gray-50 text-sm uppercase">
                        <tr>
                          <th className="py-3 px-4 text-left border-b">Parameter</th>
                          <th className="py-3 px-4 text-left border-b">Value</th>
                          <th className="py-3 px-4 text-left border-b">Unit</th>
                          <th className="py-3 px-4 text-left border-b">Reference Range</th>
                          <th className="py-3 px-4 text-left border-b">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportAnalysisResults.parameters.map((param, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-3 px-4 border-b font-medium">{param.name}</td>
                            <td className="py-3 px-4 border-b">{param.value}</td>
                            <td className="py-3 px-4 border-b">{param.unit || "-"}</td>
                            <td className="py-3 px-4 border-b">{param.reference_range || "Not specified"}</td>
                            <td className="py-3 px-4 border-b">
                              {param.status && (
                                <span className={`px-2 py-1 rounded text-sm ${getStatusClass(param.status)}`}>
                                  {param.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                       </div>
              )}
              
              {/* Abnormal Findings Section */}
              {reportAnalysisResults.abnormal_findings && reportAnalysisResults.abnormal_findings.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Abnormal Findings</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {reportAnalysisResults.abnormal_findings.map((finding, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <div className="flex-grow">
                            <h4 className="font-medium flex items-center">
                              <span className="mr-2">{finding.parameter}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getSeverityClass(finding.severity)}`}>
                                {finding.severity}
                              </span>
                            </h4>
                            <p className="text-gray-800 mt-1">{finding.interpretation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Recommendations Section */}
              {reportAnalysisResults.recommendations && reportAnalysisResults.recommendations.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {reportAnalysisResults.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Disclaimer */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
                <h4 className="font-medium flex items-center mb-2">
                  <AlertTriangle className="mr-2" size={18} />
                  Important Medical Disclaimer
                </h4>
                <p>
                  This analysis is for informational purposes only and does not constitute medical advice.
                  Please consult with a qualified healthcare professional for proper interpretation of your lab results.
                  If you have any concerns about your test results, seek immediate medical attention.
                </p>
              </div>
            </div>
          ) : (
            // Report Upload Form
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div>
                {/* Medical Report Upload */}
                <h3 className="text-lg font-semibold mb-4">Upload Medical Report</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="medicalReportUpload"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleReportFileSelect}
                  />
                  
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      Upload blood tests, pathology reports, or other lab result images
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Supported formats: JPEG, PNG, GIF, WEBP (Max: 5MB)
                    </p>
                    
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center"
                      onClick={() => document.getElementById('medicalReportUpload').click()}
                    >
                      <Upload className="mr-2" size={16} />
                      Select Report Image
                    </button>
                  </div>
                  
                  {reportFile && reportPreview && (
                    <div className="mt-4 text-left">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600">Selected: {reportFile.name}</p>
                        <button 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setReportFile(null);
                            URL.revokeObjectURL(reportPreview);
                            setReportPreview(null);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <img 
                          src={reportPreview} 
                          alt="Medical report preview" 
                          className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 mx-auto" 
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium mb-3">What reports can be analyzed?</h4>
                  <div className="space-y-3">
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <FileBarChart className="text-blue-600 mr-3 flex-shrink-0" size={20} />
                      <div>
                        <h5 className="font-medium">Blood Tests</h5>
                        <p className="text-sm text-gray-600">Complete Blood Count (CBC), Comprehensive Metabolic Panel, Lipid Panel, etc.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <FileBarChart className="text-blue-600 mr-3 flex-shrink-0" size={20} />
                      <div>
                        <h5 className="font-medium">Pathology Reports</h5>
                        <p className="text-sm text-gray-600">Histopathology results, biopsy reports, etc.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <FileBarChart className="text-blue-600 mr-3 flex-shrink-0" size={20} />
                      <div>
                        <h5 className="font-medium">Specialty Tests</h5>
                        <p className="text-sm text-gray-600">Hormone panels, vitamin levels, urinalysis, etc.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Information and Buttons Section */}
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center text-blue-800">
                    <Info className="mr-2" size={20} />
                    How Lab Report Analysis Works
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Our lab report analyzer uses AI to interpret your test results and provide insights about your health markers.
                  </p>
                  <ul className="space-y-3 text-blue-800">
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Upload a photo of your lab report or test results</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Our AI extracts all test parameters, values, and reference ranges</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Abnormal values are automatically identified and explained</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Receive personalized insights and recommended follow-up actions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={18} />
                      <span>Review the results with a healthcare professional</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertTriangle className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Important Note</h4>
                      <p className="text-yellow-800 text-sm">
                        This tool is for informational purposes only and should not replace proper medical consultation.
                        Always have your lab results interpreted by a qualified healthcare professional.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col space-y-4">
                  <button
                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center ${
                      reportFile
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!reportFile || processing}
                    onClick={processReport}
                  >
                    {processing ? (
                      <>
                        <RefreshCw className="mr-2 animate-spin" size={20} />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2" size={20} />
                        Analyze Lab Report
                      </>
                    )}
                  </button>
                  
                  <button
                    className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center"
                    onClick={resetReportForm}
                  >
                    <RefreshCw className="mr-2" size={20} />
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Disease Details Modal */}
      {showDiseaseModal && selectedDisease && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedDisease.name}</h3>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowDiseaseModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                selectedDisease.probability === 'High' ? 'bg-red-100 text-red-700' : 
                selectedDisease.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-green-100 text-green-700'
              }`}>
                {selectedDisease.probability} probability
              </span>
              
              <span className={`inline-block px-3 py-1 rounded-full text-sm ml-2 ${
                selectedDisease.urgency === 'High' || selectedDisease.urgency === 'emergency' ? 'bg-red-100 text-red-700' : 
                selectedDisease.urgency === 'Medium' || selectedDisease.urgency === 'urgent' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-green-100 text-green-700'
              }`}>
                {selectedDisease.urgency} urgency
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg mb-2">Description</h4>
                <p className="text-gray-700">{selectedDisease.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-lg mb-2">Matched Symptoms</h4>
                <ul className="list-disc pl-5 text-gray-700">
                  {selectedDisease.matched_symptoms && selectedDisease.matched_symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-lg mb-2">Recommended Actions</h4>
                <ul className="list-disc pl-5 text-gray-700">
                  {selectedDisease.recommended_actions && selectedDisease.recommended_actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-4">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                  onClick={() => window.open(`https://www.ncbi.nlm.nih.gov/search/all/?term=${encodeURIComponent(selectedDisease.name)}`, '_blank')}
                >
                  <ExternalLink className="mr-2" size={16} />
                  Learn More (PubMed)
                </button>
              </div>
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              <h4 className="font-medium flex items-center mb-2">
                <Info className="mr-2" size={16} />
                Disclaimer
              </h4>
              <p>
                This information is for educational purposes only and should not be used for self-diagnosis.
                Always consult with a healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );


};
export default Diagnostic;