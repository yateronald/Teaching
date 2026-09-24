import React, { useEffect, useState } from 'react';
import {
  CloseOutlined,
  RightOutlined,
  LeftOutlined,
  UserOutlined,
  GlobalOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
  AimOutlined,
  AudioOutlined,
  CustomerServiceOutlined,
  EditOutlined,
  FileTextOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import './DemoRequestModal.css';

interface DemoRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // Step 1: Personal Information
  fullName: string;
  email: string;
  phone: string;
  country: string;
  
  // Step 2: French Learning Background
  hasPreviousExperience: string;
  currentLevel: string;
  previousStudyMethod: string;
  
  // Step 3: Learning Goals & Preferences
  interestedLevel: string;
  learningGoals: string;
  expectations: string;
  
  // Step 4: Scheduling & Availability
  expectedStartTime: string;
  preferredSchedule: string;
  timezone: string;

  // Exam preparation only
  targetExam: string;
  examDate: string;
  targetScore: string;
  skills: string[];
}

/** What the visitor came for. Chosen before any question is asked. */
type Interest = 'classes' | 'exam';

/** The exams the platform prepares for. */
const EXAM_OPTIONS: { value: string; label: string; note: string }[] = [
  { value: 'tcf_canada', label: 'TCF Canada', note: 'Canadian immigration (IRCC)' },
  { value: 'tef_canada', label: 'TEF Canada', note: 'Canadian immigration (IRCC)' },
  { value: 'tcf_quebec', label: 'TCF Quebec', note: 'Quebec immigration' },
  { value: 'tefaq', label: 'TEFAQ', note: 'Quebec immigration' },
  { value: 'tcf_tp', label: 'TCF Tout public', note: 'Level certificate, studies' },
  { value: 'delf', label: 'DELF', note: 'A1 to B2 diploma' },
  { value: 'dalf', label: 'DALF', note: 'C1 to C2 diploma' },
  { value: 'other', label: 'Another exam', note: 'Tell us below' },
];

/** The four papers, in the order every exam presents them. */
const SKILL_OPTIONS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'co', label: 'Listening', icon: <CustomerServiceOutlined /> },
  { value: 'ce', label: 'Reading', icon: <FileTextOutlined /> },
  { value: 'ee', label: 'Writing', icon: <EditOutlined /> },
  { value: 'eo', label: 'Speaking', icon: <AudioOutlined /> },
];

// Commonly used timezones (IANA identifiers with friendly labels)
const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
  { value: 'Europe/London', label: 'Europe/London (UK, GMT/UTC+0)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (France, CET/UTC+1)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (Germany, CET/UTC+1)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (Spain, CET/UTC+1)' },
  { value: 'Europe/Rome', label: 'Europe/Rome (Italy, CET/UTC+1)' },
  { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam (Netherlands, CET/UTC+1)' },
  { value: 'Europe/Zurich', label: 'Europe/Zurich (Switzerland, CET/UTC+1)' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow (MSK/UTC+3)' },
  { value: 'Europe/Istanbul', label: 'Europe/Istanbul (TRT/UTC+3)' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT/UTC+1)' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo (EET/UTC+2)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST/UTC+2)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST/UTC+4)' },
  { value: 'Asia/Tehran', label: 'Asia/Tehran (IRST/UTC+3:30)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT/UTC+5)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST/UTC+5:30)' },
  { value: 'Asia/Dhaka', label: 'Asia/Dhaka (BST/UTC+6)' },
  { value: 'Asia/Yangon', label: 'Asia/Yangon (MMT/UTC+6:30)' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok (ICT/UTC+7)' },
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB/UTC+7)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST/UTC+8)' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (HKT/UTC+8)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT/UTC+8)' },
  { value: 'Asia/Taipei', label: 'Asia/Taipei (CST/UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST/UTC+9)' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul (KST/UTC+9)' },
  { value: 'Asia/Manila', label: 'Asia/Manila (PHT/UTC+8)' },
  { value: 'Australia/Perth', label: 'Australia/Perth (AWST/UTC+8)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/UTC+10)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/UTC+12)' },
  { value: 'America/New_York', label: 'America/New_York (ET/UTC-5)' },
  { value: 'America/Chicago', label: 'America/Chicago (CT/UTC-6)' },
  { value: 'America/Denver', label: 'America/Denver (MT/UTC-7)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PT/UTC-8)' },
  { value: 'America/Phoenix', label: 'America/Phoenix (MST/UTC-7)' },
  { value: 'America/Anchorage', label: 'America/Anchorage (AKST/UTC-9)' },
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu (HST/UTC-10)' },
  { value: 'America/Toronto', label: 'America/Toronto (ET/UTC-5)' },
  { value: 'America/Vancouver', label: 'America/Vancouver (PT/UTC-8)' },
  { value: 'America/Mexico_City', label: 'America/Mexico_City (CST/UTC-6)' },
  { value: 'America/Bogota', label: 'America/Bogota (COT/UTC-5)' },
  { value: 'America/Lima', label: 'America/Lima (PET/UTC-5)' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (BRT/UTC-3)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'America/Argentina/Buenos_Aires (ART/UTC-3)' },
];

