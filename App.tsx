
import React, { useState, useCallback, useMemo } from 'react';
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
  X
} from 'lucide-react';
import { analyzeChemical } from './services/geminiService';
import { ChemicalAnalysis, LoadingState } from './types';

// --- Helper Components ---

const InfoItem: React.FC<{ label: string, value: string | string[] }> = ({ label, value }) => (
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
        {value || 'اطلاعات موجود نیست'}
      </span>
    )}
  </div>
);

const ExpandableSection: React.FC<{ 
  icon: React.ElementType, 
  title: string, 
  color: string, 
  isOpen: boolean, 
  onToggle: () => void,
  children: React.ReactNode 
}> = ({ icon: Icon, title, color, isOpen, onToggle, children }) => {
  return (
    <div className="mb-4 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-right focus:outline-none no-print"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${color.replace('text-', 'bg-').replace('600', '50')} ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {/* Static header for printing only */}
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

const ComparisonTable: React.FC<{
  items: ChemicalAnalysis[];
  onRemove: (index: number) => void;
  onBack: () => void;
}> = ({ items, onRemove, onBack }) => {
  if (items.length === 0) return null;

  const renderRow = (label: string, accessor: (item: ChemicalAnalysis) => string | string[]) => (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="p-4 bg-slate-50 font-bold text-slate-600 text-sm align-top min-w-[150px] sticky right-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{label}</td>
      {items.map((item, idx) => {
        const value = accessor(item);
        return (
          <td key={`${item.identification.casNumber}-${idx}`} className="p-4 text-slate-800 text-sm align-top min-w-[250px]">
            {Array.isArray(value) ? (
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
            <Scale className="text-indigo-600" /> 
            مقایسه مواد ({items.length})
        </h2>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          بازگشت به جستجو
        </button>
      </div>
      
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider sticky right-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">ویژگی‌ها</th>
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
                      title="حذف از لیست"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderSectionHeader("شناسایی", ClipboardCheck, "bg-blue-50")}
            {renderRow("فرمول", i => i.identification.formula)}
            {renderRow("مترادف‌ها", i => i.identification.synonyms)}

            {renderSectionHeader("خطرات GHS", AlertTriangle, "bg-red-50")}
            {renderRow("کلاس خطر", i => i.hazards.ghsClass)}
            {renderRow("پیکتوگرام‌ها", i => i.hazards.pictograms)}
            {renderRow("خطرات فیزیکی", i => i.hazards.physicalHazards)}
            {renderRow("خطرات سلامتی", i => i.hazards.healthHazards)}

            {renderSectionHeader("حدود مواجهه", Wind, "bg-teal-50")}
            {renderRow("TLV", i => i.exposureLimits.tlv)}
            {renderRow("PEL", i => i.exposureLimits.pel)}
            {renderRow("STEL", i => i.exposureLimits.stel)}

            {renderSectionHeader("ایمنی و حفاظت", ShieldAlert, "bg-indigo-50")}
            {renderRow("PPE", i => i.safetyMeasures.ppe)}
            {renderRow("کنترل مهندسی", i => i.safetyMeasures.engineeringControls)}
            {renderRow("انبارداری", i => i.safetyMeasures.storage)}
            {renderRow("جداسازی", i => i.safetyMeasures.segregation)}

            {renderSectionHeader("واکنش‌پذیری", ThermometerSnowflake, "bg-orange-50")}
            {renderRow("ناسازگاری", i => i.reactions.incompatibleMaterials)}
            {renderRow("واکنش‌های خطرناک", i => i.reactions.dangerousReactions)}

            {renderSectionHeader("کمک‌های اولیه", Droplets, "bg-rose-50")}
            {renderRow("پوست", i => i.firstAid.skin)}
            {renderRow("چشم", i => i.firstAid.eyes)}
            {renderRow("استنشاق", i => i.firstAid.inhalation)}
            {renderRow("بلع", i => i.firstAid.ingestion)}

            {renderSectionHeader("مدیریت اضطراری", ShieldAlert, "bg-slate-50")}
            {renderRow("نشت و ریزش", i => i.emergency.spill)}
            {renderRow("اطفای حریق", i => i.emergency.fire)}

            {renderSectionHeader("حمل و نقل", Truck, "bg-gray-50")}
            {renderRow("شماره UN", i => i.transport.unNumber)}
            {renderRow("کلاس", i => i.transport.class)}
            {renderRow("بسته‌بندی", i => i.transport.packingGroup)}
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
  
  // Comparison State
  const [comparisonList, setComparisonList] = useState<ChemicalAnalysis[]>([]);
  const [isComparisonMode, setIsComparisonMode] = useState(false);

  // Track open sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identification: true,
    hazards: true,
    exposureLimits: false,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (open: boolean) => {
    const keys = [
      'identification', 'hazards', 'exposureLimits', 'reactions', 
      'safetyMeasures', 'firstAid', 'emergency', 'transport'
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
    setIsComparisonMode(false); // Switch back to search view when searching
    try {
      const data = await analyzeChemical(query);
      setResult(data);
      setStatus(LoadingState.SUCCESS);
      
      // Auto open critical sections, but keep 'exposureLimits' closed as requested
      setOpenSections({
        identification: true,
        hazards: true,
        exposureLimits: false,
        reactions: false,
        safetyMeasures: false,
        firstAid: false,
        emergency: false,
        transport: false
      });
    } catch (err: any) {
      setError(err.message || "خطایی در برقراری ارتباط با سرور رخ داد");
      setStatus(LoadingState.ERROR);
    }
  }, [query]);

  const addToComparison = () => {
    if (!result) return;
    // Simple deduplication check based on CAS or Name
    const exists = comparisonList.some(
      item => item.identification.casNumber === result.identification.casNumber || 
              item.identification.chemicalName === result.identification.chemicalName
    );
    
    if (!exists) {
      setComparisonList(prev => [...prev, result]);
    }
  };

  const removeFromComparison = (index: number) => {
    setComparisonList(prev => prev.filter((_, i) => i !== index));
    if (comparisonList.length <= 1) {
      setIsComparisonMode(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isInComparison = result && comparisonList.some(
    item => item.identification.casNumber === result.identification.casNumber ||
            item.identification.chemicalName === result.identification.chemicalName
  );

  return (
    <div className="min-h-screen pb-32 bg-slate-50/50">
      {/* Header */}
      <header className="bg-gradient-to-l from-slate-900 to-slate-800 text-white shadow-xl no-print sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => {
            setIsComparisonMode(false);
            setResult(null);
            setQuery('');
            setStatus(LoadingState.IDLE);
          }}>
            <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-600/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HazmatAI</h1>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Industrial Safety Intelligence</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-xl w-full">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="نام ماده (سولفوریک اسید) یا فرمول (H2SO4)..."
                className="w-full bg-slate-700/50 border border-slate-600 text-white px-6 py-3.5 rounded-2xl shadow-inner focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:bg-slate-700 transition-all text-lg pr-12 text-right"
                dir="rtl"
              />
              <button 
                onClick={handleSearch}
                disabled={status === LoadingState.LOADING}
                className="absolute left-1.5 top-1.5 bottom-1.5 bg-red-600 hover:bg-red-700 text-white px-5 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 shadow-lg shadow-red-600/30 font-bold"
              >
                {status === LoadingState.LOADING ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                <span className="hidden sm:inline">تحلیل</span>
              </button>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Info className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 mt-10">
        
        {/* Comparison Mode View */}
        {isComparisonMode ? (
          <ComparisonTable 
            items={comparisonList} 
            onRemove={removeFromComparison} 
            onBack={() => setIsComparisonMode(false)} 
          />
        ) : (
          /* Normal Search View */
          <>
            {status === LoadingState.IDLE && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 no-print">
                <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 mb-8 border border-slate-100">
                  <ClipboardCheck className="w-24 h-24 text-slate-200" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-slate-700">آماده برای بازرسی هوشمند</h2>
                <p className="max-w-md text-center leading-relaxed">
                  بانک اطلاعاتی HazmatAI شامل هزاران ماده شیمیایی و دستورالعمل‌های ایمنی GHS است. کافیست نام ماده را جستجو کنید.
                </p>
              </div>
            )}

            {status === LoadingState.LOADING && (
              <div className="flex flex-col items-center justify-center py-32 no-print">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 animate-pulse"></div>
                  <Loader2 className="w-16 h-16 text-red-600 animate-spin relative" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700">در حال استخراج داده‌ها...</h2>
                <p className="text-slate-500 mt-2">Gemini Pro در حال تدوین گزارش ایمنی است</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2rem] flex items-start gap-6 no-print shadow-xl shadow-red-100/20">
                <div className="bg-red-600 p-3 rounded-2xl shadow-lg shadow-red-600/30 shrink-0">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-900">پردازش متوقف شد</h3>
                  <p className="text-red-700 mt-2 text-lg">{error}</p>
                  <button 
                    onClick={handleSearch} 
                    className="mt-6 bg-white border border-red-200 px-6 py-2 rounded-xl text-red-700 font-bold hover:bg-red-100 transition-colors"
                  >
                    تلاش مجدد
                  </button>
                </div>
              </div>
            )}

            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Summary Header */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 print:shadow-none print:border-none print:p-0 print:mb-10">
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
                        <span className="bg-blue-50 text-blue-600 text-xs font-black px-2 py-0.5 rounded-md border border-blue-100 uppercase">{result.identification.formula}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 no-print justify-end">
                    <button 
                      onClick={addToComparison}
                      disabled={isInComparison}
                      className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all border font-bold text-sm ${
                        isInComparison 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {isInComparison ? <Scale className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {isInComparison ? 'افزوده شد' : 'افزودن به مقایسه'}
                    </button>
                    
                    <button 
                      onClick={() => toggleAll(!areAllOpen)}
                      className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-5 py-3 rounded-2xl transition-all border border-slate-200 font-bold text-sm"
                    >
                      {areAllOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                      {areAllOpen ? 'بستن همه' : 'نمایش همه'}
                    </button>
                    <button 
                      onClick={handlePrint} 
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-red-600/20 font-bold text-sm"
                    >
                      <Printer className="w-4 h-4" />
                      چاپ گزارش
                    </button>
                  </div>
                </div>

                {/* MSDS Warning */}
                <div className="bg-amber-50 border-r-4 border-amber-500 p-5 rounded-2xl mb-8 flex gap-4 shadow-sm">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-900 font-bold text-base mb-1">هشدار ایمنی الزامی (Mandatory Safety Warning)</p>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      گزارش حاضر صرفاً جنبه راهنمایی عمومی داشته و بر اساس هوش مصنوعی گردآوری شده است. 
                      این سند نباید به عنوان تنها مرجع تصمیم‌گیری در محیط‌های صنعتی مورد استفاده قرار گیرد. 
                      همیشه به <strong>Safety Data Sheet (SDS)</strong> رسمی ارائه شده توسط تولیدکننده مراجعه کنید.
                    </p>
                  </div>
                </div>

                {/* Accordion List */}
                <div className="space-y-4">
                  <ExpandableSection 
                    id="identification"
                    isOpen={!!openSections.identification}
                    onToggle={() => toggleSection('identification')}
                    icon={ClipboardCheck} 
                    title="شناسایی و مشخصات کلی" 
                    color="text-blue-600"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                      <InfoItem label="نام کامل شیمیایی" value={result.identification.chemicalName} />
                      <InfoItem label="فرمول مولکولی" value={result.identification.formula} />
                      <InfoItem label="شماره CAS" value={result.identification.casNumber} />
                      <InfoItem label="مترادف‌ها و نام‌های تجاری" value={result.identification.synonyms} />
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="hazards"
                    isOpen={!!openSections.hazards}
                    onToggle={() => toggleSection('hazards')}
                    icon={AlertTriangle} 
                    title="خطرات و طبقه‌بندی GHS" 
                    color="text-red-600"
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InfoItem label="کلاس خطر (GHS Classification)" value={result.hazards.ghsClass} />
                        <InfoItem label="پیکتوگرام‌های هشدار" value={result.hazards.pictograms} />
                      </div>
                      <div className="border-t border-slate-100 pt-4 grid grid-cols-1 gap-4">
                        <InfoItem label="خطرات فیزیکی" value={result.hazards.physicalHazards} />
                        <InfoItem label="خطرات سلامتی" value={result.hazards.healthHazards} />
                        <InfoItem label="خطرات زیست‌محیطی" value={result.hazards.environmentalHazards} />
                      </div>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="exposureLimits"
                    isOpen={!!openSections.exposureLimits}
                    onToggle={() => toggleSection('exposureLimits')}
                    icon={Wind} 
                    title="حدود مجاز مواجهه شغلی" 
                    color="text-teal-600"
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
                    title="اقدامات پیشگیرانه و کنترلی" 
                    color="text-indigo-600"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InfoItem label="تجهیزات حفاظت فردی (PPE)" value={result.safetyMeasures.ppe} />
                      <InfoItem label="کنترل‌های مهندسی و تهویه" value={result.safetyMeasures.engineeringControls} />
                      <InfoItem label="شرایط انبارداری ایمن" value={result.safetyMeasures.storage} />
                      <InfoItem label="اصول جداسازی مواد" value={result.safetyMeasures.segregation} />
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="reactions"
                    isOpen={!!openSections.reactions}
                    onToggle={() => toggleSection('reactions')}
                    icon={ThermometerSnowflake} 
                    title="پایداری و واکنش‌پذیری" 
                    color="text-orange-600"
                  >
                    <div className="space-y-4">
                      <InfoItem label="مواد ناسازگار (Incompatible)" value={result.reactions.incompatibleMaterials} />
                      <InfoItem label="واکنش‌های خطرناک احتمالی" value={result.reactions.dangerousReactions} />
                      <InfoItem label="محصولات حاصل از تجزیه" value={result.reactions.decompositionProducts} />
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="firstAid"
                    isOpen={!!openSections.firstAid}
                    onToggle={() => toggleSection('firstAid')}
                    icon={Droplets} 
                    title="کمک‌های اولیه (First Aid)" 
                    color="text-rose-600"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-rose-50/30 p-5 rounded-2xl border border-rose-100">
                        <h4 className="font-bold text-rose-900 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-600"></div>
                          مواجهه تماسی
                        </h4>
                        <div className="space-y-4">
                          <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-rose-700">پوست:</strong> {result.firstAid.skin}</p>
                          <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-rose-700">چشم:</strong> {result.firstAid.eyes}</p>
                        </div>
                      </div>
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                          مواجهه تنفسی/گوارشی
                        </h4>
                        <div className="space-y-4">
                          <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-slate-900">استنشاق:</strong> {result.firstAid.inhalation}</p>
                          <p className="text-sm text-slate-700 leading-relaxed"><strong className="text-slate-900">بلع:</strong> {result.firstAid.ingestion}</p>
                        </div>
                      </div>
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="emergency"
                    isOpen={!!openSections.emergency}
                    onToggle={() => toggleSection('emergency')}
                    icon={ShieldAlert} 
                    title="مدیریت شرایط اضطراری" 
                    color="text-slate-700"
                  >
                    <div className="space-y-4">
                      <InfoItem label="کنترل نشت و ریزش" value={result.emergency.spill} />
                      <InfoItem label="روش‌های اطفای حریق" value={result.emergency.fire} />
                      <InfoItem label="دفع ضایعات و پسماند" value={result.emergency.disposal} />
                    </div>
                  </ExpandableSection>

                  <ExpandableSection 
                    id="transport"
                    isOpen={!!openSections.transport}
                    onToggle={() => toggleSection('transport')}
                    icon={Truck} 
                    title="اطلاعات حمل و نقل و بسته‌بندی" 
                    color="text-slate-600"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <InfoItem label="شماره سازمان ملل (UN)" value={result.transport.unNumber} />
                      <InfoItem label="کلاس حمل و نقل" value={result.transport.class} />
                      <InfoItem label="گروه بسته‌بندی" value={result.transport.packingGroup} />
                    </div>
                  </ExpandableSection>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Comparison Bar */}
      {comparisonList.length > 0 && !isComparisonMode && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-lg px-4 z-40 animate-in slide-in-from-bottom-10 fade-in no-print">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl shadow-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-sm">{comparisonList.length} ماده انتخاب شده</div>
                <div className="text-xs text-slate-400">آماده برای مقایسه</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setComparisonList([])}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="پاک کردن لیست"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsComparisonMode(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
              >
                مشاهده مقایسه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-12 text-center text-slate-400 no-print">
        <div className="max-w-xl mx-auto px-4">
          <p className="text-sm font-medium mb-2">HazmatAI v2.0</p>
          <p className="text-xs leading-relaxed">
            سامانه هوشمند تحلیل ایمنی مواد شیمیایی | طراحی شده برای متخصصین بهداشت حرفه‌ای و HSE
            <br />
            تولید شده با استفاده از مدل زبانی Gemini 3 Pro
          </p>
        </div>
      </footer>
    </div>
  );
}
