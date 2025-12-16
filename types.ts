export interface FileWithPreview {
  file: File;
  previewUrl: string;
}

export interface GenerationResult {
  imageUrl: string | null;
  text: string | null;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type PatternScale = 'small' | 'medium' | 'large' | 'original';
export type FabricType = 'original' | 'cotton' | 'silk' | 'denim' | 'wool' | 'leather' | 'linen' | 'velvet' | 'chiffon';
export type TargetArea = 'whole outfit' | 'top' | 'bottom' | 'dress' | 'outerwear';

export interface GenerationSettings {
  scale: PatternScale;
  fabricType: FabricType;
  targetArea: TargetArea;
  customPrompt: string;
}
