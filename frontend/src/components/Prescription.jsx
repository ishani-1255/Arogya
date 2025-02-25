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
};
export default Prescription;