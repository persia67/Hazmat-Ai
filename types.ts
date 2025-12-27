
export interface ChemicalAnalysis {
  identification: {
    chemicalName: string;
    formula: string;
    casNumber: string;
    synonyms: string[];
  };
  hazards: {
    ghsClass: string;
    pictograms: string[];
    physicalHazards: string;
    healthHazards: string;
    environmentalHazards: string;
  };
  exposureLimits: {
    tlv: string;
    pel: string;
    stel: string;
  };
  reactions: {
    incompatibleMaterials: string[];
    dangerousReactions: string;
    decompositionProducts: string;
  };
  safetyMeasures: {
    ppe: string[];
    engineeringControls: string;
    storage: string;
    segregation: string;
  };
  firstAid: {
    skin: string;
    eyes: string;
    inhalation: string;
    ingestion: string;
  };
  emergency: {
    spill: string;
    fire: string;
    disposal: string;
  };
  transport: {
    unNumber: string;
    class: string;
    packingGroup: string;
  };
  references: string[];
}

export interface InteractionResult {
  reactionType: string;
  equation: string;
  products: string[];
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  hazards: string;
  conditionEffects: string; // Effect of heat/pressure
  safetyMeasures: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface NewsResult {
  summary: string;
  sources: { title: string; uri: string }[];
}

export type Language = 'fa' | 'en';

export interface ThemeConfig {
  id: string;
  name: string;
  primary: string; // bg-color-600
  primaryHover: string; // hover:bg-color-700
  secondary: string; // bg-color-50
  accent: string; // text-color-600
  border: string; // border-color-200
  lightText: string; // text-color-100
  ring: string; // ring-color-500
  shadow: string; // shadow-color-600/20
  gradient: string; // bg-gradient-to-l ...
}
