
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Loader2, 
  ShieldAlert, 
  Droplets, 
  Wind, 
  Truck, 
  ThermometerSnowflake,
  ClipboardCheck,
  Printer,
  Info,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Plus,
  Scale,
  Trash2,
  ArrowLeft,
  X,
  MessageSquare,
  Mic,
  Send,
  Sparkles,
  ExternalLink,
  Newspaper,
  Save,
  Bookmark,
  Calculator,
  ArrowRightLeft,
  Settings,
  Globe,
  Palette,
  Check,
  FlaskConical,
  Flame,
  Gauge,
  BookOpen
} from 'lucide-react';
import { analyzeChemical, searchSafetyNews, createChatSession, VoiceAssistant, analyzeInteraction } from './services/geminiService';
import { ChemicalAnalysis, LoadingState, ChatMessage, NewsResult, Language, ThemeConfig, InteractionResult } from './types';

const APP_VERSION = "2.6.1";

// --- Data: Translations & Themes ---

const TRANSLATIONS = {
  fa: {
    appTitle: 'HazmatAI',
    appDesc: 'سامانه هوشمند ایمنی صنعتی',
    searchPlaceholder: 'نام ماده (سولفوریک اسید) یا فرمول (H2SO4)...',
    searchBtn: 'تحلیل',
    idleTitle: 'آماده برای بازرسی هوشمند',
    idleDesc: 'بانک اطلاعاتی HazmatAI شامل هزاران ماده شیمیایی و دستورالعمل‌های ایمنی GHS است. کافیست نام ماده را جستجو کنید.',
    loadingTitle: 'در حال استخراج داده‌ها...',
    loadingDesc: 'Gemini Pro در حال تدوین گزارش ایمنی است',
    errorTitle: 'پردازش متوقف شد',
    retryBtn: 'تلاش مجدد',
    saveBtn: 'ذخیره',
    savedBtn: 'ذخیره شده',
    compareBtn: 'مقایسه',
    addedBtn: 'افزوده شد',
    viewCompareBtn: 'مشاهده مقایسه',
    expandAll: 'نمایش همه',
    collapseAll: 'بستن همه',
    printBtn: 'چاپ گزارش',
    warningTitle: 'هشدار ایمنی الزامی',
    warningDesc: 'گزارش حاضر صرفاً جنبه راهنمایی عمومی داشته و بر اساس هوش مصنوعی گردآوری شده است. این سند نباید به عنوان تنها مرجع تصمیم‌گیری در محیط‌های صنعتی مورد استفاده قرار گیرد. همیشه به Safety Data Sheet (SDS) رسمی ارائه شده توسط تولیدکننده مراجعه کنید.',
    
    // Sections
    secNews: 'اطلاعات و اخبار تکمیلی',
    secID: 'شناسایی و مشخصات کلی',
    secHazards: 'خطرات و طبقه‌بندی GHS',
    secExposure: 'حدود مجاز مواجهه شغلی',
    secSafety: 'اقدامات پیشگیرانه و کنترلی',
    secReactions: 'پایداری و واکنش‌پذیری',
    secFirstAid: 'کمک‌های اولیه',
    secEmergency: 'مدیریت شرایط اضطراری',
    secTransport: 'اطلاعات حمل و نقل',
    secReferences: 'مراجع و استانداردها',

    // Fields
    chemName: 'نام کامل شیمیایی',
    formula: 'فرمول مولکولی',
    cas: 'شماره CAS',
    synonyms: 'مترادف‌ها',
    ghsClass: 'کلاس خطر',
    pictograms: 'علائم هشدار دهنده (GHS Pictograms)',
    phyHazards: 'خطرات فیزیکی',
    healthHazards: 'خطرات سلامتی',
    envHazards: 'خطرات زیست‌محیطی',
    ppe: 'تجهیزات حفاظت فردی (PPE)',
    engControls: 'کنترل‌های مهندسی',
    storage: 'انبارداری',
    segregation: 'جداسازی',
    incompatible: 'مواد ناسازگار',
    dangReact: 'واکنش‌های خطرناک',
    decomp: 'محصولات تجزیه',
    skin: 'پوست',
    eyes: 'چشم',
    inhalation: 'استنشاق',
    ingestion: 'بلع',
    spill: 'نشت و ریزش',
    fire: 'اطفای حریق',
    disposal: 'دفع ضایعات',
    unNum: 'شماره UN',
    transClass: 'کلاس حمل و نقل',
    packGroup: 'گروه بسته‌بندی',
    
    // Modals & Widgets
    savedItems: 'مواد شیمیایی من',
    emptySaved: 'لیست مواد شما خالی است',
    unitConverter: 'تبدیل واحد شیمیایی',
    temp: 'دما',
    pressure: 'فشار',
    conc: 'غلظت',
    mw: 'وزن مولکولی (MW) - g/mol',
    mwHint: '* محاسبه بر اساس شرایط استاندارد (25°C, 1 atm)',
    newsSearchBtn: 'جستجوی اخبار و حوادث اخیر (Google Search)',
    newsSearching: 'در حال جستجو در گوگل...',
    sources: 'منابع',
    chatTitle: 'دستیار هوشمند Hazmat',
    chatMode: 'حالت متنی',
    voiceMode: 'حالت صوتی',
    chatPlaceholder: 'سوال خود را بپرسید...',
    voiceStart: 'شروع گفتگو',
    voiceEnd: 'پایان مکالمه',
    voiceListening: 'در حال مکالمه...',
    voiceHint: 'برای شروع صحبت کنید',
    
    // Settings
    settings: 'تنظیمات',
    language: 'زبان',
    theme: 'پوسته',
    close: 'بستن',
    
    // Comparison
    features: 'ویژگی‌ها',
    backToSearch: 'بازگشت به جستجو',
    compareTitle: 'مقایسه مواد',
    itemsSelected: 'ماده انتخاب شده',
    readyToCompare: 'آماده برای مقایسه',
    clearList: 'پاک کردن لیست',
    contactExp: 'مواجهه تماسی',
    respExp: 'مواجهه تنفسی/گوارشی',

    // Interaction Analysis
    interactionTitle: 'تحلیل برهم‌کنش شیمیایی',
    interactionDesc: 'بررسی واکنش‌های خطرناک بین دو ماده در شرایط محیطی مختلف',
    selectChemA: 'ماده شیمیایی اول',
    selectChemB: 'ماده شیمیایی دوم',
    conditions: 'شرایط واکنش',
    condHeat: 'اعمال حرارت / تجزیه حرارتی',
    condPressure: 'تحت فشار بالا',
    analyzeReaction: 'شبیه‌سازی واکنش',
    reacting: 'در حال تحلیل برهم‌کنش...',
    equation: 'معادله واکنش',
    products: 'محصولات تولید شده',
    hazards: 'خطرات و ریسک‌ها',
    condEffects: 'تاثیر شرایط محیطی',
    safetyAction: 'اقدامات ایمنی و کنترلی',
    severityHigh: 'خطر بسیار بالا',
    severityMedium: 'خطر متوسط',
    severityLow: 'خطر کم',
    severityNone: 'بی‌خطر',
    selectFromList: 'انتخاب از لیست مواد من',
    listEmptyHint: 'ابتدا مواد را جستجو و ذخیره کنید.'
  },
  en: {
    appTitle: 'HazmatAI',
    appDesc: 'Industrial Safety Intelligence',
    searchPlaceholder: 'Chemical name (Sulfuric Acid) or formula (H2SO4)...',
    searchBtn: 'Analyze',
    idleTitle: 'Ready for Intelligent Inspection',
    idleDesc: 'HazmatAI database includes thousands of chemicals and GHS safety guidelines. Simply search for a chemical name.',
    loadingTitle: 'Extracting Data...',
    loadingDesc: 'Gemini Pro is compiling the safety report',
    errorTitle: 'Processing Stopped',
    retryBtn: 'Retry',
    saveBtn: 'Save',
    savedBtn: 'Saved',
    compareBtn: 'Compare',
    addedBtn: 'Added',
    viewCompareBtn: 'View Comparison',
    expandAll: 'Expand All',
    collapseAll: 'Collapse All',
    printBtn: 'Print Report',
    warningTitle: 'Mandatory Safety Warning',
    warningDesc: 'This report is for general guidance only and is compiled by AI. It should not be used as the sole reference for decision-making in industrial environments. Always refer to the official Safety Data Sheet (SDS) provided by the manufacturer.',
    
    // Sections
    secNews: 'News & Recent Events',
    secID: 'Identification & General Specs',
    secHazards: 'Hazards & GHS Classification',
    secExposure: 'Occupational Exposure Limits',
    secSafety: 'Safety Measures & Controls',
    secReactions: 'Stability & Reactivity',
    secFirstAid: 'First Aid Measures',
    secEmergency: 'Emergency Management',
    secTransport: 'Transport Information',
    secReferences: 'References & Standards',

    // Fields
    chemName: 'Chemical Name',
    formula: 'Molecular Formula',
    cas: 'CAS Number',
    synonyms: 'Synonyms',
    ghsClass: 'GHS Class',
    pictograms: 'Hazard Pictograms (GHS)',
    phyHazards: 'Physical Hazards',
    healthHazards: 'Health Hazards',
    envHazards: 'Environmental Hazards',
    ppe: 'Personal Protective Equip (PPE)',
    engControls: 'Engineering Controls',
    storage: 'Storage',
    segregation: 'Segregation',
    incompatible: 'Incompatible Materials',
    dangReact: 'Dangerous Reactions',
    decomp: 'Decomposition Products',
    skin: 'Skin',
    eyes: 'Eyes',
    inhalation: 'Inhalation',
    ingestion: 'Ingestion',
    spill: 'Spill & Leak',
    fire: 'Fire Fighting',
    disposal: 'Waste Disposal',
    unNum: 'UN Number',
    transClass: 'Transport Class',
    packGroup: 'Packing Group',
    
    // Modals & Widgets
    savedItems: 'My Chemicals',
    emptySaved: 'Your chemical list is empty',
    unitConverter: 'Chemical Unit Converter',
    temp: 'Temperature',
    pressure: 'Pressure',
    conc: 'Concentration',
    mw: 'Molecular Weight (MW) - g/mol',
    mwHint: '* Calculated at STP (25°C, 1 atm)',
    newsSearchBtn: 'Search Recent News (Google Search)',
    newsSearching: 'Searching Google...',
    sources: 'Sources',
    chatTitle: 'Hazmat Smart Assistant',
    chatMode: 'Chat Mode',
    voiceMode: 'Voice Mode',
    chatPlaceholder: 'Ask a question...',
    voiceStart: 'Start Conversation',
    voiceEnd: 'End Call',
    voiceListening: 'Listening...',
    voiceHint: 'Speak to start',

    // Settings
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    close: 'Close',

    // Comparison
    features: 'Features',
    backToSearch: 'Back to Search',
    compareTitle: 'Compare Chemicals',
    itemsSelected: 'Items Selected',
    readyToCompare: 'Ready to compare',
    clearList: 'Clear List',
    contactExp: 'Contact Exposure',
    respExp: 'Respiratory/Digestive',

    // Interaction Analysis
    interactionTitle: 'Chemical Interaction Analysis',
    interactionDesc: 'Analyze dangerous reactions between two chemicals under various conditions.',
    selectChemA: 'First Chemical',
    selectChemB: 'Second Chemical',
    conditions: 'Reaction Conditions',
    condHeat: 'Apply Heat / Thermal Decomposition',
    condPressure: 'High Pressure',
    analyzeReaction: 'Simulate Reaction',
    reacting: 'Analyzing interaction...',
    equation: 'Reaction Equation',
    products: 'Products Formed',
    hazards: 'Hazards & Risks',
    condEffects: 'Environmental Effects',
    safetyAction: 'Safety & Control Measures',
    severityHigh: 'HIGH RISK',
    severityMedium: 'Medium Risk',
    severityLow: 'Low Risk',
    severityNone: 'No significant reaction',
    selectFromList: 'Select from My Chemicals',
    listEmptyHint: 'Search and save chemicals first.'
  }
};

