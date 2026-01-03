import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Loader2, 
  ShieldAlert, 
  ClipboardCheck, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Save, 
  Bookmark, 
  Settings, 
  Download, 
  Upload, 
  Database,
  Trash2,
  Calculator,
  ArrowRightLeft,
  Flame,
  FlaskConical,
  Gauge,
  Info,
  Truck,
  Wind,
  Droplets,
  ThermometerSnowflake,
  LifeBuoy
} from 'lucide-react';
import { analyzeChemical } from './services/geminiService';
import { ChemicalAnalysis, LoadingState, Language, ThemeConfig } from './types';

const APP_VERSION = "2.9.0";

const TRANSLATIONS = {
  fa: {
    appTitle: 'HazmatAI',
    appDesc: 'سامانه هوشمند ایمنی صنعتی',
    searchPlaceholder: 'نام ماده (سولفوریک اسید) یا فرمول (H2SO4)...',
    searchBtn: 'تحلیل آنی',
    idleTitle: 'آماده برای بازرسی هوشمند',
    idleDesc: 'بانک اطلاعاتی HazmatAI شامل هزاران ماده شیمیایی و دستورالعمل‌های ایمنی GHS است.',
    loadingTitle: 'در حال استخراج آنی داده‌ها...',
    loadingDesc: 'هوش مصنوعی Hazmat در حال تدوین گزارش ایمنی است (معمولاً کمتر از ۵ ثانیه)',
    errorTitle: 'پردازش متوقف شد',
    saveBtn: 'ذخیره',
    savedBtn: 'ذخیره شده',
    printBtn: 'چاپ گزارش',
    warningTitle: 'هشدار ایمنی الزامی',
    warningDesc: 'گزارش حاضر صرفاً جنبه راهنمایی عمومی داشته و بر اساس هوش مصنوعی گردآوری شده است. همیشه به MSDS رسمی مراجعه کنید.',
    secID: 'شناسایی و مشخصات کلی',
    secHazards: 'خطرات و طبقه‌بندی GHS',
    secExposure: 'حدود مجاز مواجهه شغلی',
    secSafety: 'اقدامات پیشگیرانه و کنترلی',
    secReactions: 'پایداری و واکنش‌پذیری',
    secFirstAid: 'کمک‌های اولیه',
    secEmergency: 'مدیریت شرایط اضطراری',
    secTransport: 'اطلاعات حمل و نقل',
    secReferences: 'مراجع و استانداردها',
    chemName: 'نام کامل شیمیایی',
    formula: 'فرمول مولکولی',
    cas: 'شماره CAS',
    synonyms: 'مترادف‌ها',
    ghsClass: 'کلاس خطر',
    phyHazards: 'خطرات فیزیکی',
    healthHazards: 'خطرات سلامتی',
    envHazards: 'خطرات زیست‌محیطی',
    ppe: 'تجهیزات حفاظت فردی',
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
    savedItems: 'مواد شیمیایی من',
    emptySaved: 'لیست مواد شما خالی است',
    settings: 'تنظیمات',
    language: 'زبان',
    close: 'بستن',
    dataManagement: 'مدیریت داده‌ها',
    backup: 'پشتیبان‌گیری (Export)',
    restore: 'بازیابی (Import)',
    importError: 'فایل نامعتبر است یا فرمت درستی ندارد.',
    importSuccess: 'داده‌ها با موفقیت بازیابی و ادغام شدند.',
    unitConverter: 'مبدل واحدها',
    temp: 'دما',
    pressure: 'فشار',
    conc: 'غلظت'
  },
  en: {
    appTitle: 'HazmatAI',
    appDesc: 'Industrial Safety Intelligence',
    searchPlaceholder: 'Chemical name or formula...',
    searchBtn: 'Instant Analyze',
    idleTitle: 'Ready for Intelligent Inspection',
    idleDesc: 'HazmatAI database includes thousands of chemicals and GHS safety guidelines.',
    loadingTitle: 'Extracting Instant Data...',
    loadingDesc: 'Hazmat AI is compiling report (usually under 5s)',
    errorTitle: 'Processing Stopped',
    saveBtn: 'Save',
    savedBtn: 'Saved',
    printBtn: 'Print Report',
    warningTitle: 'Mandatory Safety Warning',
    warningDesc: 'AI guidance only. Refer to official SDS.',
    secID: 'Identification',
    secHazards: 'Hazards & GHS',
    secExposure: 'Exposure Limits',
    secSafety: 'Safety Measures',
    secReactions: 'Stability & Reactivity',
    secFirstAid: 'First Aid',
    secEmergency: 'Emergency',
    secTransport: 'Transport',
    secReferences: 'References',
    chemName: 'Chemical Name',
    formula: 'Molecular Formula',
    cas: 'CAS Number',
    synonyms: 'Synonyms',
    ghsClass: 'GHS Class',
    phyHazards: 'Physical Hazards',
    healthHazards: 'Health Hazards',
    envHazards: 'Environmental Hazards',
    ppe: 'PPE',
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
    savedItems: 'My Chemicals',
    emptySaved: 'Your chemical list is empty',
    settings: 'Settings',
    language: 'Language',
    close: 'Close',
    dataManagement: 'Data Management',
    backup: 'Export Backup',
    restore: 'Import Backup',
    importError: 'Invalid file format.',
    importSuccess: 'Data merged successfully.',
    unitConverter: 'Unit Converter',
    temp: 'Temperature',
    pressure: 'Pressure',
    conc: 'Concentration'
  }
};

