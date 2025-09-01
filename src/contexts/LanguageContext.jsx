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
    
    // Instructor Dashboard
    instructorMyClasses: 'My Classes',
    instructorCreateClass: 'Create Class',
    qrGenerator: 'QR Generator',
    selectClassToGenerate: 'Select a class to generate QR code',
    regenerate: 'Regenerate',
    activeFor: 'Active for:',
    generated: 'Generated:',
    attendanceDetails: 'Attendance Details',
    noAttendanceRecords: 'No attendance records yet',
    generateQRForStudents: 'Generate a QR code for students to scan',
    noClassesCreated: 'No classes created yet',
    createFirstClass: 'Create your first class to start tracking attendance',
    createYourFirstClass: 'Create Your First Class',
    students: 'students',
    todayAttendance: 'Today:',
    present: 'Present',
    absent: 'Absent',
    exportReport: 'Export Report',
    backToDashboard: 'Back to Dashboard',
    reports: 'Reports',
    
    // Student Dashboard
    quickScan: 'Quick Scan',
    scanQRCodeToMark: 'Scan QR code to mark attendance',
    scanQRCode: 'Scan QR Code',
    studentMyClasses: 'My Classes',
    recentAttendance: 'Recent Attendance',
    sessionsAttended: 'sessions attended',
    noClassesEnrolled: 'No classes enrolled yet',
    noAttendanceYet: 'No attendance records yet',
    scanFirstAttendance: 'Scan a QR code to mark your first attendance',
    unknownLocation: 'Unknown location',
    
    // Class Creation Form
    createNewClass: 'Create New Class',
    instructorName: 'Instructor/Lecturer Name',
    className: 'Lecture/Class Name',
    roomLocation: 'Room Location/Code',
    unitCode: 'Class/Unit Code',
    sessionTime: 'Session Time',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    department: 'Department',
    classCapacity: 'Class Capacity',
    description: 'Description (Optional)',
    enterInstructorName: 'Enter instructor name',
    enterClassName: 'Enter class name',
    enterRoomLocation: 'e.g., Room 101, Building A',
    enterUnitCode: 'e.g., CS101, MATH201',
    selectSessionTime: 'Select session time',
    enterPhoneNumber: 'Enter phone number',
    enterEmailAddress: 'Enter email address',
    enterDepartment: 'e.g., Computer Science',
    maxStudents: 'Maximum students (default: 50)',
    briefDescription: 'Brief description of the class',
    creating: 'Creating...',
    formCreateClass: 'Create Class',
    
    // QR Scanner
    scanAttendance: 'Scan Attendance',
    scanQRCodeToMarkAttendance: 'Scan QR code to mark your attendance',
    qrCodeScanner: 'QR Code Scanner',
    camera: 'Camera',
    manual: 'Manual',
    cameraAccessRequired: 'Camera access required for QR code scanning',
    startCamera: 'Start Camera',
    pointCameraAtQR: 'Point your camera at the QR code',
    stopCamera: 'Stop Camera',
    enterClassCode: 'Enter Class Code',
    enterClassCodePlaceholder: 'e.g., CS101 or scan data',
    submitAttendance: 'Submit Attendance',
    demoQuickScan: 'Demo: Quick Scan',
    simulateScanningDemo: 'For demonstration, click these buttons to simulate scanning QR codes',
    attendanceRecorded: 'Attendance Recorded',
    lastScan: 'Last scan:',
    
    // Attendance Reports
    attendanceReport: 'Attendance Report',
    timePeriod: 'Time Period',
    status: 'Status',
    allTime: 'All Time',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    all: 'All',
    totalEnrolled: 'Total Enrolled',
    attendanceRate: 'Attendance Rate',
    studentsPresent: 'Students Present',
    studentsAbsentToday: 'Students Absent Today',
    noAttendanceFound: 'No attendance records found',
    
    // Toast Messages
    qrCodeGenerated: 'QR Code generated! Valid for 30 minutes',
    attendanceExported: 'Attendance exported successfully!',
    classCreated: 'Class created successfully!',
    attendanceMarked: 'Attendance recorded for',
    invalidClassCode: 'Invalid class code',
    notEnrolledInClass: 'You are not enrolled in this class',
    qrCodeExpired: 'QR code has expired',
    attendanceAlreadyRecorded: 'Attendance already recorded for this class',
    pleaseEnterClassCode: 'Please enter a class code',
    invalidQRFormat: 'Invalid QR code format',
    cameraStarted: 'Camera started! Point at QR code to scan',
    cameraAccessDenied: 'Camera access denied. Please use manual input instead.',
    
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
    
    // Instructor Dashboard
    instructorMyClasses: 'Madarasa Yangu',
    instructorCreateClass: 'Unda Darasa',
    qrGenerator: 'Kizalishaji cha QR',
    selectClassToGenerate: 'Chagua darasa ili kutengeneza msimbo wa QR',
    regenerate: 'Tengeneza Upya',
    activeFor: 'Hai kwa:',
    generated: 'Iliyotengenezwa:',
    attendanceDetails: 'Maelezo ya Mahudhurio',
    noAttendanceRecords: 'Hakuna rekodi za mahudhurio bado',
    generateQRForStudents: 'Tengeneza msimbo wa QR kwa wanafunzi kuchanganua',
    noClassesCreated: 'Hakuna madarasa yaliyoundwa bado',
    createFirstClass: 'Unda darasa lako la kwanza ili kuanza kufuatilia mahudhurio',
    createYourFirstClass: 'Unda Darasa Lako la Kwanza',
    students: 'wanafunzi',
    todayAttendance: 'Leo:',
    present: 'Yupo',
    absent: 'Hayupo',
    exportReport: 'Pakua Ripoti',
    backToDashboard: 'Rudi kwenye Dashibodi',
    reports: 'Ripoti',
    
    // Student Dashboard
    quickScan: 'Changanuzi Haraka',
    scanQRCodeToMark: 'Changanua msimbo wa QR ili kuweka alama ya mahudhurio',
    scanQRCode: 'Changanua Msimbo wa QR',
    studentMyClasses: 'Madarasa Yangu',
    recentAttendance: 'Mahudhurio ya Hivi Karibuni',
    sessionsAttended: 'vipindi vilivyohudhuria',
    noClassesEnrolled: 'Hakuna madarasa yaliyojisajiliwa bado',
    noAttendanceYet: 'Hakuna rekodi za mahudhurio bado',
    scanFirstAttendance: 'Changanua msimbo wa QR ili kuweka alama ya mahudhurio yako ya kwanza',
    unknownLocation: 'Mahali pasipojulikana',
    
    // Class Creation Form
    createNewClass: 'Unda Darasa Jipya',
    instructorName: 'Jina la Mkufunzi/Mhadhiri',
    className: 'Jina la Hotuba/Darasa',
    roomLocation: 'Mahali pa Chumba/Msimbo',
    unitCode: 'Msimbo wa Darasa/Kitengo',
    sessionTime: 'Wakati wa Kipindi',
    phoneNumber: 'Nambari ya Simu',
    emailAddress: 'Anwani ya Barua Pepe',
    department: 'Idara',
    classCapacity: 'Uwezo wa Darasa',
    description: 'Maelezo (Si Lazima)',
    enterInstructorName: 'Weka jina la mkufunzi',
    enterClassName: 'Weka jina la darasa',
    enterRoomLocation: 'k.m., Chumba 101, Jengo A',
    enterUnitCode: 'k.m., CS101, MATH201',
    selectSessionTime: 'Chagua wakati wa kipindi',
    enterPhoneNumber: 'Weka nambari ya simu',
    enterEmailAddress: 'Weka anwani ya barua pepe',
    enterDepartment: 'k.m., Sayansi ya Kompyuta',
    maxStudents: 'Wanafunzi wa juu (chaguo-msingi: 50)',
    briefDescription: 'Maelezo mafupi ya darasa',
    creating: 'Inaunda...',
    formCreateClass: 'Unda Darasa',
    
    // QR Scanner
    scanAttendance: 'Changanua Mahudhurio',
    scanQRCodeToMarkAttendance: 'Changanua msimbo wa QR ili kuweka alama ya mahudhurio yako',
    qrCodeScanner: 'Kichanguzi cha Msimbo wa QR',
    camera: 'Kamera',
    manual: 'Mkono',
    cameraAccessRequired: 'Ufikaji wa kamera unahitajika kwa kuchanganua msimbo wa QR',
    startCamera: 'Anzisha Kamera',
    pointCameraAtQR: 'Elekeza kamera yako kwenye msimbo wa QR',
    stopCamera: 'Simamisha Kamera',
    enterClassCode: 'Weka Msimbo wa Darasa',
    enterClassCodePlaceholder: 'k.m., CS101 au data ya kuchanganua',
    submitAttendance: 'Wasilisha Mahudhurio',
    demoQuickScan: 'Onyesho: Changanuzi Haraka',
    simulateScanningDemo: 'Kwa maonyesho, bofya vitufe hivi ili kuiga kuchanganua misimbo ya QR',
    attendanceRecorded: 'Mahudhurio Yamerekodi',
    lastScan: 'Changanuzi la mwisho:',
    
    // Attendance Reports
    attendanceReport: 'Ripoti ya Mahudhurio',
    timePeriod: 'Kipindi cha Wakati',
    status: 'Hali',
    allTime: 'Wakati Wote',
    today: 'Leo',
    thisWeek: 'Wiki Hii',
    thisMonth: 'Mwezi Huu',
    all: 'Yote',
    totalEnrolled: 'Jumla ya Waliojisajili',
    attendanceRate: 'Kiwango cha Mahudhurio',
    studentsPresent: 'Wanafunzi Walio Hapa',
    studentsAbsentToday: 'Wanafunzi Wasio Hapa Leo',
    noAttendanceFound: 'Hakuna rekodi za mahudhurio zilizopatikana',
    
    // Toast Messages
    qrCodeGenerated: 'Msimbo wa QR umetengenezwa! Ni halali kwa dakika 30',
    attendanceExported: 'Mahudhurio yamepakuwa kwa mafanikio!',
    classCreated: 'Darasa limeundwa kwa mafanikio!',
    attendanceMarked: 'Mahudhurio yamerekodi kwa',
    invalidClassCode: 'Msimbo wa darasa batili',
    notEnrolledInClass: 'Hujajisajili katika darasa hili',
    qrCodeExpired: 'Msimbo wa QR umeisha muda',
    attendanceAlreadyRecorded: 'Mahudhurio yamesharekodi kwa darasa hili',
    pleaseEnterClassCode: 'Tafadhali weka msimbo wa darasa',
    invalidQRFormat: 'Mpangilio wa msimbo wa QR batili',
    cameraStarted: 'Kamera imeanza! Elekeza kwenye msimbo wa QR kuchanganua',
    cameraAccessDenied: 'Ufikaji wa kamera umekataliwa. Tafadhali tumia uwekaji mkono badala yake.',
    
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