const THEMES: Record<string, ThemeConfig> = {
  industrial: {
    id: 'industrial',
    name: 'Industrial (Default)',
    primary: 'bg-red-600',
    primaryHover: 'hover:bg-red-700',
    secondary: 'bg-slate-50',
    accent: 'text-red-600',
    border: 'border-red-200',
    lightText: 'text-red-100',
    ring: 'focus:ring-red-500/20',
    shadow: 'shadow-red-600/20',
    gradient: 'from-slate-900 to-slate-800'
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    primary: 'bg-cyan-600',
    primaryHover: 'hover:bg-cyan-700',
    secondary: 'bg-blue-50',
    accent: 'text-cyan-600',
    border: 'border-cyan-200',
    lightText: 'text-cyan-100',
    ring: 'focus:ring-cyan-500/20',
    shadow: 'shadow-cyan-600/20',
    gradient: 'from-blue-900 to-cyan-900'
  },
  nature: {
    id: 'nature',
    name: 'Forest Green',
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    secondary: 'bg-green-50',
    accent: 'text-emerald-600',
    border: 'border-emerald-200',
    lightText: 'text-emerald-100',
    ring: 'focus:ring-emerald-500/20',
    shadow: 'shadow-emerald-600/20',
    gradient: 'from-green-900 to-emerald-900'
  },
  royal: {
    id: 'royal',
    name: 'Royal Purple',
    primary: 'bg-violet-600',
    primaryHover: 'hover:bg-violet-700',
    secondary: 'bg-purple-50',
    accent: 'text-violet-600',
    border: 'border-violet-200',
    lightText: 'text-violet-100',
    ring: 'focus:ring-violet-500/20',
    shadow: 'shadow-violet-600/20',
    gradient: 'from-purple-900 to-violet-900'
  },
  sunset: {
    id: 'sunset',
    name: 'Solar Orange',
    primary: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    secondary: 'bg-amber-50',
    accent: 'text-orange-600',
    border: 'border-orange-200',
    lightText: 'text-orange-100',
    ring: 'focus:ring-orange-500/20',
    shadow: 'shadow-orange-600/20',
    gradient: 'from-orange-900 to-amber-900'
  }
};

// --- GHS Pictogram Assets (Standard GHS Paths) ---
const GHS_PATHS: Record<string, string> = {
  // GHS01: Explosive (Exploding Bomb)
  explosive: "M12 2c-.3 0-.5.2-.5.5v3c0 .3.2.5.5.5s.5-.2.5-.5v-3c0-.3-.2-.5-.5-.5zM12 18c-.3 0-.5.2-.5.5v3c0 .3.2.5.5.5s.5-.2.5-.5v-3c0-.3-.2-.5-.5-.5zM6 11H3c-.3 0-.5.2-.5.5s.2.5.5.5h3c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zM21 11h-3c-.3 0-.5.2-.5.5s.2.5.5.5h3c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zM18.4 17l2.1 2.1c.2.2.5.2.7 0 .2-.2.2-.5 0-.7l-2.1-2.1c-.2-.2-.5-.2-.7 0-.2.2-.2.5 0 .7zM4.9 3.5c-.2-.2-.5-.2-.7 0s-.2.5 0 .7l2.1 2.1c.2.2.5.2.7 0 .2-.2.2-.5 0-.7L4.9 3.5zM19.1 4.2l-2.1 2.1c-.2.2-.2.5 0 .7.2.2.5.2.7 0l2.1-2.1c.2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0zM5.6 16.3c-.2-.2-.5-.2-.7 0l-2.1 2.1c-.2.2-.2.5 0 .7.2.2.5.2.7 0l2.1-2.1c.2-.2.2-.5 0-.7z M12 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z",
  
  // GHS02: Flammable (Flame)
  flammable: "M12 23c0-4.3 3.3-6.5 3.3-9.5 0-3-1.8-4.5-1.8-6.5 0 4-3.5 5-3.5 9 0 3.5 2 7 2 7zm-1-16c0 0 2.5 2 2.5 5 0 2.5-1.5 3.5-1.5 5.5 0-2-1-3-1-5 0-3-1-4 0-5.5z M10 23h4", 
  
  // GHS03: Oxidizing (Flame over Circle)
  oxidizing: "M12 4.5c0 0 2.5 3 2.5 5 0 1.5-1 2.5-2.5 2.5-1.5 0-2.5-1-2.5-2.5 0-2 2.5-5 2.5-5z M12 13a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z", 
  
  // GHS04: Compressed Gas (Gas Cylinder)
  compressed: "M8 6h8v13H8z M10 2h4v4h-4z M7 6h10 M7 19h10", 
  
  // GHS05: Corrosive (Corrosion)
  corrosive: "M2 6h7v2H2z M15 6h7v2h-7z M4 9l3 6M12 9l3 6M2 19h20c0 1.5-1 2.5-2.5 2.5h-15C3 21.5 2 20.5 2 19z M5 17h4 M15 17h4 M6 13h2 M16 13h2", 
  
  // GHS06: Toxic (Skull and Crossbones)
  toxic: "M12 2c-3.3 0-6 2.7-6 6 0 2 1.5 4 3.5 5v1.5h5V13c2-1 3.5-3 3.5-5 0-3.3-2.7-6-6-6zm-2 5.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm5.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z M4 20l16-14M4 6l16 14", 
  
  // GHS07: Irritant (Exclamation Mark)
  irritant: "M11 5h2v9h-2z M11 17h2v2h-2z", 
  
  // GHS08: Health Hazard (Health Hazard / Carcinogen)
  health: "M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-5 8c-2 0-4 1-4 4v4h18v-4c0-3-2-4-4-4h-2l-1 2-1-2h-2z M12 11l1 2.5h2.5l-2 1.5 1 2.5-2.5-1.5-2.5 1.5 1-2.5-2-1.5h2.5z", 
  
  // GHS09: Environmental (Environment)
  environment: "M15 20v-8l-3-4-3 4v8 M12 2v6 M3 14c0 2 2 3 4 3h6l2-3-2-3H7c-2 0-4 1-4 3z" 
};