const THEMES: Record<string, ThemeConfig> = {
  industrial: {
    id: 'industrial',
    name: 'Industrial',
    primary: 'bg-red-600',
    primaryHover: 'hover:bg-red-700',
    secondary: 'bg-slate-50',
    accent: 'text-red-600',
    border: 'border-red-200',
    lightText: 'text-red-100',
    ring: 'focus:ring-red-500/20',
    shadow: 'shadow-red-600/20',
    gradient: 'from-slate-900 to-slate-800'
  }
};

// High-Fidelity GHS Pictograms (Standard Diamond Red Border)
const GHS_SYMBOLS: Record<string, React.ReactElement> = {
  explosive: (
    <g transform="translate(4,4) scale(0.66)">
      <circle cx="12" cy="12" r="3" fill="black" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9l-2.1 2.1M4.9 19.1l2.1-2.1" stroke="black" strokeWidth="2" />
      <path d="M8 8l-3-3M16 16l3 3M16 8l3-3M8 16l-3 3" stroke="black" strokeWidth="1" opacity="0.6" />
    </g>
  ),
  flammable: (
    <g transform="translate(4,4) scale(0.66)">
      <path fill="black" d="M12 22s5-4.5 5-9c0-2.8-2.2-5-5-5s-5 2.2-5 5c0 4.5 5 9 5 9z" />
      <path fill="white" d="M12 18s2.5-2.2 2.5-4.5c0-1.4-1.1-2.5-2.5-2.5s-2.5 1.1-2.5 2.5c0 2.3 2.5 4.5 2.5 4.5z" />
    </g>
  ),
  oxidizing: (
    <g transform="translate(4,4) scale(0.66)">
      <circle cx="12" cy="15" r="5" stroke="black" strokeWidth="2.5" fill="none" />
      <path d="M12 10V4M9 6l3-3 3 3" stroke="black" strokeWidth="2" fill="none" />
    </g>
  ),
  corrosive: (
    <g transform="translate(4,4) scale(0.66)">
      <path d="M3 8h6v3H3zM15 8h6v3h-6z" fill="black" />
      <path d="M6 11v5M18 11v5" stroke="black" strokeWidth="2" />
      <path d="M2 20h20" stroke="black" strokeWidth="3" />
      <circle cx="6" cy="13" r="1" fill="black" />
      <circle cx="18" cy="13" r="1" fill="black" />
    </g>
  ),
  toxic: (
    <g transform="translate(4,4) scale(0.66)">
      <path d="M12 4c-3.3 0-6 2.7-6 6 0 2 1.5 4 3.5 5v1h5v-1c2-1 3.5-3 3.5-5 0-3.3-2.7-6-6-6z" fill="black" />
      <path d="M9 18l6 2M9 20l6-2" stroke="white" strokeWidth="1.5" />
      <circle cx="10" cy="9" r="1" fill="white" />
      <circle cx="14" cy="9" r="1" fill="white" />
    </g>
  ),
  irritant: (
    <g transform="translate(4,4) scale(0.66)">
      <rect x="10.5" y="4" width="3" height="10" rx="1.5" fill="black" />
      <circle cx="12" cy="18" r="2" fill="black" />
    </g>
  ),
  health: (
    <g transform="translate(4,4) scale(0.66)">
      <path d="M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" fill="black" />
      <path d="M5 21v-1a7 7 0 0 1 14 0v1" fill="black" />
      <path d="M12 11l2 2-2 2-2-2z" fill="white" />
    </g>
  ),
  environment: (
    <g transform="translate(4,4) scale(0.66)">
      <path d="M2 19h20M14 19V9l3-3M6 19v-6l-2-2" stroke="black" strokeWidth="2" />
      <circle cx="18" cy="13" r="1.5" fill="black" />
    </g>
  ),
  pressure: (
    <g transform="translate(4,4) scale(0.66)">
      <rect x="8" y="4" width="8" height="16" rx="4" stroke="black" strokeWidth="2.5" fill="none" />
      <path d="M12 4v16M8 12h8" stroke="black" strokeWidth="1" opacity="0.3" />
    </g>
  )
};

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

