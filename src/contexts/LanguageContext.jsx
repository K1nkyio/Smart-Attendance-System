import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navigation & General
    home: 'Home',
    back: 'Back',
    logout: 'Logout',
    login: 'Login',
    welcome: 'Welcome',
    welcomeBack: 'Welcome Back',
    signIn: 'Sign in to access your account',
    
    // Home Page
    smartAttendanceSystem: 'Smart Attendance System',
    streamlinedAttendance: 'Streamlined attendance tracking with QR codes for modern classrooms',
    studentAccess: 'Student Access',
    scanQRCodes: 'Scan QR codes to record your attendance',
    studentLogin: 'Student Login',
    instructorPortal: 'Instructor Portal',
    generateQRCodes: 'Generate QR codes and track attendance',
    instructorLogin: 'Instructor Login',
    liveStats: 'Live Stats',
    activeStudents: 'Active Students',
    totalCheckins: 'Total Check-ins Today',
    howItWorks: 'How It Works',
    generateQRCode: 'Generate QR Code',
    instructorCreates: 'Instructor creates unique QR code for each class session',
    studentsScan: 'Students Scan',
    studentsUsePhones: 'Students use their phones to scan the QR code',
    trackAttendance: 'Track Attendance',
    automaticRecording: 'Automatic attendance recording with timestamps',
    
    // Login Form
    email: 'Email',
    password: 'Password',
    student: 'Student',
    instructor: 'Instructor',
    signingIn: 'Signing in...',
    signInAsStudent: 'Sign In as Student',
    signInAsInstructor: 'Sign In as Instructor',
    demoAccounts: 'Demo Accounts:',
    fillFields: 'Please fill in all fields',
    invalidCredentials: 'Invalid credentials. Try demo accounts below.',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    download: 'Download',
    refresh: 'Refresh',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info'
  },
  sw: {
    // Navigation & General
    home: 'Nyumbani',
    back: 'Rudi',
    logout: 'Toka',
    login: 'Ingia',
    welcome: 'Karibu',
    welcomeBack: 'Karibu Tena',
    signIn: 'Ingia ili kufikia akaunti yako',
    
    // Home Page
    smartAttendanceSystem: 'Mfumo Mahiri wa Mahudhurio',
    streamlinedAttendance: 'Ufuatiliaji rahisi wa mahudhurio kwa kutumia msimbo wa QR katika madarasa ya kisasa',
    studentAccess: 'Ufikaji wa Mwanafunzi',
    scanQRCodes: 'Changanua misimbo ya QR ili kurekodi mahudhurio yako',
    studentLogin: 'Kuingia kwa Mwanafunzi',
    instructorPortal: 'Mlango wa Mkufunzi',
    generateQRCodes: 'Tengeneza misimbo ya QR na ufuatilie mahudhurio',
    instructorLogin: 'Kuingia kwa Mkufunzi',
    liveStats: 'Takwimu za Moja kwa Moja',
    activeStudents: 'Wanafunzi Hai',
    totalCheckins: 'Jumla ya Mahudhurio Leo',
    howItWorks: 'Jinsi Inavyofanya Kazi',
    generateQRCode: 'Tengeneza Msimbo wa QR',
    instructorCreates: 'Mkufunzi anaunda msimbo wa pekee wa QR kwa kila kipindi cha darasa',
    studentsScan: 'Wanafunzi Wanachanganua',
    studentsUsePhones: 'Wanafunzi wanatumia simu zao kuchanganua msimbo wa QR',
    trackAttendance: 'Fuatilia Mahudhurio',
    automaticRecording: 'Kurekodi kiotomatiki kwa mahudhurio pamoja na alama za wakati',
    
    // Login Form
    email: 'Barua Pepe',
    password: 'Nywila',
    student: 'Mwanafunzi',
    instructor: 'Mkufunzi',
    signingIn: 'Ninaingia...',
    signInAsStudent: 'Ingia kama Mwanafunzi',
    signInAsInstructor: 'Ingia kama Mkufunzi',
    demoAccounts: 'Akaunti za Jaribio:',
    fillFields: 'Tafadhali jaza sehemu zote',
    invalidCredentials: 'Utambulisho batili. Jaribu akaunti za jaribio hapa chini.',
    
    // Common
    loading: 'Inapakia...',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    create: 'Unda',
    edit: 'Hariri',
    delete: 'Futa',
    view: 'Ona',
    download: 'Pakua',
    refresh: 'Onyesha upya',
    success: 'Mafanikio',
    error: 'Hitilafu',
    warning: 'Onyo',
    info: 'Habari'
  }
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};