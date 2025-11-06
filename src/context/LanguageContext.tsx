import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Login Page
    'login.title': 'Office Checklist',
    'login.subtitle': 'Please sign in to continue',
    'login.name': 'Name',
    'login.namePlaceholder': 'Enter your name',
    'login.role': 'Role',
    'login.selectRole': 'Select your role',
    'login.officeboy': 'Officeboy',
    'login.supervisor': 'Supervisor',
    'login.signIn': 'Sign In',
    'login.password': 'Password',
    'login.passwordPlaceholder': 'Enter your password',
    'login.signingIn': 'Signing In...',
    'login.selectName': 'Select your name',
    
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.openingChecklist': 'Opening Checklist',
    'dashboard.openingDesc': 'Start your day with the opening tasks',
    'dashboard.closingChecklist': 'Closing Checklist',
    'dashboard.closingDesc': 'Complete end-of-day tasks',
    'dashboard.viewHistory': 'View Checklist History',
    'dashboard.historyDesc': 'Review past submissions',
    'dashboard.supervisorTitle': 'Review Submissions',
    'dashboard.supervisorDesc': 'Go to Checklist History to review and verify office boy submissions',
    'dashboard.logout': 'Logout',
    'dashboard.totalSubmissions': 'Total Submissions',
    'dashboard.pendingReviews': 'Pending Reviews',
    'dashboard.avgCompletion': 'Avg. Completion',
    
    // Checklist Page
    'checklist.opening': 'Opening Checklist',
    'checklist.closing': 'Closing Checklist',
    'checklist.reviewNote': 'Note: You are reviewing this',
    'checklist.supervisorNote': 'As a supervisor, you can verify tasks and add remarks to office boy submissions.',
    'checklist.submitChecklist': 'Submit Checklist',
    'checklist.submitReview': 'Submit Review',
    'checklist.submitting': 'Submitting...',
    'checklist.reviewing': 'Reviewing...',
    'checklist.alreadySubmitted': 'Already Submitted Today',
    'checklist.alreadySubmittedMsg': 'You have already submitted the {type} checklist for today.',
    'checklist.checkingStatus': 'Checking submission status...',
    'checklist.backToDashboard': 'Back to Dashboard',
    
    // History Page
    'history.title': 'Office Boy Checklists',
    'history.myHistory': 'My Checklist History',
    'history.noChecklists': 'No checklists found.',
    'history.tasksCompleted': 'tasks completed',
    'history.status': 'Status',
    'history.reviewed': 'Reviewed',
    'history.pendingReview': 'Pending Review',
    'history.reviewedBy': 'Reviewed by',
    'history.on': 'On',
    'history.viewDetails': 'View Details',
    'history.loading': 'Loading checklists...',
    'history.backToDashboard': 'Back to Dashboard',
    'history.searchByName': 'Search by name...',
    'history.allStatuses': 'All Statuses',
    'history.export': 'Export to CSV',
    
    // History Detail Page
    'detail.checklistDetails': 'Checklist Details',
    'detail.checklistInfo': 'Checklist Info',
    'detail.user': 'User',
    'detail.date': 'Date',
    'detail.time': 'Time',
    'detail.type': 'Type',
    'detail.progress': 'Progress',
    'detail.reviewStatus': 'Review Status',
    'detail.tasks': 'Tasks',
    'detail.status': 'Status',
    'detail.officeboyRemarks': 'Officeboy remarks',
    'detail.supervisorRemarks': 'Supervisor remarks',
    'detail.supervisorRemarksLabel': 'Supervisor Remarks',
    'detail.remarksPlaceholder': 'Add your review comment...',
    'detail.backToHistory': 'Back to History',
    'detail.loading': 'Loading checklist details...',
    'detail.notFound': 'Checklist not found',
    'detail.print': 'Print',
    'detail.employeeSignature': 'Employee Signature',
    'detail.supervisorSignature': 'Supervisor Signature',
    
    // Checklist Types
    'type.opening': 'Opening',
    'type.closing': 'Closing',
    
    // Common
    'common.completed': 'Completed',
    'common.pending': 'Pending',
  },
  hi: {
    // Login Page
    'login.title': 'ऑफिस चेकलिस्ट',
    'login.subtitle': 'कृपया जारी रखने के लिए साइन इन करें',
    'login.name': 'नाम',
    'login.namePlaceholder': 'अपना नाम दर्ज करें',
    'login.role': 'भूमिका',
    'login.selectRole': 'अपनी भूमिका चुनें',
    'login.officeboy': 'ऑफिस बॉय',
    'login.supervisor': 'सुपरवाइजर',
    'login.signIn': 'साइन इन करें',
    'login.password': 'पासवर्ड',
    'login.passwordPlaceholder': 'अपना पासवर्ड दर्ज करें',
    'login.signingIn': 'साइन इन हो रहा है...',
    'login.selectName': 'अपना नाम चुनें',
    
    // Dashboard
    'dashboard.welcome': 'स्वागत है',
    'dashboard.openingChecklist': 'ओपनिंग चेकलिस्ट',
    'dashboard.openingDesc': 'दिन की शुरुआती कार्यों के साथ शुरू करें',
    'dashboard.closingChecklist': 'क्लोजिंग चेकलिस्ट',
    'dashboard.closingDesc': 'दिन के अंत के कार्य पूरा करें',
    'dashboard.viewHistory': 'चेकलिस्ट इतिहास देखें',
    'dashboard.historyDesc': 'पिछले सबमिशन देखें',
    'dashboard.supervisorTitle': 'सबमिशन की समीक्षा करें',
    'dashboard.supervisorDesc': 'ऑफिस बॉय के सबमिशन को वेरिफाई करने के लिए चेकलिस्ट इतिहास पर जाएं',
    'dashboard.logout': 'लॉगआउट',
    'dashboard.totalSubmissions': 'कुल सबमिशन',
    'dashboard.pendingReviews': 'लंबित समीक्षाएं',
    'dashboard.avgCompletion': 'औसत समापन',
    
    // Checklist Page
    'checklist.opening': 'ओपनिंग चेकलिस्ट',
    'checklist.closing': 'क्लोजिंग चेकलिस्ट',
    'checklist.reviewNote': 'नोट: आप इसकी समीक्षा कर रहे हैं',
    'checklist.supervisorNote': 'एक सुपरवाइजर के रूप में, आप टास्क को वेरिफाई कर सकते हैं और ऑफिस बॉय के सबमिशन पर टिप्पणी जोड़ सकते हैं।',
    'checklist.submitChecklist': 'चेकलिस्ट जमा करें',
    'checklist.submitReview': 'समीक्षा जमा करें',
    'checklist.submitting': 'जमा किया जा रहा है...',
    'checklist.reviewing': 'समीक्षा की जा रही है...',
    'checklist.alreadySubmitted': 'आज पहले ही जमा किया गया',
    'checklist.alreadySubmittedMsg': 'आपने आज के लिए {type} चेकलिस्ट पहले ही जमा कर दी है।',
    'checklist.checkingStatus': 'सबमिशन स्थिति की जांच हो रही है...',
    'checklist.backToDashboard': 'डैशबोर्ड पर वापस जाएं',
    
    // History Page
    'history.title': 'ऑफिस बॉय चेकलिस्ट',
    'history.myHistory': 'मेरी चेकलिस्ट इतिहास',
    'history.noChecklists': 'कोई चेकलिस्ट नहीं मिली।',
    'history.tasksCompleted': 'कार्य पूर्ण',
    'history.status': 'स्थिति',
    'history.reviewed': 'समीक्षा की गई',
    'history.pendingReview': 'समीक्षा लंबित',
    'history.reviewedBy': 'द्वारा समीक्षा की गई',
    'history.on': 'को',
    'history.viewDetails': 'विवरण देखें',
    'history.loading': 'चेकलिस्ट लोड हो रही हैं...',
    'history.backToDashboard': 'डैशबोर्ड पर वापस जाएं',
    'history.searchByName': 'नाम से खोजें...',
    'history.allStatuses': 'सभी स्थितियाँ',
    'history.export': 'सीएसवी में निर्यात करें',
    
    // History Detail Page
    'detail.checklistDetails': 'चेकलिस्ट विवरण',
    'detail.checklistInfo': 'चेकलिस्ट जानकारी',
    'detail.user': 'उपयोगकर्ता',
    'detail.date': 'तारीख',
    'detail.time': 'समय',
    'detail.type': 'प्रकार',
    'detail.progress': 'प्रगति',
    'detail.reviewStatus': 'समीक्षा स्थिति',
    'detail.tasks': 'कार्य',
    'detail.status': 'स्थिति',
    'detail.officeboyRemarks': 'ऑफिस बॉय की टिप्पणी',
    'detail.supervisorRemarks': 'सुपरवाइजर की टिप्पणी',
    'detail.supervisorRemarksLabel': 'सुपरवाइजर की टिप्पणी',
    'detail.remarksPlaceholder': 'अपनी समीक्षा टिप्पणी जोड़ें...',
    'detail.backToHistory': 'इतिहास पर वापस जाएं',
    'detail.loading': 'चेकलिस्ट विवरण लोड हो रहा है...',
    'detail.notFound': 'चेकलिस्ट नहीं मिली',
    'detail.print': 'प्रिंट',
    'detail.employeeSignature': 'कर्मचारी के हस्ताक्षर',
    'detail.supervisorSignature': 'सुपरवाइजर के हस्ताक्षर',
    
    // Checklist Types
    'type.opening': 'ओपनिंग',
    'type.closing': 'क्लोजिंग',
    
    // Common
    'common.completed': 'पूर्ण',
    'common.pending': 'लंबित',
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, values?: Record<string, string | number>): string => {
    let translation = translations[language][key] || key;
    if (values) {
      Object.keys(values).forEach((valueKey) => {
        translation = translation.replace(`{${valueKey}}`, String(values[valueKey]));
      });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
