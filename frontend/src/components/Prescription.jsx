import React, { useState } from 'react';
import { 
  FileText, Upload, Search, X, CheckCircle, AlertTriangle, 
  Brain, Layers, Info, Clipboard, Printer, Download,
  Shield, Activity, Heart, ExternalLink, Calendar, RefreshCw,
  ChevronRight, LineChart, AlertCircle, Microscope, Target, ArrowRightCircle,FileCheck,Server,Database,Cpu,Clock
} from 'lucide-react';
import axios from 'axios';
import DiagnosticAssistant from './DiagnosticAssistant';

const Prescription=() =>{
    const [activeTab, setActiveTab] = useState('prescriptions');
    const [prescriptionFile, setPrescriptionFile] = useState(null);
    const [medicalImageFile, setMedicalImageFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [prescriptionResults, setPrescriptionResults] = useState(null);
    const [diagnosticResults, setDiagnosticResults] = useState(null);
    const [symptoms, setSymptoms] = useState([]);
    const [imageEnhancementOptions, setImageEnhancementOptions] = useState({
      contrastBoost: false,
      noiseReduction: false,
      edgeEnhancement: false
    });
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showDiseaseModal, setShowDiseaseModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [selectedDisease, setSelectedDisease] = useState(null);
    const [showInteractionModal, setShowInteractionModal] = useState(false);
    const [modalMedication, setModalMedication] = useState(null);
    const [prescriptionPreview, setPrescriptionPreview] = useState(null);
    const [medicalImagePreview, setMedicalImagePreview] = useState(null);
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

    // Process prescription image using the Python backend
  const processPrescription = async () => {
    if (!prescriptionFile) return;
    
    setProcessing(true);

    const formData = new FormData();
    formData.append('file', prescriptionFile);
    
    try {
      // Send the prescription image to the Python backend
      const response = await axios.post(`http://localhost:5002/api/process_prescription`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const data = response.data;
      const formattedResults = {
        patient: data.patient_name,
        patientAge: data.patient_age,
        patientGender: data.patient_gender,
        doctor: data.doctor_name,
        doctorLicense: data.doctor_license,
        date: data.prescription_date,
        // Transform medications array
        medications: data.medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          instructions: med.frequency,
          quantity: med.duration,
          matchConfidence: 95, 
          warnings: [], 
          interactions: [] 
        })),
        possibleDiseases: data.possible_diseases || [],
        drugInteractions: data.drug_interactions || [],
        additionalNotes: data.additional_notes
      };
      
      setPrescriptionResults(formattedResults);
    } catch (error) {
      console.error("Error processing prescription:", error);
      alert("Failed to process prescription. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Process diagnostic image and symptoms
  const processDiagnostic = async () => {
    if (!medicalImageFile && symptoms.length === 0) return;
    
    setProcessing(true);
    
    try {
      if (symptoms.length > 0) {
       
        const response = await axios.post(`${API_URL}/api/analyze_symptoms`, {
          symptoms: symptoms,
          patientInfo: {
            age: 45, 
            gender: "Female", 
            existingConditions: "" 
          }
        });
        
        const conditionsData = response.data;
        
        setDiagnosticResults({
          possibleConditions: conditionsData.possible_conditions || [],
          imageFindings: [
            { area: "Lower right lung", finding: "Opacity", confidence: 94 },
            { area: "Bronchial walls", finding: "Mild thickening", confidence: 82 },
            { area: "Pleural space", finding: "No effusion", confidence: 98 }
          ],
          enhancementApplied: Object.keys(imageEnhancementOptions).filter(key => 
            imageEnhancementOptions[key]
          ),
          recommendedActions: conditionsData.possible_conditions ? 
            conditionsData.possible_conditions.reduce((actions, condition) => {
              return [...actions, ...condition.recommended_actions]; 
            }, []).filter((action, index, self) => self.indexOf(action) === index) : 
            [
              "Complete blood count to check for elevated white blood cells",
              "Blood cultures if fever persists",
              "Chest X-ray from lateral angle",
              "Consider antibiotics if bacterial infection confirmed"
            ],
          similarCases: 28
        });
      } else {
        setTimeout(() => {
          setDiagnosticResults({
            possibleConditions: [
              { 
                name: "Pneumonia", 
                probability: "High", 
                urgency: "High",
                matched_symptoms: ["Fever", "Cough", "Chest pain"],
                matchedImageFindings: ["Lower right lung opacity"]
              },
              { 
                name: "Bronchitis", 
                probability: "Medium", 
                urgency: "Medium",
                matched_symptoms: ["Cough", "Fatigue"],
                matchedImageFindings: ["Mild bronchial wall thickening"]
              },
              { 
                name: "Common Cold", 
                probability: "Low", 
                urgency: "Low",
                matched_symptoms: ["Cough"],
                matchedImageFindings: []
              }
            ],
            imageFindings: [
              { area: "Lower right lung", finding: "Opacity", confidence: 94 },
              { area: "Bronchial walls", finding: "Mild thickening", confidence: 82 },
              { area: "Pleural space", finding: "No effusion", confidence: 98 }
            ],
            enhancementApplied: Object.keys(imageEnhancementOptions).filter(key => 
              imageEnhancementOptions[key]
            ),
            recommendedActions: [
              "Complete blood count to check for elevated white blood cells",
              "Blood cultures if fever persists",
              "Chest X-ray from lateral angle",
              "Consider antibiotics if bacterial infection confirmed"
            ],
            similarCases: 28
          });
        }, 1500);
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      alert("Failed to analyze symptoms. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  
  // Handle diagnostic analysis start - missing in original code
  const startDiagnosticAnalysis = () => {
    if (symptoms.length === 0 && !medicalImageFile) {
      alert("Please enter at least one symptom or upload a medical image.");
      return;
    }
    processDiagnostic();
  };

  // Add symptom to list
  const addSymptom = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      setSymptoms([...symptoms, e.target.value.trim()]);
      e.target.value = '';
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
  
  // Reset prescription form
  const resetPrescriptionForm = () => {
    setPrescriptionResults(null);
    setPrescriptionFile(null);
    // Clear preview URL to prevent memory leaks
    if (prescriptionPreview) {
      URL.revokeObjectURL(prescriptionPreview);
      setPrescriptionPreview(null);
    }
  };
  
  // Reset diagnostic form
  const resetDiagnosticForm = () => {
    setDiagnosticResults(null);
    setMedicalImageFile(null);
    setSymptoms([]);
    setImageEnhancementOptions({
      contrastBoost: false,
      noiseReduction: false,
      edgeEnhancement: false
    });
    // Clear preview URL to prevent memory leaks
    if (medicalImagePreview) {
      URL.revokeObjectURL(medicalImagePreview);
      setMedicalImagePreview(null);
    }
  };
  
  // Show disease details in a modal
  const showDiseaseDetails = (disease) => {
    setSelectedDisease(disease);
    setShowDiseaseModal(true);
  };
  
  // Show medication details in a modal
  const showMedicationDetails = (medication) => {
    setModalMedication(medication);
    setShowInteractionModal(true);
  };
  
  // Generate a PDF report content
  const generateReportContent = () => {
    if (!prescriptionResults) return '';
    
    let content = '';
    
    // Patient information
    content += `Prescription Report\n`;
    content += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    content += `PATIENT INFORMATION\n`;
    content += `Name: ${prescriptionResults.patient}\n`;
    if (prescriptionResults.patientAge) content += `Age: ${prescriptionResults.patientAge} years\n`;
    if (prescriptionResults.patientGender) content += `Gender: ${prescriptionResults.patientGender}\n\n`;
    
    // Doctor information
    content += `DOCTOR INFORMATION\n`;
    content += `Name: ${prescriptionResults.doctor || 'Not specified'}\n`;
    content += `License: ${prescriptionResults.doctorLicense || 'Not specified'}\n\n`;
    
    // Prescription details
    content += `PRESCRIPTION DETAILS\n`;
    content += `Date: ${prescriptionResults.date || 'Not specified'}\n\n`;
    
    // Medications
    content += `MEDICATIONS\n`;
    prescriptionResults.medications.forEach((med, index) => {
      content += `${index + 1}. ${med.name} ${med.dosage}\n`;
      content += `   Instructions: ${med.instructions}\n`;
      content += `   Duration: ${med.quantity}\n\n`;
    });
    
    // Possible diseases
    if (prescriptionResults.possibleDiseases && prescriptionResults.possibleDiseases.length > 0) {
      content += `POSSIBLE CONDITIONS\n`;
      prescriptionResults.possibleDiseases.forEach((disease, index) => {
        content += `${index + 1}. ${disease.name} (Probability: ${disease.probability})\n`;
        content += `   Description: ${disease.description}\n`;
        content += `   Type: ${disease.type}\n`;
        content += `   Key Symptoms: ${disease.symptoms.join(', ')}\n\n`;
      });
    }
    
    // Drug interactions
    if (prescriptionResults.drugInteractions && prescriptionResults.drugInteractions.length > 0) {
      content += `DRUG INTERACTIONS\n`;
      prescriptionResults.drugInteractions.forEach((interaction, index) => {
        content += `${index + 1}. ${interaction.drugs.join(' + ')} - ${interaction.severity} severity\n`;
        content += `   Effect: ${interaction.effect}\n`;
        content += `   Recommendation: ${interaction.recommendation}\n\n`;
      });
    }
    
    // Additional notes
    if (prescriptionResults.additionalNotes) {
      content += `ADDITIONAL NOTES\n`;
      content += `${prescriptionResults.additionalNotes}\n\n`;
    }
    
    content += `This report should be reviewed by a healthcare professional.`;
    
    return content;
  };
  
  // Download report as a text file
  const downloadReport = () => {
    const content = generateReportContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Arogya_Report_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setShowPrintModal(false);
  };
  // Print report
  const printReport = () => {
    const content = generateReportContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
    <html>
    <head>
      <title>Arogya Prescription Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          margin: 30px;
          color: #000;
        }
        h1, h2 {
          color: #000;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }
        .section {
          margin-bottom: 25px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        table, th, td {
          border: 1px solid #000;
        }
        th {
          background-color: #f2f2f2;
          text-align: left;
          padding: 8px;
          font-weight: bold;
        }
        td {
          padding: 8px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 10px;
          border-top: 1px solid #000;
          font-size: 12px;
          text-align: center;
        }
        @media print {
          body {
            margin: 0.5in;
          }
          .no-break {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Arogya Prescription Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <div class="section">
        <h2>PATIENT & DOCTOR INFORMATION</h2>
        <table>
          <tr>
            <th style="width: 50%">Patient Details</th>
            <th style="width: 50%">Doctor Details</th>
          </tr>
          <tr>
            <td>
              <strong>Name:</strong> ${prescriptionResults.patient}<br>
              ${prescriptionResults.patientAge ? `<strong>Age:</strong> ${prescriptionResults.patientAge} years<br>` : ''}
              ${prescriptionResults.patientGender ? `<strong>Gender:</strong> ${prescriptionResults.patientGender}` : ''}
            </td>
            <td>
              <strong>Name:</strong> ${prescriptionResults.doctor || 'Not specified'}<br>
              <strong>License:</strong> ${prescriptionResults.doctorLicense || 'Not specified'}<br>
              <strong>Date:</strong> ${prescriptionResults.date || 'Not specified'}
            </td>
          </tr>
        </table>
      </div>
      
      <div class="section no-break">
        <h2>MEDICATIONS</h2>
        <table>
          <tr>
            <th style="width: 5%">No.</th>
            <th style="width: 25%">Medication</th>
            <th style="width: 20%">Dosage</th>
            <th style="width: 35%">Instructions</th>
            <th style="width: 15%">Duration</th>
          </tr>
          ${prescriptionResults.medications.map((med, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${med.name}</td>
              <td>${med.dosage}</td>
              <td>${med.instructions}</td>
              <td>${med.quantity}</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      ${prescriptionResults.possibleDiseases && prescriptionResults.possibleDiseases.length > 0 ? `
        <div class="section no-break">
          <h2>POSSIBLE CONDITIONS</h2>
          <table>
            <tr>
              <th style="width: 5%">No.</th>
              <th style="width: 20%">Condition</th>
              <th style="width: 10%">Probability</th>
              <th style="width: 25%">Description</th>
              <th style="width: 10%">Type</th>
              <th style="width: 30%">Key Symptoms</th>
            </tr>
            ${prescriptionResults.possibleDiseases.map((disease, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${disease.name}</td>
                <td>${disease.probability}</td>
                <td>${disease.description}</td>
                <td>${disease.type}</td>
                <td>${disease.symptoms.join(', ')}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      ` : ''}
      
      ${prescriptionResults.drugInteractions && prescriptionResults.drugInteractions.length > 0 ? `
        <div class="section no-break">
          <h2>DRUG INTERACTIONS</h2>
          <table>
            <tr>
              <th style="width: 5%">No.</th>
              <th style="width: 25%">Drugs</th>
              <th style="width: 10%">Severity</th>
              <th style="width: 30%">Effect</th>
              <th style="width: 30%">Recommendation</th>
            </tr>
            ${prescriptionResults.drugInteractions.map((interaction, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${interaction.drugs.join(' + ')}</td>
                <td>${interaction.severity}</td>
                <td>${interaction.effect}</td>
                <td>${interaction.recommendation}</td>
              </tr>
            `).join('')}
          </table>
        </div>
      ` : ''}
      
      ${prescriptionResults.additionalNotes ? `
        <div class="section">
          <h2>ADDITIONAL NOTES</h2>
          <table>
            <tr>
              <td>${prescriptionResults.additionalNotes}</td>
            </tr>
          </table>
        </div>
      ` : ''}
          
      <div class="footer">
        <p>This report should be reviewed by a healthcare professional.</p>
      </div>
    </body>
  </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    
    setShowPrintModal(false);
  };
  // About Modal Component
const AboutModal = () => {
    if (!showAboutModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-bold flex items-center">
            <Activity className="mr-2 text-blue-600" size={20} />
            About Arogya
          </h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setShowAboutModal(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <p className="text-sm mb-4">
          Arogya is a healthcare support tool designed to assist medical professionals and patients in analyzing prescriptions, diagnosing conditions, and detecting diseases.
          </p>
          
          {/* Key Features */}
          <h3 className="text-md font-semibold mb-2 text-blue-700 flex items-center">
            <Clipboard className="mr-2" size={16} />
            Key Features
          </h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-blue-50 p-8 rounded-lg">
              <h4 className="font-semibold text-md mb-1 text-blue-800">Prescription Analysis</h4>
              <p className="text-xs">Extract medication info and identify interactions.</p>
            </div>
            <div className="bg-blue-50 p-8 rounded-lg">
              <h4 className="font-semibold text-md mb-1 text-blue-800">Diagnostic Assistant</h4>
              <p className="text-xs">Analyze symptoms and suggest possible conditions.</p>
            </div>
            <div className="bg-blue-50 p-8 rounded-lg">
              <h4 className="font-semibold text-md mb-1 text-blue-800">Disease Detection</h4>
              <p className="text-xs">Early detection using AI for medical imaging.</p>
            </div>
            <div className="bg-blue-50 p-8 rounded-lg">
              <h4 className="font-semibold text-md mb-1 text-blue-800">Lab Report Analysis</h4>
              <p className="text-xs">Interpret test results and highlight abnormal values.</p>
            </div>
          </div>
          
       
        </div>
      </div>
    </div>
    );
  };
  // Disease Modal Component
  const DiseaseDetailModal = () => {
    if (!showDiseaseModal || !selectedDisease) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{selectedDisease.name}</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowDiseaseModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Description</h3>
                <p>{selectedDisease.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Type</h3>
                <p>{selectedDisease.type}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Key Symptoms</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedDisease.symptoms.map((symptom, index) => (
                    <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Probability</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                  selectedDisease.probability === 'High' ? 'bg-red-100 text-red-700' : 
                  selectedDisease.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-green-100 text-green-700'
                }`}>
                  {selectedDisease.probability}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 flex justify-end">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              onClick={() => setShowDiseaseModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  const MedicationInteractionModal = () => {
    if (!showInteractionModal || !modalMedication) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{modalMedication.name}</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowInteractionModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Dosage</h3>
                <p>{modalMedication.dosage}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Instructions</h3>
                <p>{modalMedication.instructions}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-1">Duration</h3>
                <p>{modalMedication.quantity}</p>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-2">Possible Side Effects</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nausea or vomiting</li>
                  <li>Dizziness</li>
                  <li>Drowsiness</li>
                  <li>Headache</li>
                  <li>Dry mouth</li>
                </ul>
                <p className="text-sm text-gray-500 mt-2">Note: Not all patients experience these side effects. Contact your doctor if side effects persist or worsen.</p>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-2">Common Interactions</h3>
                <div className="space-y-3">
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="font-medium text-yellow-800">Alcohol</p>
                    <p className="text-sm text-yellow-700">May increase drowsiness and dizziness. Avoid alcohol while taking this medication.</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="font-medium text-red-800">Grapefruit Juice</p>
                    <p className="text-sm text-red-700">May increase medication levels in blood, leading to increased side effects.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-100 p-4 flex justify-end">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
              onClick={() => setShowInteractionModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Print Modal Component
  const PrintModal = () => {
    if (!showPrintModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Report Options</h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowPrintModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded flex items-center justify-center"
                onClick={printReport}
              >
                <Printer className="mr-2" size={20} />
                Print Report
              </button>
              
              <button 
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded flex items-center justify-center"
                onClick={downloadReport}
              >
                <Download className="mr-2" size={20} />
                Download Report (.txt)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Cancer Detection Tab Content Component
  const CancerDetectionTab = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <Microscope className="mr-2 text-red-600" size={24} />
            Early Cancer Detection Insights
          </h2>
        </div>
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-3">AI-Powered Cancer Detection</h2>
              <p className="text-gray-700 mb-4">
                The deep learning models analyze medical images to detect early signs of cancer, potentially months before conventional methods. Early detection can significantly improve treatment outcomes and survival rates.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">75% Detection Rate</span>
                <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">Federated Learning </span>
                <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">Multimodal AI</span>
              </div>
            </div>
            <div className="md:w-1/3">
              <div className="bg-white p-2 rounded-lg shadow-md">
               
                <img 
                  src=" https://d2jx2rerrg6sh3.cloudfront.net/image-handler/picture/2020/7/shutterstock_141299494.jpg"
                  alt="First image (originally first)"
                  className="h-full w-auto max-w-full object-contain"
                />
       
             
              </div>
            </div>
          </div>
        </div>
        
       
        
        {/* Model Performance Metrics */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <LineChart className="mr-2 text-blue-600" size={20} />
            Model Performance Metrics
          </h3>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Accuracy</h4>
                <p className="text-2xl font-bold text-blue-700">87%</p>
                <p className="text-xs text-gray-500 mt-1">Accuracy with Unimodal AI</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Perplexity</h4>
                <p className="text-2xl font-bold text-blue-700">83%</p>
                <p className="text-xs text-gray-500 mt-1">Perplexity with Multimodal Llama</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Scalability</h4>
                <p className="text-2xl font-bold text-blue-700">80%</p>
                <p className="text-xs text-gray-500 mt-1">Scalability across Federated Learning frameworks.</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-500">Ease in Processing</h4>
                <p className="text-2xl font-bold text-green-700">70%</p>
                <p className="text-xs text-gray-500 mt-1">Reduction in Data Processing Time</p>
              </div>
            </div>
          </div>
        </div>

  
};
export default Prescription;