// --- Helper Components ---

const InfoItem: React.FC<{ label: string, value: string | string[], lang: Language }> = ({ label, value, lang }) => (
  <div className="mb-4 last:mb-0">
    <span className="text-slate-500 text-xs font-bold block mb-1 uppercase tracking-wider">{label}</span>
    {Array.isArray(value) ? (
      <div className="flex flex-wrap gap-2 mt-1">
        {value.map((v, i) => (
          <span key={i} className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-sm text-slate-700 font-medium">
            {v}
          </span>
        ))}
      </div>
    ) : (
      <span className="text-slate-800 font-semibold leading-relaxed block bg-slate-50/50 p-2 rounded-lg border border-slate-100 italic md:not-italic">
        {value || (lang === 'fa' ? 'اطلاعات موجود نیست' : 'Not available')}
      </span>
    )}
  </div>
);

// New Component: Renders a list of GHS Pictograms as Safety Signs
const PictogramList: React.FC<{ items: string[], size?: 'sm' | 'lg' }> = ({ items, size = 'lg' }) => {
  const getIconType = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('explo') || n.includes('bomb')) return 'explosive';
    if (n.includes('oxidi')) return 'oxidizing';
    if (n.includes('flam') || n.includes('fire')) return 'flammable';
    if (n.includes('gas') || n.includes('press')) return 'compressed';
    if (n.includes('corr') || n.includes('acid')) return 'corrosive';
    if (n.includes('tox') || n.includes('poison') || n.includes('skull')) return 'toxic';
    if (n.includes('irrit') || n.includes('exclam')) return 'irritant';
    if (n.includes('health') || n.includes('carcin') || n.includes('muta')) return 'health';
    if (n.includes('envir') || n.includes('aqua')) return 'environment';
    return 'irritant'; // Default fallback
  };

  const uniqueItems = Array.from(new Set(items)) as string[];

  return (
    <div className={`flex flex-wrap ${size === 'lg' ? 'gap-6' : 'gap-2 justify-center'}`}>
      {uniqueItems.map((item, idx) => {
        const type = getIconType(item);
        const path = GHS_PATHS[type];
        
        return (
          <div key={idx} className="flex flex-col items-center group">
            {/* The Red Diamond */}
            <div className={`relative flex items-center justify-center bg-white border-red-600 shadow-sm transition-transform hover:scale-110 ${size === 'lg' ? 'w-24 h-24 border-[6px] rounded-xl' : 'w-10 h-10 border-[3px] rounded-md'} rotate-45 mb-4 mt-2`}>
              <div className="-rotate-45">
                 <svg viewBox="0 0 24 24" className={`${size === 'lg' ? 'w-16 h-16' : 'w-6 h-6'} text-black fill-current`} stroke="currentColor" strokeWidth={type === 'irritant' || type === 'compressed' ? 1.5 : 0.5}>
                    <path d={path} />
                 </svg>
              </div>
            </div>
            {/* Label */}
            {size === 'lg' && (
              <span className="text-xs font-bold text-slate-700 text-center max-w-[100px] leading-tight mt-2">{item}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ExpandableSection: React.FC<{ 
  icon: React.ElementType, 
  title: string, 
  color: string, 
  isOpen: boolean, 
  onToggle: () => void,
  children: React.ReactNode,
  lang: Language
}> = ({ icon: Icon, title, color, isOpen, onToggle, children, lang }) => {
  const isRtl = lang === 'fa';
  return (
    <div className="mb-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      <button 
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-5 focus:outline-none no-print ${isRtl ? 'text-right' : 'text-left'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      <div className="hidden print:flex items-center gap-4 p-5 border-b border-slate-100">
        <Icon className={`w-6 h-6 ${color}`} />
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>

      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} print:max-h-none print:opacity-100 overflow-hidden`}>
        <div className="p-6 pt-0 border-t border-slate-50 print:border-none">
          {children}
        </div>
      </div>
    </div>
  );
};

const InteractionView: React.FC<{
  savedItems: ChemicalAnalysis[];
  lang: Language;
  theme: ThemeConfig;
  onBack: () => void;
}> = ({ savedItems, lang, theme, onBack }) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'fa';

  const [chemA, setChemA] = useState<string>('');
  const [chemB, setChemB] = useState<string>('');
  const [heat, setHeat] = useState(false);
  const [pressure, setPressure] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);

  const handleAnalyze = async () => {
    if (!chemA || !chemB) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await analyzeInteraction(chemA, chemB, { heat, pressure }, lang);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'HIGH': return 'bg-red-600 text-white border-red-600';
      case 'MEDIUM': return 'bg-orange-500 text-white border-orange-500';
      case 'LOW': return 'bg-yellow-400 text-slate-900 border-yellow-400';
      default: return 'bg-slate-200 text-slate-600 border-slate-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch(severity) {
      case 'HIGH': return t.severityHigh;
      case 'MEDIUM': return t.severityMedium;
      case 'LOW': return t.severityLow;
      default: return t.severityNone;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-2xl font-bold ${theme.accent} flex items-center gap-3`}>
             <FlaskConical className="w-8 h-8" />
             {t.interactionTitle}
          </h2>
          <p className="text-slate-500 mt-1">{t.interactionDesc}</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
          {t.backToSearch}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Input Card */}
        <div className="md:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-fit">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t.selectChemA}</label>
              <select 
                value={chemA}
                onChange={(e) => setChemA(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                disabled={savedItems.length === 0}
              >
                <option value="">{savedItems.length === 0 ? t.listEmptyHint : t.selectFromList}</option>
                {savedItems.map((item, idx) => (
                  <option key={idx} value={item.identification.chemicalName}>
                    {item.identification.chemicalName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <Plus className="w-6 h-6 text-slate-300" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">{t.selectChemB}</label>
              <select 
                value={chemB}
                onChange={(e) => setChemB(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                disabled={savedItems.length === 0}
              >
                <option value="">{savedItems.length === 0 ? t.listEmptyHint : t.selectFromList}</option>
                {savedItems.map((item, idx) => (
                  <option key={idx} value={item.identification.chemicalName}>
                    {item.identification.chemicalName}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.conditions}</span>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${heat ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'}`}>
                    {heat && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={heat} onChange={e => setHeat(e.target.checked)} />
                  <span className={`text-sm font-medium ${heat ? 'text-orange-600' : 'text-slate-600'} flex items-center gap-2`}>
                    <Flame className="w-4 h-4" /> {t.condHeat}
                  </span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${pressure ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-300'}`}>
                    {pressure && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={pressure} onChange={e => setPressure(e.target.checked)} />
                  <span className={`text-sm font-medium ${pressure ? 'text-indigo-600' : 'text-slate-600'} flex items-center gap-2`}>
                    <Gauge className="w-4 h-4" /> {t.condPressure}
                  </span>
                </label>
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !chemA || !chemB}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 ${theme.primary} ${theme.primaryHover} ${theme.shadow}`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FlaskConical className="w-5 h-5" />}
              {loading ? t.reacting : t.analyzeReaction}
            </button>
          </div>
        </div>

        {/* Result Card */}
        <div className="md:col-span-2 space-y-6">
          {!result && !loading && (
             <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
               <FlaskConical className="w-16 h-16 mb-4 opacity-20" />
               <p className="font-medium max-w-sm">{t.interactionDesc}</p>
             </div>
          )}

          {loading && (
             <div className="bg-white rounded-3xl border border-slate-100 h-full min-h-[400px] flex flex-col items-center justify-center p-8">
               <div className={`relative w-20 h-20 mb-6`}>
                 <div className={`absolute inset-0 rounded-full border-4 border-slate-100`}></div>
                 <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${theme.accent.replace('text-', 'border-')}`}></div>
               </div>
               <p className="text-slate-500 font-medium animate-pulse">{t.reacting}</p>
             </div>
          )}

          {result && (
            <>
              {/* Severity Banner */}
              <div className={`rounded-2xl p-6 border-l-8 shadow-sm flex items-center gap-5 ${getSeverityColor(result.severity).replace('text-white', 'bg-opacity-10').replace('bg-', 'bg-').replace('text-slate-900', '')} ${
                result.severity === 'HIGH' ? 'bg-red-50 border-red-600' : 
                result.severity === 'MEDIUM' ? 'bg-orange-50 border-orange-500' :
                'bg-slate-50 border-slate-400'
              }`}>
                <div className={`p-3 rounded-xl ${getSeverityColor(result.severity)}`}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className={`text-2xl font-black ${
                     result.severity === 'HIGH' ? 'text-red-700' : 
                     result.severity === 'MEDIUM' ? 'text-orange-700' :
                     'text-slate-700'
                  }`}>
                    {getSeverityLabel(result.severity)}
                  </h3>
                  <p className="text-slate-600 font-medium mt-1">{result.reactionType}</p>
                </div>
              </div>

              {/* Equation */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FlaskConical className="w-24 h-24" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">{t.equation}</span>
                <p className="text-lg md:text-xl font-mono leading-relaxed" dir="ltr">{result.equation}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    {t.products}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.products.map((p, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                   <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <ThermometerSnowflake className="w-5 h-5 text-orange-500" />
                    {t.condEffects}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{result.conditionEffects}</p>
                </div>
              </div>

              {/* Hazards & Safety */}
              <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                 <h4 className="font-bold text-red-800 flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-5 h-5" />
                    {t.hazards}
                  </h4>
                  <p className="text-red-700 leading-relaxed mb-6">{result.hazards}</p>

                  <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-3 pt-6 border-t border-red-200/50">
                    <ClipboardCheck className="w-5 h-5" />
                    {t.safetyAction}
                  </h4>
                  <p className="text-emerald-800 leading-relaxed">{result.safetyMeasures}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const UnitConverterModal: React.FC<{ isOpen: boolean; onClose: () => void; lang: Language; theme: ThemeConfig }> = ({ isOpen, onClose, lang, theme }) => {
  const [category, setCategory] = useState<'temperature' | 'pressure' | 'concentration'>('temperature');
  const [value, setValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('c');
  const [toUnit, setToUnit] = useState<string>('f');
  const [mw, setMw] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const t = TRANSLATIONS[lang];

  const units = useMemo(() => ({
    temperature: [
      { id: 'c', label: 'Celsius (°C)' },
      { id: 'f', label: 'Fahrenheit (°F)' },
      { id: 'k', label: 'Kelvin (K)' }
    ],
    pressure: [
      { id: 'atm', label: 'Atmosphere (atm)' },
      { id: 'bar', label: 'Bar (bar)' },
      { id: 'psi', label: 'PSI' },
      { id: 'kpa', label: 'kPa' },
      { id: 'mmhg', label: 'mmHg' }
    ],
    concentration: [
      { id: 'ppm', label: 'ppm' },
      { id: 'mgm3', label: 'mg/m³' }
    ]
  }), []);

  useEffect(() => {
    setFromUnit(units[category][0].id);
    setToUnit(units[category][1]?.id || units[category][0].id);
    setValue('');
    setResult('');
    if (category !== 'concentration') setMw('');
  }, [category, units]);

  useEffect(() => {
    const val = parseFloat(value);
    if (isNaN(val) || value === '') {
      setResult('');
      return;
    }

    let res = 0;

    if (category === 'temperature') {
       if (fromUnit === toUnit) res = val;
       else if (fromUnit === 'c') res = toUnit === 'f' ? (val * 9/5) + 32 : val + 273.15;
       else if (fromUnit === 'f') res = toUnit === 'c' ? (val - 32) * 5/9 : (val - 32) * 5/9 + 273.15;
       else if (fromUnit === 'k') res = toUnit === 'c' ? val - 273.15 : (val - 273.15) * 9/5 + 32;
    } else if (category === 'pressure') {
       const toAtm = (v: number, u: string) => {
         switch(u) {
           case 'atm': return v;
           case 'bar': return v / 1.01325;
           case 'psi': return v / 14.696;
           case 'kpa': return v / 101.325;
           case 'mmhg': return v / 760;
           return v;
         }
       };
       const fromAtm = (v: number, u: string) => {
         switch(u) {
           case 'atm': return v;
           case 'bar': return v * 1.01325;
           case 'psi': return v * 14.696;
           case 'kpa': return v * 101.325;
           case 'mmhg': return v * 760;
           return v;
         }
       };
       res = fromAtm(toAtm(val, fromUnit), toUnit);
    } else if (category === 'concentration') {
      const molWeight = parseFloat(mw);
      if (isNaN(molWeight) || molWeight <= 0) {
        setResult(lang === 'fa' ? 'لطفا وزن مولکولی (MW) را وارد کنید' : 'Please enter molecular weight');
        return;
      }
      if (fromUnit === 'ppm' && toUnit === 'mgm3') {
        res = (val * molWeight) / 24.45;
      } else if (fromUnit === 'mgm3' && toUnit === 'ppm') {
        res = (val * 24.45) / molWeight;
      } else {
        res = val;
      }
    }

    if (typeof res === 'number') {
      setResult(res.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits: 4 }));
    }
  }, [value, fromUnit, toUnit, mw, category, lang]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <h3 className="font-bold text-xl flex items-center gap-2 text-slate-800">
            <Calculator className={`${theme.accent} w-6 h-6`} />
            {t.unitConverter}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setCategory('temperature')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${category === 'temperature' ? `bg-white ${theme.accent} shadow-sm` : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.temp}
            </button>
            <button 
              onClick={() => setCategory('pressure')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${category === 'pressure' ? `bg-white ${theme.accent} shadow-sm` : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.pressure}
            </button>
            <button 
              onClick={() => setCategory('concentration')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${category === 'concentration' ? `bg-white ${theme.accent} shadow-sm` : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.conc}
            </button>
          </div>

          {category === 'concentration' && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
              <label className="block text-xs font-bold text-amber-800 mb-2">{t.mw}</label>
              <input
                type="number"
                value={mw}
                onChange={(e) => setMw(e.target.value)}
                placeholder="e.g. 98.08"
                className="w-full bg-white border border-amber-200 rounded-lg px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-left"
                dir="ltr"
              />
              <p className="text-[10px] text-amber-600 mt-2">{t.mwHint}</p>
            </div>
          )}

          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
             <div className="space-y-2">
               <select 
                 value={fromUnit}
                 onChange={(e) => setFromUnit(e.target.value)}
                 className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-${theme.primary.split('-')[1]}-400`}
               >
                 {units[category].map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
               </select>
               <input
                 type="number"
                 value={value}
                 onChange={(e) => setValue(e.target.value)}
                 placeholder="0.00"
                 className={`w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:border-${theme.primary.split('-')[1]}-500 text-left`}
                 dir="ltr"
                 autoFocus
               />
             </div>

             <div className="text-slate-400 flex justify-center">
               <ArrowRightLeft className="w-5 h-5" />
             </div>

             <div className="space-y-2">
               <select 
                 value={toUnit}
                 onChange={(e) => setToUnit(e.target.value)}
                 className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-${theme.primary.split('-')[1]}-400`}
               >
                 {units[category].map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
               </select>
               <div className={`w-full ${theme.secondary} ${theme.border} border rounded-lg px-4 py-3 text-lg font-bold ${theme.accent} text-left h-[54px] flex items-center overflow-x-auto`}>
                 {result || '-'}
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewsSection: React.FC<{ query: string; lang: Language; theme: ThemeConfig }> = ({ query, lang, theme }) => {
  const [news, setNews] = useState<NewsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setNews(null);
    setLoaded(false);
  }, [query]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const result = await searchSafetyNews(query, lang);
      setNews(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  if (!loaded && !loading) {
    return (
      <button 
        onClick={fetchNews}
        className={`w-full ${theme.secondary} hover:bg-slate-100 ${theme.accent} p-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold text-sm border ${theme.border} border-dashed`}
      >
        <Newspaper className="w-4 h-4" />
        {t.newsSearchBtn}
      </button>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-center gap-2 text-slate-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        {t.newsSearching}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm animate-in fade-in">
      <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
        <Sparkles className={`w-4 h-4 ${theme.accent}`} />
        {t.secNews}
      </h4>
      <p className="text-slate-700 text-sm leading-relaxed mb-4">{news?.summary}</p>
      
      {news?.sources && news.sources.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <span className="text-xs font-bold text-slate-400 block mb-2">{t.sources}:</span>
          <div className="flex flex-col gap-2">
            {news.sources.map((source, i) => (
              <a 
                key={i} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-xs ${theme.accent} hover:underline truncate`}
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                {source.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ChatWidget = ({ lang, theme }: { lang: Language, theme: ThemeConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const t = TRANSLATIONS[lang];
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);
  const voiceAssistantRef = useRef<VoiceAssistant | null>(null);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      chatSessionRef.current = createChatSession(lang);
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: lang === 'fa' ? 'سلام! من دستیار هوشمند ایمنی شما هستم. چطور می‌توانم کمک کنم؟' : 'Hello! I am your AI safety assistant. How can I help you?'
      }]);
    }
  }, [isOpen, lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: result.text 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: lang === 'fa' ? 'متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.' : 'Sorry, an error occurred. Please try again.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoice = async () => {
    if (!voiceAssistantRef.current) {
      voiceAssistantRef.current = new VoiceAssistant((active) => setIsVoiceActive(active), lang);
    }

    if (isVoiceActive) {
      voiceAssistantRef.current.stop();
    } else {
      await voiceAssistantRef.current.start();
    }
  };

  const isRtl = lang === 'fa';

  return (
    <div className={`fixed bottom-6 ${isRtl ? 'right-6' : 'left-6'} z-50 flex flex-col ${isRtl ? 'items-end' : 'items-start'} gap-4 no-print`}>
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col border border-slate-200 animate-in slide-in-from-bottom-10 fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`${theme.primary} p-1.5 rounded-lg`}>
                {mode === 'chat' ? <MessageSquare className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
              </div>
              <span className="font-bold text-sm">{t.chatTitle}</span>
            </div>
            <div className="flex items-center gap-1">
               <button 
                onClick={() => setMode(mode === 'chat' ? 'voice' : 'chat')}
                className={`text-xs px-2 py-1 rounded border transition-colors ${mode === 'voice' ? 'bg-red-500/20 border-red-500 text-red-100' : 'bg-slate-700 border-slate-600'}`}
              >
                {mode === 'chat' ? t.voiceMode : t.chatMode}
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 p-1 rounded transition-colors">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          {mode === 'chat' ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? `${theme.primary} text-white rounded-br-none` 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-slate-200 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.chatPlaceholder}
                    className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isTyping}
                    className={`${theme.primary} ${theme.primaryHover} text-white p-2 rounded-xl transition-colors disabled:opacity-50`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 rounded-b-2xl relative overflow-hidden">
               {/* Ambient Background */}
               <div className={`absolute inset-0 bg-red-600/10 transition-opacity duration-1000 ${isVoiceActive ? 'opacity-100' : 'opacity-0'}`}></div>
               <div className="relative z-10 flex flex-col items-center gap-6">
                 <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isVoiceActive ? `${theme.primary} ${theme.shadow} scale-110` : 'bg-slate-700'}`}>
                    <Mic className={`w-10 h-10 text-white ${isVoiceActive ? 'animate-pulse' : ''}`} />
                 </div>
                 <div className="text-center">
                   <h3 className="text-white font-bold text-lg mb-1">
                     {isVoiceActive ? t.voiceListening : t.voiceMode}
                   </h3>
                   <p className="text-slate-400 text-xs">
                     {isVoiceActive ? t.voiceEnd : t.voiceHint}
                   </p>
                 </div>
                 <button 
                   onClick={toggleVoice}
                   className={`px-8 py-3 rounded-xl font-bold transition-all text-sm ${
                     isVoiceActive 
                       ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20' 
                       : 'bg-white text-slate-900 hover:bg-slate-100'
                   }`}
                 >
                   {isVoiceActive ? t.voiceEnd : t.voiceStart}
                 </button>
               </div>
            </div>
          )}
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${isOpen ? 'bg-slate-700 text-white' : `${theme.primary} text-white ${theme.shadow}`}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
};

// ... SettingsModal (Same as previous) ...
const SettingsModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  lang: Language; 
  setLang: (l: Language) => void;
  themeId: string;
  setThemeId: (id: string) => void;
}> = ({ isOpen, onClose, lang, setLang, themeId, setThemeId }) => {
  const t = TRANSLATIONS[lang];
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
          <h3 className="font-bold text-xl flex items-center gap-2 text-slate-800">
            <Settings className="text-slate-600 w-6 h-6" />
            {t.settings}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
              <Globe className="w-5 h-5" />
              {t.language}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setLang('fa')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${lang === 'fa' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <span className="font-bold">فارسی</span>
                {lang === 'fa' && <Check className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${lang === 'en' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <span className="font-bold">English</span>
                {lang === 'en' && <Check className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
              <Palette className="w-5 h-5" />
              {t.theme}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(THEMES).map(th => (
                <button
                  key={th.id}
                  onClick={() => setThemeId(th.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${themeId === th.id ? `border-${th.primary.split('-')[1]}-500 bg-slate-50` : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${th.primary}`}></div>
                    <span className="text-sm font-medium text-slate-700">{th.name}</span>
                  </div>
                  {themeId === th.id && <Check className={`w-4 h-4 ${th.accent}`} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100">
           <button onClick={onClose} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-all">
             {t.close}
           </button>
        </div>
      </div>
    </div>
  );
};

// ... ComparisonTable (Updated to use PictogramList) ...
const ComparisonTable: React.FC<{
  items: ChemicalAnalysis[];
  onRemove: (index: number) => void;
  onBack: () => void;
  lang: Language;
  theme: ThemeConfig;
}> = ({ items, onRemove, onBack, lang, theme }) => {
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'fa';

  if (items.length === 0) return null;

  const renderRow = (label: string, accessor: (item: ChemicalAnalysis) => string | string[], isPictogram = false) => (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className={`p-4 bg-slate-50 font-bold text-slate-600 text-sm align-top min-w-[150px] sticky ${isRtl ? 'right-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]' : 'left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]'}`}>{label}</td>
      {items.map((item, idx) => {
        const value = accessor(item);
        return (
          <td key={`${item.identification.casNumber}-${idx}`} className="p-4 text-slate-800 text-sm align-top min-w-[250px]">
            {isPictogram && Array.isArray(value) ? (
              <PictogramList items={value} size="sm" />
            ) : Array.isArray(value) ? (
              <div className="flex flex-wrap gap-1">
                {value.map((v, i) => (
                  <span key={i} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-xs">{v}</span>
                ))}
              </div>
            ) : (
              value || '-'
            )}
          </td>
        );
      })}
    </tr>
  );

  const renderSectionHeader = (title: string, icon: React.ElementType, colorClass: string) => {
    const Icon = icon;
    return (
      <tr className={`${colorClass} bg-opacity-10`}>
        <td colSpan={items.length + 1} className="p-3 font-bold flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-').replace('-50', '-600')}`} />
          <span className="text-slate-800">{title}</span>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50 sticky top-0 z-20">
        <h2 className="font-bold text-xl flex items-center gap-2 text-slate-800">
            <Scale className={theme.accent} /> 
            {t.compareTitle} ({items.length})
        </h2>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
          {t.backToSearch}
        </button>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} border-collapse`}>
          <thead>
            <tr>
              <th className={`p-4 bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider sticky z-10 ${isRtl ? 'right-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]' : 'left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]'}`}>{t.features}</th>
              {items.map((item, idx) => (
                <th key={idx} className="p-4 bg-white min-w-[250px] border-b-2 border-slate-100">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-lg text-slate-900">{item.identification.chemicalName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1">{item.identification.casNumber}</div>
                    </div>
                    <button 
                      onClick={() => onRemove(idx)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderSectionHeader(t.secID, ClipboardCheck, "bg-blue-50")}
            {renderRow(t.formula, i => i.identification.formula)}
            {renderRow(t.synonyms, i => i.identification.synonyms)}

            {renderSectionHeader(t.secHazards, AlertTriangle, "bg-red-50")}
            {renderRow(t.ghsClass, i => i.hazards.ghsClass)}
            {/* Pictograms rendered with custom component */}
            {renderRow(t.pictograms, i => i.hazards.pictograms, true)}
            {renderRow(t.phyHazards, i => i.hazards.physicalHazards)}
            {renderRow(t.healthHazards, i => i.hazards.healthHazards)}

            {renderSectionHeader(t.secExposure, Wind, "bg-teal-50")}
            {renderRow("TLV", i => i.exposureLimits.tlv)}
            {renderRow("PEL", i => i.exposureLimits.pel)}
            {renderRow("STEL", i => i.exposureLimits.stel)}

            {renderSectionHeader(t.secSafety, ShieldAlert, "bg-indigo-50")}
            {renderRow(t.ppe, i => i.safetyMeasures.ppe)}
            {renderRow(t.engControls, i => i.safetyMeasures.engineeringControls)}
            {renderRow(t.storage, i => i.safetyMeasures.storage)}
            {renderRow(t.segregation, i => i.safetyMeasures.segregation)}

            {renderSectionHeader(t.secReactions, ThermometerSnowflake, "bg-orange-50")}
            {renderRow(t.incompatible, i => i.reactions.incompatibleMaterials)}
            {renderRow(t.dangReact, i => i.reactions.dangerousReactions)}

            {renderSectionHeader(t.secFirstAid, Droplets, "bg-rose-50")}
            {renderRow(t.skin, i => i.firstAid.skin)}
            {renderRow(t.eyes, i => i.firstAid.eyes)}
            {renderRow(t.inhalation, i => i.firstAid.inhalation)}
            {renderRow(t.ingestion, i => i.firstAid.ingestion)}

            {renderSectionHeader(t.secEmergency, ShieldAlert, "bg-slate-50")}
            {renderRow(t.spill, i => i.emergency.spill)}
            {renderRow(t.fire, i => i.emergency.fire)}

            {renderSectionHeader(t.secTransport, Truck, "bg-gray-50")}
            {renderRow(t.unNum, i => i.transport.unNumber)}
            {renderRow(t.transClass, i => i.transport.class)}
            {renderRow(t.packGroup, i => i.transport.packingGroup)}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default function App() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<ChemicalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [lang, setLang] = useState<Language>('fa');
  const [currentThemeId, setCurrentThemeId] = useState<string>('industrial');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Derived state
  const t = TRANSLATIONS[lang];
  const theme = THEMES[currentThemeId];

  // Comparison & Saved State
  const [comparisonList, setComparisonList] = useState<ChemicalAnalysis[]>([]);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [savedItems, setSavedItems] = useState<ChemicalAnalysis[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  
  // New: Interaction Mode
  const [isInteractionMode, setIsInteractionMode] = useState(false);

  // Track open sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identification: true,
    hazards: true,
    exposureLimits: false,
    news: true,
  });

  // Effects
  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hazmat_saved_items');
      if (saved) {
        setSavedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse saved items", e);
    }
  }, []);

  const saveToLocalStorage = (items: ChemicalAnalysis[]) => {
    localStorage.setItem('hazmat_saved_items', JSON.stringify(items));
  };

  const handleSaveResult = () => {
    if (!result) return;
    const exists = savedItems.some(i => 
      i.identification.casNumber === result.identification.casNumber ||
      i.identification.chemicalName === result.identification.chemicalName
    );
    if (exists) return;
    const newItems = [result, ...savedItems];
    setSavedItems(newItems);
    saveToLocalStorage(newItems);
  };

  const handleDeleteSaved = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newItems = savedItems.filter((_, i) => i !== index);
    setSavedItems(newItems);
    saveToLocalStorage(newItems);
  };

  const handleLoadSaved = (item: ChemicalAnalysis) => {
    setResult(item);
    setStatus(LoadingState.SUCCESS);
    setIsSavedModalOpen(false);
    setIsComparisonMode(false);
    setIsInteractionMode(false); // Close other modes
    setQuery(item.identification.chemicalName);
    setOpenSections({
      identification: true,
      hazards: true,
      exposureLimits: false,
      reactions: false,
      safetyMeasures: false,
      firstAid: false,
      emergency: false,
      transport: false,
      news: true
    });
  };

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (open: boolean) => {
    const keys = [
      'identification', 'hazards', 'exposureLimits', 'reactions', 
      'safetyMeasures', 'firstAid', 'emergency', 'transport', 'news'
    ];
    const newState = keys.reduce((acc, key) => ({ ...acc, [key]: open }), {});
    setOpenSections(newState);
  };

  const areAllOpen = useMemo(() => {
    const keys = [
      'identification', 'hazards', 'exposureLimits', 'reactions', 
      'safetyMeasures', 'firstAid', 'emergency', 'transport'
    ];
    return keys.every(key => openSections[key]);
  }, [openSections]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    setStatus(LoadingState.LOADING);
    setError(null);
    setIsComparisonMode(false);
    setIsInteractionMode(false);
    try {
      const data = await analyzeChemical(query, lang);
      setResult(data);
      setStatus(LoadingState.SUCCESS);
      
      setOpenSections({
        identification: true,
        hazards: true,
        exposureLimits: false,
        reactions: false,
        safetyMeasures: false,
        firstAid: false,
        emergency: false,
        transport: false,
        news: true
      });
    } catch (err: any) {
      setError(err.message || (lang === 'fa' ? "خطایی رخ داد" : "An error occurred"));
      setStatus(LoadingState.ERROR);
    }
  }, [query, lang]);

  const addToComparison = () => {
    if (!result) return;
    const exists = comparisonList.some(
      item => item.identification.casNumber === result.identification.casNumber || 
              item.identification.chemicalName === result.identification.chemicalName
    );
    if (!exists) setComparisonList(prev => [...prev, result]);
  };

  const removeFromComparison = (index: number) => {
    setComparisonList(prev => prev.filter((_, i) => i !== index));
    if (comparisonList.length <= 1) setIsComparisonMode(false);
  };

  const handlePrint = () => window.print();

  const isInComparison = result && comparisonList.some(
    item => item.identification.casNumber === result.identification.casNumber ||
            item.identification.chemicalName === result.identification.chemicalName
  );

  const isSaved = result && savedItems.some(
    item => item.identification.casNumber === result.identification.casNumber ||
            item.identification.chemicalName === result.identification.chemicalName
  );

  const isRtl = lang === 'fa';

  return (
    <div className="min-h-screen pb-32 bg-slate-50/50 transition-colors duration-500" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Modals */}
      <UnitConverterModal isOpen={isConverterOpen} onClose={() => setIsConverterOpen(false)} lang={lang} theme={theme} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} lang={lang} setLang={setLang} themeId={currentThemeId} setThemeId={setCurrentThemeId} />

      {/* Saved Items Modal */}
      {isSavedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-xl flex items-center gap-2 text-slate-800">
                <Bookmark className={`${theme.accent} w-6 h-6`} />
                {t.savedItems}
              </h3>
              <button onClick={() => setIsSavedModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-3">
              {savedItems.length === 0 ? (
                <div className="text-center text-slate-400 py-10">
                  <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-10" />
                  <p className="font-medium">{t.emptySaved}</p>
                </div>
              ) : (
                savedItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleLoadSaved(item)} 
                    className={`group bg-slate-50 hover:bg-white border border-slate-200 hover:${theme.border} p-4 rounded-2xl cursor-pointer transition-all hover:shadow-md flex justify-between items-center`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{item.identification.chemicalName}</h4>
                      <div className="flex gap-2 mt-1 text-xs text-slate-500">
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded">{item.identification.casNumber}</span>
                        <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">{item.identification.formula}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteSaved(e, idx)} 
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-gradient-to-l ${theme.gradient} text-white shadow-xl no-print sticky top-0 z-40 transition-all duration-500`}>
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => {
            setIsComparisonMode(false);
            setIsInteractionMode(false);
            setResult(null);
            setQuery('');
            setStatus(LoadingState.IDLE);
          }}>
            <div className={`${theme.primary} p-2.5 rounded-xl shadow-lg ${theme.shadow}`}>
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t.appTitle}</h1>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">{t.appDesc}</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-xl w-full flex items-center gap-3">
             <button onClick={() => setIsSettingsOpen(true)} className="bg-slate-700 hover:bg-slate-600 p-3.5 rounded-2xl transition-colors text-slate-300 hover:text-white" title={t.settings}>
               <Settings className="w-5 h-5" />
             </button>
             <button onClick={() => setIsConverterOpen(true)} className="bg-slate-700 hover:bg-slate-600 p-3.5 rounded-2xl transition-colors text-slate-300 hover:text-white" title={t.unitConverter}>
              <Calculator className="w-5 h-5" />
            </button>
             <button onClick={() => setIsInteractionMode(true)} className="bg-slate-700 hover:bg-slate-600 p-3.5 rounded-2xl transition-colors text-slate-300 hover:text-white" title={t.interactionTitle}>
              <FlaskConical className="w-5 h-5" />
            </button>
             <button onClick={() => setIsSavedModalOpen(true)} className="bg-slate-700 hover:bg-slate-600 p-3.5 rounded-2xl transition-colors relative group" title={t.savedItems}>
              <Bookmark className="w-5 h-5 text-slate-300 group-hover:text-white" />
              {savedItems.length > 0 && (
                <span className={`absolute -top-1 -right-1 ${theme.primary} text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center`}>
                  {savedItems.length}
                </span>
              )}
            </button>
            <div className="relative group flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={t.searchPlaceholder}
                className={`w-full bg-slate-700/50 border border-slate-600 text-white px-6 py-3.5 rounded-2xl shadow-inner focus:outline-none focus:ring-4 ${theme.ring} focus:bg-slate-700 transition-all text-lg ${isRtl ? 'pr-12' : 'pl-12'} text-right`}
                dir={isRtl ? 'rtl' : 'ltr'}
              />
              <button 
                onClick={handleSearch}
                disabled={status === LoadingState.LOADING}
                className={`absolute ${isRtl ? 'left-1.5' : 'right-1.5'} top-1.5 bottom-1.5 ${theme.primary} ${theme.primaryHover} text-white px-5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 shadow-lg ${theme.shadow} font-bold`}
              >
                {status === LoadingState.LOADING ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                <span className="hidden sm:inline">{t.searchBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 mt-10 relative">
        
        {/* Interaction Mode View */}
        {isInteractionMode ? (
          <InteractionView 
            savedItems={savedItems}
            lang={lang}
            theme={theme}
            onBack={() => setIsInteractionMode(false)}
          />
        ) : isComparisonMode ? (
          <ComparisonTable 
            items={comparisonList} 
            onRemove={removeFromComparison} 
            onBack={() => setIsComparisonMode(false)} 
            lang={lang}
            theme={theme}
          />
        ) : (
          /* Normal Search View */
          <>
            {status === LoadingState.IDLE && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 no-print">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 mb-8 border border-slate-100">
                  <ClipboardCheck className="w-24 h-24 text-slate-200" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-slate-700">{t.idleTitle}</h2>
                <p className="max-w-md text-center leading-relaxed">
                  {t.idleDesc}
                </p>
              </div>
            )}
            
            {/* ... Rest of Normal View (Loading, Error, Result) ... */}
            {status === LoadingState.LOADING && (
              <div className="flex flex-col items-center justify-center py-32 no-print">
                <div className="relative mb-8">
                  <div className={`absolute inset-0 ${theme.primary} blur-2xl opacity-20 animate-pulse`}></div>
                  <Loader2 className={`w-16 h-16 ${theme.accent} animate-spin relative`} />
                </div>
                <h2 className="text-2xl font-bold text-slate-700">{t.loadingTitle}</h2>
                <p className="text-slate-500 mt-2">{t.loadingDesc}</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2rem] flex items-start gap-6 no-print shadow-xl shadow-red-100/20">
                <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/30 shrink-0">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900">{t.errorTitle}</h3>
                  <p className="text-red-700 mt-2 text-lg">{error}</p>
                  <button 
                    onClick={handleSearch} 
                    className="mt-6 bg-white border border-red-200 px-6 py-2 rounded-xl text-red-700 font-bold hover:bg-red-100 transition-colors"
                  >
                    {t.retryBtn}
                  </button>
                </div>
              </div>
            )}

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                
                {/* --- PRINT ONLY SUMMARY (One Page) --- */}
                <div className="hidden print:block font-sans text-black p-0 m-0">
                    {/* Header */}
                    <div className="border-b-2 border-black pb-2 mb-4 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">{result.identification.chemicalName}</h1>
                            <div className="text-sm font-mono mt-1">CAS: {result.identification.casNumber} | Formula: {result.identification.formula}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold">HazmatAI Report</div>
                            <div className="text-xs text-gray-500">{new Date().toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {/* Col 1: GHS & Classification */}
                        <div className="col-span-1 border border-black p-2 rounded">
                            <h3 className="font-bold border-b border-black mb-2 text-sm bg-gray-100 p-1">{t.secHazards}</h3>
                            <div className="flex justify-center mb-2">
                                <PictogramList items={result.hazards.pictograms} size="sm" />
                            </div>
                            <div className="text-xs">
                                <p><strong>Class:</strong> {result.hazards.ghsClass}</p>
                                <p className="mt-1"><strong>Health:</strong> {result.hazards.healthHazards}</p>
                            </div>
                        </div>

                        {/* Col 2 & 3: First Aid & Emergency */}
                        <div className="col-span-2 border border-black p-2 rounded">
                            <h3 className="font-bold border-b border-black mb-2 text-sm bg-gray-100 p-1">{t.secFirstAid}</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <p><strong>{t.inhalation}:</strong> {result.firstAid.inhalation}</p>
                                <p><strong>{t.skin}:</strong> {result.firstAid.skin}</p>
                                <p><strong>{t.eyes}:</strong> {result.firstAid.eyes}</p>
                                <p><strong>{t.ingestion}:</strong> {result.firstAid.ingestion}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                         <div className="border border-black p-2 rounded">
                            <h3 className="font-bold border-b border-black mb-2 text-sm bg-gray-100 p-1">{t.secEmergency}</h3>
                            <div className="text-xs space-y-1">
                                <p><strong>{t.fire}:</strong> {result.emergency.fire}</p>
                                <p><strong>{t.spill}:</strong> {result.emergency.spill}</p>
                            </div>
                         </div>
                         <div className="border border-black p-2 rounded">
                            <h3 className="font-bold border-b border-black mb-2 text-sm bg-gray-100 p-1">{t.secSafety}</h3>
                            <div className="text-xs space-y-1">
                                <p><strong>{t.ppe}:</strong> {result.safetyMeasures.ppe.join(', ')}</p>
                                <p><strong>{t.storage}:</strong> {result.safetyMeasures.storage}</p>
                            </div>
                         </div>
                    </div>
                    
                    {/* Disclaimer at bottom of print */}
                    <div className="text-[10px] text-gray-500 border-t border-gray-300 pt-2 mt-4 text-justify">
                        {t.warningDesc}
                    </div>
                </div>

                {/* Summary Header (Screen View) */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
                  <div className="flex items-center gap-6">
                    <div className="bg-slate-900 p-4 rounded-3xl shrink-0">
                      <ClipboardCheck className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                        {result.identification.chemicalName}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="bg-slate-100 text-slate-600 text-xs font-black px-2 py-0.5 rounded-md border border-slate-200 uppercase">CAS: {result.identification.casNumber}</span>
                        <span className={`${theme.secondary} ${theme.accent} text-xs font-black px-2 py-0.5 rounded-md border ${theme.border} uppercase`}>{result.identification.formula}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 no-print justify-end">
                    <button 
                      onClick={handleSaveResult}
                      disabled={isSaved}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all border font-bold text-sm ${
                        isSaved 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Save className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? t.savedBtn : t.saveBtn}
                    </button>

                    <button 
                      onClick={addToComparison}
                      disabled={isInComparison}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all border font-bold text-sm ${
                        isInComparison 
                        ? `${theme.secondary} ${theme.accent} ${theme.border}` 
                        : `bg-white hover:bg-slate-50 ${theme.accent} border-slate-200`
                      }`}
                    >
                      {isInComparison ? <Scale className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {isInComparison ? t.addedBtn : t.compareBtn}
                    </button>
                    
                    <button 
                      onClick={() => toggleAll(!areAllOpen)}
                      className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-5 py-3 rounded-2xl transition-all border border-slate-200 font-bold text-sm"
                    >
                      {areAllOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      {areAllOpen ? t.collapseAll : t.expandAll}
                    </button>
                    <button 
                      onClick={handlePrint} 
                      className={`flex items-center gap-2 ${theme.primary} ${theme.primaryHover} text-white px-6 py-3 rounded-2xl transition-all shadow-lg ${theme.shadow} font-bold text-sm`}
                    >
                      <Printer className="w-4 h-4" />
                      {t.printBtn}
                    </button>
                  </div>
                </div>

                {/* Accordion List (Hidden when printing) */}
                <div className="space-y-4 print:hidden">
                  {/* News Section */}
                  <ExpandableSection 
                    id="news"
                    isOpen={!!openSections.news}
                    onToggle={() => toggleSection('news')}
                    icon={Newspaper} 
                    title={t.secNews} 
                    color={theme.accent}
                    lang={lang}
                  >
                    <NewsSection query={result.identification.chemicalName} lang={lang} theme={theme} />
                  </ExpandableSection>

                  <ExpandableSection 
                    id="identification"
                    isOpen={!!openSections.identification}
                    onToggle={() => toggleSection('identification')}
                    icon={ClipboardCheck} 
                    title={t.secID} 
                    color="text-blue-600"
                    lang={lang}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                      <InfoItem label={t.chemName} value={result.identification.chemicalName} lang={lang} />
                      <InfoItem label={t.formula} value={result.identification.formula} lang={lang} />
                      <InfoItem label={t.cas} value={result.identification.casNumber} lang={lang} />
                      <InfoItem label={t.synonyms} value={result.identification.synonyms} lang={lang} />
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="hazards"
                    isOpen={!!openSections.hazards}
                    onToggle={() => toggleSection('hazards')}
                    icon={AlertTriangle} 
                    title={t.secHazards} 
                    color="text-red-600"
                    lang={lang}
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InfoItem label={t.ghsClass} value={result.hazards.ghsClass} lang={lang} />
                        {/* New Pictogram Visual Display */}
                        <div className="mb-4 last:mb-0">
                           <span className="text-slate-500 text-xs font-bold block mb-4 uppercase tracking-wider">{t.pictograms}</span>
                           <PictogramList items={result.hazards.pictograms} />
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-4 grid grid-cols-1 gap-4">
                        <InfoItem label={t.phyHazards} value={result.hazards.physicalHazards} lang={lang} />
                        <InfoItem label={t.healthHazards} value={result.hazards.healthHazards} lang={lang} />
                        <InfoItem label={t.envHazards} value={result.hazards.environmentalHazards} lang={lang} />
                      </div>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="exposureLimits"
                    isOpen={!!openSections.exposureLimits}
                    onToggle={() => toggleSection('exposureLimits')}
                    icon={Wind} 
                    title={t.secExposure} 
                    color="text-teal-600"
                    lang={lang}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 font-black block uppercase tracking-tighter mb-1">TLV (Threshold)</span>
                        <p className="text-xl font-black text-slate-800 tracking-tight">{result.exposureLimits.tlv}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 font-black block uppercase tracking-tighter mb-1">PEL (Permissible)</span>
                        <p className="text-xl font-black text-slate-800 tracking-tight">{result.exposureLimits.pel}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                        <span className="text-[10px] text-slate-400 font-black block uppercase tracking-tighter mb-1">STEL (Short Term)</span>
                        <p className="text-xl font-black text-slate-800 tracking-tight">{result.exposureLimits.stel}</p>
                      </div>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="safetyMeasures"
                    isOpen={!!openSections.safetyMeasures}
                    onToggle={() => toggleSection('safetyMeasures')}
                    icon={ShieldAlert} 
                    title={t.secSafety} 
                    color="text-indigo-600"
                    lang={lang}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InfoItem label={t.ppe} value={result.safetyMeasures.ppe} lang={lang} />
                      <InfoItem label={t.engControls} value={result.safetyMeasures.engineeringControls} lang={lang} />
                      <InfoItem label={t.storage} value={result.safetyMeasures.storage} lang={lang} />
                      <InfoItem label={t.segregation} value={result.safetyMeasures.segregation} lang={lang} />
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="reactions"
                    isOpen={!!openSections.reactions}
                    onToggle={() => toggleSection('reactions')}
                    icon={ThermometerSnowflake} 
                    title={t.secReactions} 
                    color="text-orange-600"
                    lang={lang}
                  >
                    <div className="space-y-4">
                      <InfoItem label={t.incompatible} value={result.reactions.incompatibleMaterials} lang={lang} />
                      <InfoItem label={t.dangReact} value={result.reactions.dangerousReactions} lang={lang} />
                      <InfoItem label={t.decomp} value={result.reactions.decompositionProducts} lang={lang} />
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="firstAid"
                    isOpen={!!openSections.firstAid}
                    onToggle={() => toggleSection('firstAid')}
                    icon={Droplets} 
                    title={t.secFirstAid} 
                    color="text-rose-600"
                    lang={lang}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-rose-50/30 p-5 rounded-2xl border border-rose-100">
                        <h4 className="font-bold text-rose-900 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                          {t.contactExp}
                        </h4>
                        <div className="space-y-4">
                          <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-rose-700">{t.skin}:</strong> {result.firstAid.skin}</p>
                          <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-rose-700">{t.eyes}:</strong> {result.firstAid.eyes}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                          {t.respExp}
                        </h4>
                        <div className="space-y-4">
                          <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-slate-900">{t.inhalation}:</strong> {result.firstAid.inhalation}</p>
                          <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-slate-900">{t.ingestion}:</strong> {result.firstAid.ingestion}</p>
                        </div>
                      </div>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="emergency"
                    isOpen={!!openSections.emergency}
                    onToggle={() => toggleSection('emergency')}
                    icon={ShieldAlert} 
                    title={t.secEmergency} 
                    color="text-slate-700"
                    lang={lang}
                  >
                    <div className="space-y-4">
                      <InfoItem label={t.spill} value={result.emergency.spill} lang={lang} />
                      <InfoItem label={t.fire} value={result.emergency.fire} lang={lang} />
                      <InfoItem label={t.disposal} value={result.emergency.disposal} lang={lang} />
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="transport"
                    isOpen={!!openSections.transport}
                    onToggle={() => toggleSection('transport')}
                    icon={Truck} 
                    title={t.secTransport} 
                    color="text-slate-600"
                    lang={lang}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <InfoItem label={t.unNum} value={result.transport.unNumber} lang={lang} />
                      <InfoItem label={t.transClass} value={result.transport.class} lang={lang} />
                      <InfoItem label={t.packGroup} value={result.transport.packingGroup} lang={lang} />
                    </div>
                  </ExpandableSection>

                  {/* References Section */}
                  {result.references && result.references.length > 0 && (
                    <div className="mb-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mt-4">
                      <div className="flex items-center gap-2 mb-3 text-slate-400">
                        <BookOpen className="w-4 h-4" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">{t.secReferences}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.references.map((ref, i) => (
                          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 font-medium">
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* MSDS Warning (Moved to Bottom, visible on screen) */}
                <div className="bg-amber-50 border-r-4 border-amber-500 p-5 rounded-2xl mb-8 flex gap-4 shadow-sm print:hidden">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-900 font-bold text-base mb-1">{t.warningTitle}</p>
                    <p className="text-amber-800 text-sm leading-relaxed">{t.warningDesc}</p>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Comparison Bar */}
      {comparisonList.length > 0 && !isComparisonMode && !isInteractionMode && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-lg px-4 z-40 animate-in slide-in-from-bottom-10 fade-in no-print">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl shadow-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${theme.primary} p-2 rounded-lg`}>
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">{comparisonList.length} {t.itemsSelected}</div>
                <div className="text-xs text-slate-400">{t.readyToCompare}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setComparisonList([])}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title={t.clearList}
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsComparisonMode(true)}
                className={`${theme.primary} ${theme.primaryHover} text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors`}
              >
                {t.viewCompareBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      <ChatWidget lang={lang} theme={theme} />

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-12 text-center text-slate-400 no-print">
        <div className="max-w-xl mx-auto px-4">
          <p className="text-sm font-medium mb-2">HazmatAI v{APP_VERSION}</p>
          <p className="text-xs leading-relaxed">
            {t.appDesc}
            <br />
            Powered by Gemini 3 Pro
          </p>
        </div>
      </footer>
    </div>
  );
}
