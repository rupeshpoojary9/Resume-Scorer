export interface AnalysisLog {
    id: string;
    month: string; // YYYY-MM
    summary: string;
    keyChanges: string[];
    pricingUpdates?: string;
    marketingFocus?: string;
    neilComparison: string; // AI or manual notes on how it compares to Neil
    timestamp: number;
}

export interface FeatureMatrixItem {
    feature: string;
    competitor_has: boolean;
    neil_has: boolean;
    note?: string;
}

export interface MarketRadarData {
    pricing_pressure: number;
    feature_completeness: number;
    market_presence: number;
    innovation_speed: number;
    brand_strength: number;
}

export interface Objection {
    claim: string;
    rebuttal: string;
}

export interface Competitor {
    id: string;
    name: string;
    website: string;
    description: string;
    tier: 'Tier 1' | 'Tier 2' | 'Niche';
    strengths?: string[];
    weaknesses?: string[];
    marketFocus?: string;
    pricingModel?: string;
    marketPresence?: number; // 0-100
    innovationScore?: number; // 0-100

    // Deep Dive Fields
    threatLevel?: 'Critical' | 'High' | 'Medium' | 'Low';
    riskFactors?: string[];
    featureMatrix?: FeatureMatrixItem[];
    marketRadar?: MarketRadarData;

    // Battle Card Fields
    killPoints?: string[];
    objections?: Objection[];
    winThemes?: string[];

    logs: AnalysisLog[];
}

export interface MarketSegment {
    name: string;
    description: string;
    companies: string[];
}

export interface MarketOverview {
    market_summary: string;
    trends: string[];
    segments: MarketSegment[];
    competitors: Competitor[];
}

export interface NewsItem {
    id: string;
    title: string;
    source: string;
    date: string;
    summary: string;
    url: string;
}
