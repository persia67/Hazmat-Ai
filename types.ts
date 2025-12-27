
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
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