const PictogramList: React.FC<{ items: string[], size?: 'sm' | 'lg' }> = ({ items, size = 'lg' }) => {
  const getIconType = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('explo')) return 'explosive';
    if (n.includes('oxidi')) return 'oxidizing';
    if (n.includes('flam')) return 'flammable';
    if (n.includes('corr')) return 'corrosive';
    if (n.includes('tox') || n.includes('skull')) return 'toxic';
    if (n.includes('irrit') || n.includes('acute') || n.includes('exclamation')) return 'irritant';
    if (n.includes('health') || n.includes('carc') || n.includes('target organ')) return 'health';
    if (n.includes('envir') || n.includes('aqua')) return 'environment';
    if (n.includes('press') || n.includes('gas cylinder')) return 'pressure';
    return 'irritant'; 
  };

  const uniqueItems = Array.from(new Set(items));

  return (
    <div className={`flex flex-wrap ${size === 'lg' ? 'gap-10 sm:gap-14' : 'gap-4 justify-center'}`}>
      {uniqueItems.map((item, idx) => {
        const type = getIconType(item);
        const icon = GHS_SYMBOLS[type];
        
        return (
          <div key={idx} className="flex flex-col items-center group relative" title={item}>
            {/* Standard GHS Diamond: Red border, White Background, 45deg rotate */}
            <div className={`relative flex items-center justify-center bg-white border-red-600 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl ${size === 'lg' ? 'w-24 h-24 border-[6px] sm:w-32 sm:h-32 sm:border-[8px] rounded-2xl' : 'w-12 h-12 border-[4px] rounded-lg'} rotate-45 mb-8 mt-4`}>
              {/* Internal Icon: Counter-rotated */}
              <div className="-rotate-45 flex items-center justify-center text-black">
                 <svg viewBox="0 0 24 24" className={`${size === 'lg' ? 'w-20 h-20 sm:w-28 sm:h-28' : 'w-10 h-10'}`}>
                    {icon}
                 </svg>
              </div>
            </div>
            {size === 'lg' && (
              <span className="text-[10px] sm:text-xs font-black text-slate-700 text-center max-w-[120px] uppercase tracking-tighter opacity-90 group-hover:opacity-100 transition-opacity whitespace-pre-wrap leading-tight">{item}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Fix: Use standard function signature for ExpandableSection to resolve potential unknown type inference issues
interface ExpandableSectionProps {
  icon: React.ElementType;
  title: string;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  lang: Language;
}

const ExpandableSection = ({ 
  icon: Icon, 
  title, 
  color, 
  isOpen, 
  onToggle, 
  children, 
  lang 
}: ExpandableSectionProps) => {
  return (
    <div className="mb-4 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 focus:outline-none no-print"
      >
        <div className="flex items-center gap-5">
          <div className={`p-3 rounded-2xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
            <Icon className="w-7 h-7" />
          </div>
          {/* Use String() to ensure title is explicitly treated as a string and avoid unknown errors */}
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800">{String(title)}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
      </button>

      <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'} print:max-h-none print:opacity-100 overflow-hidden`}>
        <div className="p-8 pt-2 border-t border-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
};

const UnitConverterModal: React.FC<{ isOpen: boolean, onClose: () => void, lang: Language }> = ({ isOpen, onClose, lang }) => {
  const t = TRANSLATIONS[lang];
  const [val, setVal] = useState('1');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800"><Calculator className="w-7 h-7" />{t.unitConverter}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-8 space-y-6">
           <div className="space-y-2">
             <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.temp}</label>
             <div className="grid grid-cols-2 gap-4">
                <input type="number" value={val} onChange={e => setVal(e.target.value)} className="p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 ring-red-500/20" placeholder="Celsius" />
                <div className="p-4 bg-slate-100 border rounded-2xl font-bold flex items-center justify-center">{(parseFloat(val) * 1.8 + 32).toFixed(1)} °F</div>
             </div>
           </div>
           <div className="space-y-2">
             <label className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.pressure}</label>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-100 border rounded-2xl font-bold flex items-center justify-center">{(parseFloat(val) * 1.01325).toFixed(3)} bar</div>
                <div className="p-4 bg-slate-100 border rounded-2xl font-bold flex items-center justify-center">{(parseFloat(val) * 14.696).toFixed(2)} psi</div>
             </div>
           </div>
        </div>
        <div className="p-6 bg-slate-50 border-t"><button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg">{t.close}</button></div>
      </div>
    </div>
  );
};

export default function App() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<ChemicalAnalysis | null>(null);
  const [lang, setLang] = useState<Language>('fa');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<ChemicalAnalysis[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  
  const t = TRANSLATIONS[lang];
  const theme = THEMES['industrial'];
  const settingsFileInputRef = useRef<HTMLInputElement>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identification: true,
    hazards: true,
    exposure: false,
    safety: false,
    reactions: false,
    firstAid: false,
    emergency: false,
    transport: false,
    references: false
  });

  useEffect(() => {
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    const saved = localStorage.getItem('hazmat_saved_items');
    if (saved) setSavedItems(JSON.parse(saved));
  }, [lang]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setStatus(LoadingState.LOADING);
    try {
      const data = await analyzeChemical(query, lang);
      setResult(data);
      setStatus(LoadingState.SUCCESS);
      setOpenSections({ identification: true, hazards: true, exposure: true });
    } catch (err) {
      setStatus(LoadingState.ERROR);
    }
  };

  const handleSaveResult = () => {
    if (!result) return;
    const exists = savedItems.some(i => i.identification.casNumber === result.identification.casNumber);
    if (exists) return;
    const next = [result, ...savedItems];
    setSavedItems(next);
    localStorage.setItem('hazmat_saved_items', JSON.stringify(next));
  };

  return (
    <div className="min-h-screen pb-40 bg-slate-50/50" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      <UnitConverterModal isOpen={isConverterOpen} onClose={() => setIsConverterOpen(false)} lang={lang} />
      
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800"><Settings className="w-7 h-7" />{t.settings}</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.language}</p>
                <div className="flex gap-2">
                  <button onClick={() => setLang('fa')} className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${lang === 'fa' ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-100'}`}>فارسی</button>
                  <button onClick={() => setLang('en')} className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${lang === 'en' ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-100'}`}>English</button>
                </div>
              </div>
              <div className="space-y-4">
                 <p className="text-xs font-black uppercase text-slate-400 tracking-widest">{t.dataManagement}</p>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => {
                      const dataStr = JSON.stringify(savedItems);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const link = document.createElement('a');
                      link.href = dataUri;
                      link.download = `hazmatai-backup.json`;
                      link.click();
                    }} className="flex flex-col items-center justify-center p-5 bg-emerald-50 border-2 border-emerald-100 text-emerald-700 rounded-3xl hover:bg-emerald-100 transition-all gap-2 group">
                      <Download className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-sm">{t.backup}</span>
                    </button>
                    <input type="file" ref={settingsFileInputRef} className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        try {
                          // Fix: Use reader.result instead of ev.target?.result to ensure correct typing and avoid unknown issues
                          const resultStr = reader.result;
                          if (typeof resultStr !== 'string') return;
                          const data = JSON.parse(resultStr);
                          setSavedItems(data);
                          localStorage.setItem('hazmat_saved_items', JSON.stringify(data));
                          alert(t.importSuccess);
                        } catch (err) { alert(t.importError); }
                      };
                      reader.readAsText(file);
                    }} />
                    <button onClick={() => settingsFileInputRef.current?.click()} className="flex flex-col items-center justify-center p-5 bg-blue-50 border-2 border-blue-100 text-blue-700 rounded-3xl hover:bg-blue-100 transition-all gap-2 group">
                      <Upload className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-sm">{t.restore}</span>
                    </button>
                 </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t"><button onClick={() => setIsSettingsOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg">{t.close}</button></div>
          </div>
        </div>
      )}

      {isSavedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-2xl flex items-center gap-3 text-slate-800"><Bookmark className="w-7 h-7 text-red-600" />{t.savedItems}</h3>
              <button onClick={() => setIsSavedModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="overflow-y-auto p-8 space-y-4">
              {savedItems.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <Database size={80} className="mx-auto mb-4"/>
                  <p className="text-xl font-bold">{t.emptySaved}</p>
                </div>
              ) : (
                savedItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 p-6 rounded-[1.75rem] border border-slate-100 flex justify-between items-center cursor-pointer hover:bg-white hover:border-red-200 transition-all shadow-sm hover:shadow-md" onClick={() => { setResult(item); setStatus(LoadingState.SUCCESS); setIsSavedModalOpen(false); }}>
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{item.identification.chemicalName}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider">{item.identification.casNumber} | {item.identification.formula}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={(e) => { e.stopPropagation(); const n = savedItems.filter((_, i) => i !== idx); setSavedItems(n); localStorage.setItem('hazmat_saved_items', JSON.stringify(n)); }} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={22}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <header className={`bg-gradient-to-l ${theme.gradient} text-white shadow-2xl sticky top-0 z-40 no-print`}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => { setStatus(LoadingState.IDLE); setResult(null); setQuery(''); }}>
            <div className={`${theme.primary} p-3.5 rounded-2xl shadow-xl group-hover:scale-105 transition-transform`}><ShieldAlert className="w-8 h-8" /></div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{t.appTitle}</h1>
              <p className="text-[11px] uppercase font-black opacity-60 tracking-[0.2em]">{t.appDesc}</p>
            </div>
          </div>
          <div className="flex-1 w-full flex gap-4">
            <button onClick={() => setIsConverterOpen(true)} className="bg-white/10 p-4 rounded-[1.5rem] hover:bg-white/20 border border-white/5 transition-colors"><Calculator className="w-6 h-6" /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="bg-white/10 p-4 rounded-[1.5rem] hover:bg-white/20 border border-white/5 transition-colors"><Settings className="w-6 h-6" /></button>
            <button onClick={() => setIsSavedModalOpen(true)} className="bg-white/10 p-4 rounded-[1.5rem] hover:bg-white/20 border border-white/5 relative transition-colors">
              <Bookmark className="w-6 h-6" />
              {savedItems.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-slate-900 shadow-lg">{savedItems.length}</span>}
            </button>
            <div className="relative flex-1 group">
              <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                placeholder={t.searchPlaceholder} 
                className="w-full bg-white/10 border border-white/10 text-white px-8 py-4.5 rounded-[1.75rem] focus:bg-white/15 outline-none text-xl placeholder:text-white/40 shadow-inner ring-offset-slate-900 focus:ring-4 focus:ring-white/10 transition-all" 
              />
              <button 
                onClick={handleSearch} 
                disabled={status === LoadingState.LOADING}
                className={`absolute ${lang === 'fa' ? 'left-2' : 'right-2'} top-2 bottom-2 ${theme.primary} px-8 rounded-2xl font-black flex items-center gap-3 shadow-lg hover:brightness-110 transition-all disabled:opacity-50`}
              >
                {status === LoadingState.LOADING ? <Loader2 className="animate-spin w-5 h-5"/> : <Search className="w-5 h-5" />}
                <span className="hidden sm:inline">{t.searchBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-16">
        {status === LoadingState.IDLE && (
          <div className="py-40 text-center animate-in fade-in duration-700">
            <div className="bg-slate-100 w-32 h-32 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
               <ClipboardCheck size={64} className="text-slate-300"/>
            </div>
            <h2 className="text-3xl font-black text-slate-400 mb-3">{t.idleTitle}</h2>
            <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">{t.idleDesc}</p>
          </div>
        )}

        {status === LoadingState.LOADING && (
          <div className="py-40 text-center animate-in zoom-in-95 duration-300">
            <div className="relative inline-block mb-10">
               <div className={`absolute inset-0 ${theme.primary} rounded-full blur-3xl opacity-20 animate-pulse`}></div>
               <Loader2 size={80} className={`mx-auto animate-spin ${theme.accent} relative`}/>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.loadingTitle}</h2>
            <p className="text-slate-500 font-bold mt-3 animate-pulse">{t.loadingDesc}</p>
          </div>
        )}

        {result && status === LoadingState.SUCCESS && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 mb-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-right">
                 <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">{result.identification.chemicalName}</h2>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                    <span className="bg-slate-900 text-white text-[11px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-slate-900/10">CAS: {result.identification.casNumber}</span>
                    <span className="bg-red-50 text-red-600 border border-red-100 text-[11px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-red-600/5">{result.identification.formula}</span>
                 </div>
              </div>
              <div className="flex gap-4 no-print shrink-0">
                <button onClick={handleSaveResult} className={`px-8 py-4 rounded-[1.5rem] border-2 font-black text-sm transition-all shadow-lg flex items-center gap-3 ${savedItems.some(i => i.identification.casNumber === result.identification.casNumber) ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-600/5' : 'bg-white hover:bg-slate-50 border-slate-100 shadow-slate-900/5'}`}>
                   <Save className="w-5 h-5" />
                   {savedItems.some(i => i.identification.casNumber === result.identification.casNumber) ? t.savedBtn : t.saveBtn}
                </button>
                <button onClick={() => window.print()} className={`${theme.primary} text-white px-8 py-4 rounded-[1.5rem] font-black text-sm shadow-xl shadow-red-600/30 hover:shadow-red-600/40 hover:brightness-110 active:scale-95 transition-all flex items-center gap-3`}><Printer className="w-5 h-5"/>{t.printBtn}</button>
              </div>
            </div>

            <div className="space-y-6">
              <ExpandableSection isOpen={openSections.identification} onToggle={() => setOpenSections({...openSections, identification: !openSections.identification})} icon={ClipboardCheck} title={t.secID} color="text-blue-600" lang={lang}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <InfoItem label={t.chemName} value={result.identification.chemicalName} lang={lang} />
                  <InfoItem label={t.formula} value={result.identification.formula} lang={lang} />
                  <InfoItem label={t.cas} value={result.identification.casNumber} lang={lang} />
                  <InfoItem label={t.synonyms} value={result.identification.synonyms} lang={lang} />
                </div>
              </ExpandableSection>

              <ExpandableSection isOpen={openSections.hazards} onToggle={() => setOpenSections({...openSections, hazards: !openSections.hazards})} icon={AlertTriangle} title={t.secHazards} color="text-red-600" lang={lang}>
                <div className="space-y-12 py-6">
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                    <PictogramList items={result.hazards.pictograms} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label={t.ghsClass} value={result.hazards.ghsClass} lang={lang} />
                    <InfoItem label={t.phyHazards} value={result.hazards.physicalHazards} lang={lang} />
                    <InfoItem label={t.healthHazards} value={result.hazards.healthHazards} lang={lang} />
                    <InfoItem label={t.envHazards} value={result.hazards.environmentalHazards} lang={lang} />
                  </div>
                </div>
              </ExpandableSection>

              <ExpandableSection isOpen={openSections.exposure} onToggle={() => setOpenSections({...openSections, exposure: !openSections.exposure})} icon={Wind} title={t.secExposure} color="text-purple-600" lang={lang}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <InfoItem label="TLV (ACGIH)" value={result.exposureLimits.tlv} lang={lang} />
                   <InfoItem label="PEL (OSHA)" value={result.exposureLimits.pel} lang={lang} />
                   <InfoItem label="STEL" value={result.exposureLimits.stel} lang={lang} />
                </div>
              </ExpandableSection>

              <ExpandableSection isOpen={openSections.safety} onToggle={() => setOpenSections({...openSections, safety: !openSections.safety})} icon={ShieldAlert} title={t.secSafety} color="text-emerald-600" lang={lang}>
                <div className="space-y-6">
                  <InfoItem label={t.ppe} value={result.safetyMeasures.ppe} lang={lang} />
                  <InfoItem label={t.engControls} value={result.safetyMeasures.engineeringControls} lang={lang} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoItem label={t.storage} value={result.safetyMeasures.storage} lang={lang} />
                    <InfoItem label={t.segregation} value={result.safetyMeasures.segregation} lang={lang} />
                  </div>
                </div>
              </ExpandableSection>

              <ExpandableSection isOpen={openSections.reactions} onToggle={() => setOpenSections({...openSections, reactions: !openSections.reactions})} icon={FlaskConical} title={t.secReactions} color="text-orange-600" lang={lang}>
                <div className="space-y-6">
                  <InfoItem label={t.incompatible} value={result.reactions.incompatibleMaterials} lang={lang} />
                  <InfoItem label={t.dangReact} value={result.reactions.dangerousReactions} lang={lang} />
                  <InfoItem label={t.decomp} value={result.reactions.decompositionProducts} lang={lang} />
                </div>
              </ExpandableSection>

              <ExpandableSection isOpen={openSections.firstAid} onToggle={() => setOpenSections({...openSections, firstAid: !openSections.firstAid})} icon={LifeBuoy} title={t.secFirstAid} color="text-rose-600" lang={lang}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem label={t.skin} value={result.firstAid.skin} lang={lang} />
                  <InfoItem label={t.eyes} value={result.firstAid.eyes} lang={lang} />
                  <InfoItem label={t.inhalation} value={result.firstAid.inhalation} lang={lang} />
                  <InfoItem label={t.ingestion} value={result.firstAid.ingestion} lang={lang} />
                </div>
              </ExpandableSection>

              <ExpandableSection isOpen={openSections.emergency} onToggle={() => setOpenSections({...openSections, emergency: !openSections.emergency})} icon={Flame} title={t.secEmergency} color="text-red-700" lang={lang}>
                <div className="space-y-6">
                  <InfoItem label={t.spill} value={result.emergency.spill} lang={lang} />
                  <InfoItem label={t.fire} value={result.emergency.fire} lang={lang} />
                  <InfoItem label={t.disposal} value={result.emergency.disposal} lang={lang} />
                </div>
              </ExpandableSection>

              <ExpandableSection isOpen={openSections.transport} onToggle={() => setOpenSections({...openSections, transport: !openSections.transport})} icon={Truck} title={t.secTransport} color="text-slate-700" lang={lang}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoItem label={t.unNum} value={result.transport.unNumber} lang={lang} />
                  <InfoItem label={t.transClass} value={result.transport.class} lang={lang} />
                  <InfoItem label={t.packGroup} value={result.transport.packingGroup} lang={lang} />
                </div>
              </ExpandableSection>

              <ExpandableSection isOpen={openSections.references} onToggle={() => setOpenSections({...openSections, references: !openSections.references})} icon={Info} title={t.secReferences} color="text-cyan-600" lang={lang}>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   {result.references.map((ref, i) => (
                     <div key={i} className="flex items-center gap-3 mb-2 last:mb-0 text-slate-600 font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        {ref}
                     </div>
                   ))}
                </div>
              </ExpandableSection>
            </div>

            <div className="bg-amber-50 border-r-8 border-amber-500 p-8 rounded-[2.5rem] mt-16 flex gap-6 no-print shadow-lg shadow-amber-900/5">
              <div className="bg-amber-500 p-3 rounded-2xl shrink-0 h-fit shadow-lg shadow-amber-500/20">
                 <AlertTriangle className="text-white w-8 h-8"/>
              </div>
              <div className="text-sm">
                 <p className="text-xl font-black text-amber-900 mb-2">{t.warningTitle}</p>
                 <p className="text-amber-800 leading-relaxed font-medium">{t.warningDesc}</p>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="mt-40 py-20 text-center border-t border-slate-200">
         <div className="flex items-center justify-center gap-4 mb-4 grayscale opacity-40">
            <ShieldAlert className="w-8 h-8" />
            <h3 className="text-2xl font-black tracking-tighter">HazmatAI</h3>
         </div>
         <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">v{APP_VERSION} | Safety Intelligence System</p>
         <p className="text-slate-300 text-[10px] mt-2 font-mono">POWERED BY GEMINI 3 FLASH</p>
      </footer>
    </div>
  );
}
