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
  
  
};
export default Prescription;