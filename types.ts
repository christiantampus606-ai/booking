export enum Platform {
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  TikTok = 'TikTok',
  LinkedIn = 'LinkedIn',
  YouTube = 'YouTube',
  Amazon = 'Amazon',
  GoogleAds = 'Google Ads',
  Twitter = 'Twitter/X',
  Other = 'Other'
}

export enum AdFormat {
  Image = 'Image',
  Video = 'Video',
  Carousel = 'Carousel',
  Story = 'Story',
  Banner = 'Banner'
}

export enum CopywritingFramework {
  AI_RECOMMENDED = 'AI Recommended (Best Fit)',
  AIDA = 'AIDA (Attention, Interest, Desire, Action)',
  PAS = 'PAS (Problem, Agitation, Solution)',
  BAB = 'BAB (Before, After, Bridge)',
  FAB = 'FAB (Features, Advantages, Benefits)',
  FOUR_PS = '4 Ps (Promise, Picture, Proof, Push)'
}

export interface CampaignData {
  goal: string;
  audience: string;
  keyBenefits: string;
  productUrl: string;
  platform: Platform;
  format: AdFormat;
  aspectRatio: string;
  tone: string;
  framework: CopywritingFramework;
  inspirationImage?: File | null;
  inspirationImageBase64?: string;
}

export interface AdVariation {
  headlines: string[]; // Changed to array for 5 variations
  bodyCopy: string;
  ctas: string[]; // Changed to array for multiple CTA options
  visualDescription: string;
  toneUsed: string;
  frameworkUsed: string;
  rationale: string;
}

export interface GeneratedResponse {
  variations: AdVariation[];
}

export interface UrlAnalysisResponse {
  summary: string;
  keyBenefits: string[];
  audience: string;
  tone: string;
  visualStyle: string;
}