const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ isOpen, onClose }) => {
  // Nothing is asked until the visitor says what they came for.
  const [interest, setInterest] = useState<Interest | ''>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [customTimezone, setCustomTimezone] = useState('');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    hasPreviousExperience: '',
    currentLevel: '',
    previousStudyMethod: '',
    interestedLevel: '',
    learningGoals: '',
    expectations: '',
    expectedStartTime: '',
    preferredSchedule: '',
    timezone: '',
    targetExam: '',
    examDate: '',
    targetScore: '',
    skills: [],
  });

  const isExam = interest === 'exam';
  // Exam preparation asks three things; classes ask four.
  const totalSteps = isExam ? 3 : 4;
  /** Short step names for the phone progress caption. */
  const stepNames = isExam
    ? ['Your details', 'Your exam', 'Your practice plan']
    : ['Your details', 'Your French', 'Your goals', 'Your availability'];
  // Use the same base URL logic as AuthContext for consistency.
  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://api.learnfrenchwithnatives.com/api';

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill],
    }));
  };

  /** Picking what you came for is the first thing that happens. */
  const chooseInterest = (choice: Interest) => {
    setInterest(choice);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      if (formData.timezone === 'other' && !customTimezone.trim()) {
        setIsLoading(false);
        setErrorMessage('Please enter your timezone when selecting "Other".');
        setShowErrorModal(true);
        return;
      }
      const payload = {
        ...formData,
        interest: interest || 'classes',
        timezone: formData.timezone === 'other' ? (customTimezone.trim() || '') : formData.timezone,
        // A weekly timetable and a target class level belong to class requests.
        ...(isExam ? { interestedLevel: '', preferredSchedule: '' } : {}),
      };
      const response = await fetch(`${API_BASE_URL}/demo-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch (_) {
        // Non-JSON or empty body (e.g., 404 HTML from dev server) — ignore
      }

      if (response.ok) {
        setShowSuccessModal(true);
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          country: '',
          hasPreviousExperience: '',
          currentLevel: '',
          previousStudyMethod: '',
          interestedLevel: '',
          learningGoals: '',
          expectations: '',
          expectedStartTime: '',
          preferredSchedule: '',
          timezone: '',
          targetExam: '',
          examDate: '',
          targetScore: '',
          skills: [],
        });
        setCustomTimezone('');
        setCurrentStep(1);
        setInterest('');
      } else {
        setErrorMessage(
          (result && (result.message || result.error)) ||
          'Failed to submit demo request. Please try again.'
        );
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error submitting demo request:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      onClose();
      setShowSuccessModal(false);
      setShowErrorModal(false);
      setErrorMessage('');
      setInterest('');
      setCurrentStep(1);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const isShowing = isOpen || showSuccessModal || showErrorModal;

  // While the sheet is up the page behind it stays put, and Escape closes it.
  // Without this the page scrolls under the sheet on a phone as soon as the
  // finger leaves the body of the modal.
  useEffect(() => {
    if (!isShowing) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showSuccessModal) handleSuccessClose();
      else if (showErrorModal) handleErrorClose();
      else handleCloseModal();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [isShowing, showSuccessModal, showErrorModal, isLoading]);

  const isStepValid = () => {
    if (isExam) {
      switch (currentStep) {
        case 1:
          return !!(formData.fullName && formData.email && formData.country);
        case 2:
          return !!(formData.targetExam && formData.currentLevel && formData.hasPreviousExperience);
        case 3:
          return !!(formData.expectedStartTime && formData.learningGoals);
        default:
          return false;
      }
    }
    switch (currentStep) {
      case 1:
        return !!(formData.fullName && formData.email && formData.country);
      case 2:
        return !!(formData.hasPreviousExperience && formData.currentLevel);
      case 3:
        return !!(formData.interestedLevel && formData.learningGoals);
      case 4:
        return !!(formData.expectedStartTime && formData.preferredSchedule);
      default:
        return false;
    }
  };

  /** Step 1 is shared; steps 2 and 3 ask about the exam itself. */
  const renderExamStep = () => {
    switch (currentStep) {
      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <TrophyOutlined className="step-icon" />
              <h3>Your exam</h3>
              <p>So the mock exams you get are the ones you actually sit</p>
            </div>

            <div className="form-group">
              <label>Which exam are you preparing? *</label>
              <div className="choice-grid">
                {EXAM_OPTIONS.map(option => (
                  <button
                    type="button"
                    key={option.value}
                    className={`choice-tile${formData.targetExam === option.value ? ' is-selected' : ''}`}
                    onClick={() => handleInputChange('targetExam', option.value)}
                    aria-pressed={formData.targetExam === option.value}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.note}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Your level today *</label>
                <select
                  value={formData.currentLevel}
                  onChange={(e) => handleInputChange('currentLevel', e.target.value)}
                  className="form-input"
                >
                  <option value="">Select your level</option>
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficient</option>
                  <option value="unsure">I am not sure</option>
                </select>
              </div>
              <div className="form-group">
                <label>Have you sat this exam before? *</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="examTaken"
                      value="yes"
                      checked={formData.hasPreviousExperience === 'yes'}
                      onChange={(e) => handleInputChange('hasPreviousExperience', e.target.value)}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="examTaken"
                      value="no"
                      checked={formData.hasPreviousExperience === 'no'}
                      onChange={(e) => handleInputChange('hasPreviousExperience', e.target.value)}
                    />
                    <span>Not yet</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Exam date</label>
                <input
                  type="date"
                  value={formData.examDate}
                  onChange={(e) => handleInputChange('examDate', e.target.value)}
                  className="form-input"
                  min={new Date().toISOString().slice(0, 10)}
                />
                <small className="form-hint">Leave empty if it is not booked yet.</small>
              </div>
              <div className="form-group">
                <label>Score you need</label>
                <input
                  type="text"
                  value={formData.targetScore}
                  onChange={(e) => handleInputChange('targetScore', e.target.value)}
                  placeholder="e.g. NCLC 7, B2, 450 points"
                  className="form-input"
                  maxLength={32}
                />
                <small className="form-hint">The target your file or school asks for.</small>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <AimOutlined className="step-icon" />
              <h3>Your practice plan</h3>
              <p>What to open for you, and when</p>
            </div>

            <div className="form-group">
              <label>Which papers do you want to practise?</label>
              <div className="skill-grid">
                {SKILL_OPTIONS.map(skill => (
                  <button
                    type="button"
                    key={skill.value}
                    className={`skill-tile${formData.skills.includes(skill.value) ? ' is-selected' : ''}`}
                    onClick={() => toggleSkill(skill.value)}
                    aria-pressed={formData.skills.includes(skill.value)}
                  >
                    <span className="skill-tile-icon">{skill.icon}</span>
                    {skill.label}
                  </button>
                ))}
              </div>
              <small className="form-hint">Pick as many as you like, or leave empty for all four.</small>
            </div>

            <div className="form-group">
              <label>When do you want to start? *</label>
              <select
                value={formData.expectedStartTime}
                onChange={(e) => handleInputChange('expectedStartTime', e.target.value)}
                className="form-input"
              >
                <option value="">Select a time</option>
                <option value="immediately">Right away</option>
                <option value="within_week">Within a week</option>
                <option value="within_month">Within a month</option>
                <option value="in_2_3_months">In two or three months</option>
                <option value="just_exploring">Just exploring for now</option>
              </select>
            </div>

            <div className="form-group">
              <label>What do you want to get out of it? *</label>
              <textarea
                value={formData.learningGoals}
                onChange={(e) => handleInputChange('learningGoals', e.target.value)}
                placeholder="e.g. I keep losing points in writing and I need NCLC 7 before March."
                className="form-input form-textarea"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Anything else we should know?</label>
              <textarea
                value={formData.expectations}
                onChange={(e) => handleInputChange('expectations', e.target.value)}
                placeholder="Previous scores, deadlines, anything that helps us prepare."
                className="form-input form-textarea"
                rows={2}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStepContent = () => {
    if (isExam && currentStep > 1) return renderExamStep();
    switch (currentStep) {
      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <UserOutlined className="step-icon" />
              <h3>Personal Information</h3>
              <p>Let's start with your basic details</p>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label>Country *</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select your country</option>
                  <option value="Afghanistan">Afghanistan</option>
                  <option value="Albania">Albania</option>
                  <option value="Algeria">Algeria</option>
                  <option value="Andorra">Andorra</option>
                  <option value="Angola">Angola</option>
                  <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Armenia">Armenia</option>
                  <option value="Australia">Australia</option>
                  <option value="Austria">Austria</option>
                  <option value="Azerbaijan">Azerbaijan</option>
                  <option value="Bahamas">Bahamas</option>
                  <option value="Bahrain">Bahrain</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Barbados">Barbados</option>
                  <option value="Belarus">Belarus</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Belize">Belize</option>
                  <option value="Benin">Benin</option>
                  <option value="Bhutan">Bhutan</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                  <option value="Botswana">Botswana</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Brunei">Brunei</option>
                  <option value="Bulgaria">Bulgaria</option>
                  <option value="Burkina Faso">Burkina Faso</option>
                  <option value="Burundi">Burundi</option>
                  <option value="Cabo Verde">Cabo Verde</option>
                  <option value="Cambodia">Cambodia</option>
                  <option value="Cameroon">Cameroon</option>
                  <option value="Canada">Canada</option>
                  <option value="Central African Republic">Central African Republic</option>
                  <option value="Chad">Chad</option>
                  <option value="Chile">Chile</option>
                  <option value="China">China</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Comoros">Comoros</option>
                  <option value="Congo">Congo</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Croatia">Croatia</option>
                  <option value="Cuba">Cuba</option>
                  <option value="Cyprus">Cyprus</option>
                  <option value="Czech Republic">Czech Republic</option>
                  <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                  <option value="Denmark">Denmark</option>
                  <option value="Djibouti">Djibouti</option>
                  <option value="Dominica">Dominica</option>
                  <option value="Dominican Republic">Dominican Republic</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Egypt">Egypt</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Equatorial Guinea">Equatorial Guinea</option>
                  <option value="Eritrea">Eritrea</option>
                  <option value="Estonia">Estonia</option>
                  <option value="Eswatini">Eswatini</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Fiji">Fiji</option>
                  <option value="Finland">Finland</option>
                  <option value="France">France</option>
                  <option value="Gabon">Gabon</option>
                  <option value="Gambia">Gambia</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Germany">Germany</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Greece">Greece</option>
                  <option value="Grenada">Grenada</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Guinea">Guinea</option>
                  <option value="Guinea-Bissau">Guinea-Bissau</option>
                  <option value="Guyana">Guyana</option>
                  <option value="Haiti">Haiti</option>
                  <option value="Honduras">Honduras</option>
                  <option value="Hungary">Hungary</option>
                  <option value="Iceland">Iceland</option>
                  <option value="India">India</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Iran">Iran</option>
                  <option value="Iraq">Iraq</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Israel">Israel</option>
                  <option value="Italy">Italy</option>
                  <option value="Ivory Coast">Ivory Coast</option>
                  <option value="Jamaica">Jamaica</option>
                  <option value="Japan">Japan</option>
                  <option value="Jordan">Jordan</option>
                  <option value="Kazakhstan">Kazakhstan</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Kiribati">Kiribati</option>
                  <option value="Kuwait">Kuwait</option>
                  <option value="Kyrgyzstan">Kyrgyzstan</option>
                  <option value="Laos">Laos</option>
                  <option value="Latvia">Latvia</option>
                  <option value="Lebanon">Lebanon</option>
                  <option value="Lesotho">Lesotho</option>
                  <option value="Liberia">Liberia</option>
                  <option value="Libya">Libya</option>
                  <option value="Liechtenstein">Liechtenstein</option>
                  <option value="Lithuania">Lithuania</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Madagascar">Madagascar</option>
                  <option value="Malawi">Malawi</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Maldives">Maldives</option>
                  <option value="Mali">Mali</option>
                  <option value="Malta">Malta</option>
                  <option value="Marshall Islands">Marshall Islands</option>
                  <option value="Mauritania">Mauritania</option>
                  <option value="Mauritius">Mauritius</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Micronesia">Micronesia</option>
                  <option value="Moldova">Moldova</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Mongolia">Mongolia</option>
                  <option value="Montenegro">Montenegro</option>
                  <option value="Morocco">Morocco</option>
                  <option value="Mozambique">Mozambique</option>
                  <option value="Myanmar">Myanmar</option>
                  <option value="Namibia">Namibia</option>
                  <option value="Nauru">Nauru</option>
                  <option value="Nepal">Nepal</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Niger">Niger</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="North Korea">North Korea</option>
                  <option value="North Macedonia">North Macedonia</option>
                  <option value="Norway">Norway</option>
                  <option value="Oman">Oman</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Palau">Palau</option>
                  <option value="Palestine">Palestine</option>
                  <option value="Panama">Panama</option>
                  <option value="Papua New Guinea">Papua New Guinea</option>
                  <option value="Paraguay">Paraguay</option>
                  <option value="Peru">Peru</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Poland">Poland</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Romania">Romania</option>
                  <option value="Russia">Russia</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                  <option value="Saint Lucia">Saint Lucia</option>
                  <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                  <option value="Samoa">Samoa</option>
                  <option value="San Marino">San Marino</option>
                  <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Senegal">Senegal</option>
                  <option value="Serbia">Serbia</option>
                  <option value="Seychelles">Seychelles</option>
                  <option value="Sierra Leone">Sierra Leone</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Slovakia">Slovakia</option>
                  <option value="Slovenia">Slovenia</option>
                  <option value="Solomon Islands">Solomon Islands</option>
                  <option value="Somalia">Somalia</option>
                  <option value="South Africa">South Africa</option>
                  <option value="South Korea">South Korea</option>
                  <option value="South Sudan">South Sudan</option>
                  <option value="Spain">Spain</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="Sudan">Sudan</option>
                  <option value="Suriname">Suriname</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Syria">Syria</option>
                  <option value="Taiwan">Taiwan</option>
                  <option value="Tajikistan">Tajikistan</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Timor-Leste">Timor-Leste</option>
                  <option value="Togo">Togo</option>
                  <option value="Tonga">Tonga</option>
                  <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                  <option value="Tunisia">Tunisia</option>
                  <option value="Turkey">Turkey</option>
                  <option value="Turkmenistan">Turkmenistan</option>
                  <option value="Tuvalu">Tuvalu</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Ukraine">Ukraine</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Uzbekistan">Uzbekistan</option>
                  <option value="Vanuatu">Vanuatu</option>
                  <option value="Vatican City">Vatican City</option>
                  <option value="Venezuela">Venezuela</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Yemen">Yemen</option>
                  <option value="Zambia">Zambia</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <BookOutlined className="step-icon" />
              <h3>French Learning Background</h3>
              <p>Tell us about your French learning experience</p>
            </div>
            
            <div className="form-group">
              <label>Have you learned French before? *</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="hasPreviousExperience"
                    value="yes"
                    checked={formData.hasPreviousExperience === 'yes'}
                    onChange={(e) => handleInputChange('hasPreviousExperience', e.target.value)}
                  />
                  <span>Yes, I have some experience</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="hasPreviousExperience"
                    value="no"
                    checked={formData.hasPreviousExperience === 'no'}
                    onChange={(e) => handleInputChange('hasPreviousExperience', e.target.value)}
                  />
                  <span>No, I'm a complete beginner</span>
                </label>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>What's your current French level? *</label>
                <select
                  value={formData.currentLevel}
                  onChange={(e) => handleInputChange('currentLevel', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select your level</option>
                  <option value="A0">A0 - Complete Beginner</option>
                  <option value="A1">A1 - Elementary</option>
                  <option value="A2">A2 - Pre-Intermediate</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper-Intermediate</option>
                  <option value="C1">C1 - Advanced</option>
                  <option value="C2">C2 - Proficient</option>
                  <option value="unsure">I'm not sure</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>How did you previously study French?</label>
                <select
                  value={formData.previousStudyMethod}
                  onChange={(e) => handleInputChange('previousStudyMethod', e.target.value)}
                  className="form-select"
              >
                <option value="">Select method (optional)</option>
                <option value="school">School/University</option>
                <option value="online">Online courses</option>
                <option value="tutor">Private tutor</option>
                <option value="self-study">Self-study</option>
                <option value="immersion">Immersion/Living in France</option>
                <option value="apps">Language learning apps</option>
                <option value="other">Other</option>
              </select>
                </div>
              </div>
            </div>
        );

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <GlobalOutlined className="step-icon" />
              <h3>Learning Goals & Preferences</h3>
              <p>What are you hoping to achieve?</p>
            </div>
            
            <div className="form-group">
              <label>Which level are you interested in reaching? *</label>
              <select
                value={formData.interestedLevel}
                onChange={(e) => handleInputChange('interestedLevel', e.target.value)}
                className="form-select"
              >
                <option value="">Select target level</option>
                <option value="A1">A1 - Elementary</option>
                <option value="A2">A2 - Pre-Intermediate</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper-Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Proficient</option>
                <option value="exam-prep">Exam Preparation (TEF, DELF, DALF)</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>What are your main learning goals? *</label>
                <textarea
                  value={formData.learningGoals}
                  onChange={(e) => handleInputChange('learningGoals', e.target.value)}
                  placeholder="e.g., Immigration to Canada, Business communication, Travel, Academic purposes..."
                  className="form-textarea"
                  rows={2}
                />
              </div>
              
              <div className="form-group">
                <label>What do you expect from the lessons?</label>
                <textarea
                  value={formData.expectations}
                  onChange={(e) => handleInputChange('expectations', e.target.value)}
                  placeholder="Tell us what you hope to achieve and any specific areas you'd like to focus on..."
                  className="form-textarea"
                  rows={2}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <CalendarOutlined className="step-icon" />
              <h3>Scheduling & Availability</h3>
              <p>When would you like to start your French journey?</p>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>When would you like to start? *</label>
                <select
                  value={formData.expectedStartTime}
                  onChange={(e) => handleInputChange('expectedStartTime', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select timeframe</option>
                  <option value="immediately">Immediately</option>
                  <option value="within-week">Within a week</option>
                  <option value="within-month">Within a month</option>
                  <option value="flexible">I'm flexible</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>What's your preferred schedule? *</label>
                <select
                  value={formData.preferredSchedule}
                  onChange={(e) => handleInputChange('preferredSchedule', e.target.value)}
                  className="form-select"
                >
                  <option value="">Select schedule preference</option>
                  <option value="weekday-morning">Weekday mornings</option>
                  <option value="weekday-afternoon">Weekday afternoons</option>
                  <option value="weekday-evening">Weekday evenings</option>
                  <option value="weekend">Weekends</option>
                  <option value="flexible">Flexible schedule</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Your timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="form-select"
              >
                <option value="">Select timezone (optional)</option>
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
                <option value="other">Other</option>
              </select>
              {formData.timezone === 'other' && (
                <input
                  type="text"
                  value={customTimezone}
                  onChange={(e) => setCustomTimezone(e.target.value)}
                  placeholder="Enter your timezone (e.g., Africa/Accra or GMT+1)"
                  className="form-input"
                />
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen && !showSuccessModal && !showErrorModal) return null;

  // Success Modal
  if (showSuccessModal) {
    return (
      <div className="modal-overlay" onClick={handleSuccessClose}>
        <div className="demo-modal success-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
          <span className="sheet-grabber" aria-hidden="true" />
          <div className="modal-header success-header">
            <h2 id="demo-modal-title">Request sent</h2>
            <button className="close-button" onClick={handleSuccessClose} aria-label="Close">
              <CloseOutlined />
            </button>
          </div>
          <div className="modal-body success-body">
            <div className="success-content">
              <CheckCircleOutlined className="success-icon" />
              <p className="status-lead">Thank you for your interest in learning French with us.</p>
              <p>We have received your request and <strong>an administrator will contact you soon</strong> to schedule your session.</p>
              <p>Please check your email for confirmation details and further instructions.</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-primary" onClick={handleSuccessClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error Modal
  if (showErrorModal) {
    return (
      <div className="modal-overlay" onClick={handleErrorClose}>
        <div className="demo-modal error-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
          <span className="sheet-grabber" aria-hidden="true" />
          <div className="modal-header error-header">
            <h2 id="demo-modal-title">Something went wrong</h2>
            <button className="close-button" onClick={handleErrorClose} aria-label="Close">
              <CloseOutlined />
            </button>
          </div>
          <div className="modal-body error-body">
            <div className="error-content">
              <ExclamationCircleOutlined className="error-icon" />
              <p className="status-lead">{errorMessage}</p>
              <p>Please try again, or contact our support team if the problem persists.</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-primary" onClick={handleErrorClose}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── What are you here for? ──
  // Two very different people press this button: one wants a teacher, the
  // other only wants mock exams. Asking first means neither has to answer
  // questions meant for the other.
  if (!interest) {
    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="demo-modal is-chooser" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
          <span className="sheet-grabber" aria-hidden="true" />
          <div className="modal-header">
            <div className="modal-heading">
              <h2 id="demo-modal-title">Book a free demo</h2>
              <p className="modal-subtitle">Tell us what you are looking for. It takes two minutes.</p>
            </div>
            <button className="close-button" onClick={handleCloseModal} aria-label="Close">
              <CloseOutlined />
            </button>
          </div>

          <div className="modal-body">
            <ul className="intent-trust" aria-label="What to expect">
              <li><CheckCircleOutlined /> Free</li>
              <li><CheckCircleOutlined /> No card needed</li>
              <li><CheckCircleOutlined /> Reply within 24 h</li>
            </ul>
            <div className="intent-grid">
              <button type="button" className="intent-card is-classes" onClick={() => chooseInterest('classes')}>
                <span className="intent-badge">Most chosen</span>
                <span className="intent-icon"><TeamOutlined /></span>
                <span className="intent-title">Live classes with a teacher</span>
                <span className="intent-arrow" aria-hidden="true"><RightOutlined /></span>
                <span className="intent-desc">A free trial class with a native teacher, then a plan built around your level and your timetable.</span>
                <span className="intent-points">
                  <span className="intent-point"><CheckCircleOutlined /> One-to-one or small group</span>
                  <span className="intent-point"><CheckCircleOutlined /> A teacher who follows your progress</span>
                  <span className="intent-point"><CheckCircleOutlined /> Exam practice included</span>
                </span>
                <span className="intent-go">Book a trial class <RightOutlined /></span>
              </button>

              <button type="button" className="intent-card is-exam" onClick={() => chooseInterest('exam')}>
                <span className="intent-icon"><TrophyOutlined /></span>
                <span className="intent-title">Exam preparation only</span>
                <span className="intent-arrow" aria-hidden="true"><RightOutlined /></span>
                <span className="intent-desc">No classes. Full mock exams of the four papers, scored like the real thing, with corrections.</span>
                <span className="intent-points">
                  <span className="intent-point"><CheckCircleOutlined /> TCF, TEF, TEFAQ, DELF, DALF</span>
                  <span className="intent-point"><CheckCircleOutlined /> Listening, reading, writing and speaking</span>
                  <span className="intent-point"><CheckCircleOutlined /> A score and a correction on every attempt</span>
                </span>
                <span className="intent-go">Prepare my exam <RightOutlined /></span>
              </button>
            </div>

            <p className="intent-note">Not sure? Choose live classes: exam practice comes with them.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── The form, in the shape of whichever was chosen ──
  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className={`demo-modal${isExam ? ' is-exam' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
        <span className="sheet-grabber" aria-hidden="true" />
        <div className="modal-header">
          <div className="modal-heading">
            <h2 id="demo-modal-title">{isExam ? 'Exam preparation' : 'Book a free demo class'}</h2>
            <p className="modal-subtitle">
              {isExam
                ? 'Mock exams and corrections, without classes'
                : 'A free trial class with a native teacher'}
            </p>
          </div>
          <button className="close-button" onClick={handleCloseModal} disabled={isLoading} aria-label="Close">
            <CloseOutlined />
          </button>
        </div>

        <div className="progress-bar" role="group" aria-label={`Step ${currentStep} of ${totalSteps}`}>
          <div className="progress-steps">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div
                key={step}
                className={`progress-step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
                aria-current={currentStep === step ? 'step' : undefined}
              >
                {currentStep > step ? <CheckCircleOutlined /> : step}
              </div>
            ))}
          </div>
          <div className="progress-line">
            <div
              className="progress-fill"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`, '--progress': currentStep / totalSteps } as React.CSSProperties}
            />
          </div>
          {/* Phones show a slim bar with words instead of numbered circles. */}
          <p className="progress-caption" aria-hidden="true">
            <span>Step {currentStep} of {totalSteps}</span>
            <strong>{stepNames[currentStep - 1]}</strong>
          </p>
        </div>

        <div className="modal-body">
          {renderStepContent()}
        </div>

        <div className="modal-footer">
          <div className="step-indicator" aria-live="polite">
            Step {currentStep} of {totalSteps}
          </div>

          <div className="footer-buttons">
            <button
              type="button"
              className="btn-secondary"
              onClick={currentStep > 1 ? handlePrevious : () => setInterest('')}
              disabled={isLoading}
            >
              <LeftOutlined /> {currentStep > 1 ? 'Previous' : 'Back'}
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                disabled={!isStepValid() || isLoading}
              >
                Next <RightOutlined />
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!isStepValid() || isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingOutlined /> Sending...
                  </>
                ) : (
                  <>
                    {isExam ? 'Send my request' : 'Book my demo'} <CheckCircleOutlined />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoRequestModal;
