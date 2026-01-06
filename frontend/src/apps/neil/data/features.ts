import { LucideIcon, Brain, FileText, CheckCircle, DollarSign, GitPullRequest, Users, Database, BarChart, Bell, Shield, Globe } from 'lucide-react';

export interface FeatureItem {
    title: string;
    description: string;
    subItems?: string[];
}

export interface FeatureCategory {
    id: string;
    title: string;
    icon: LucideIcon;
    description: string;
    features: FeatureItem[];
}

export const neilFeatures: FeatureCategory[] = [
    {
        id: 'ai',
        title: 'AI & Intelligence',
        icon: Brain,
        description: 'RAG-powered conversational interface with smart visualizations and advanced anomaly detection.',
        features: [
            { title: 'Neil AI Assistant', description: 'RAG-powered conversational interface with smart visualizations' },
            { title: 'AI Models', description: 'Hactar-Prime (Cloud) and Hactar-Nexus (On-Premise)' },
            { title: 'Anomaly Detection', description: 'AI-powered invoice anomaly flagging' },
            { title: 'Custom Entity Recognition', description: 'Configurable field extraction for business-specific needs' },
            { title: 'Language-Specific Pipeline', description: 'Optimal AI model selection based on document language' },
        ]
    },
    {
        id: 'processing',
        title: 'Document Processing',
        icon: FileText,
        description: 'Comprehensive ingestion, extraction, and post-processing capabilities.',
        features: [
            { title: 'Multi-Channel Ingestion', description: 'Email/Outlook, SFTP, Portal Upload, API' },
            { title: 'Multi-Language Support', description: '50+ languages for document extraction' },
            { title: 'AI-Powered ICR + LLM', description: 'Advanced data extraction from invoices' },
            { title: 'Multi-Page Support', description: 'Handle complex multi-page invoices and split/collation' },
            { title: 'Post-Processing', description: 'Country-specific formatting, PO normalization, and tax format handling' },
        ]
    },
    {
        id: 'validation',
        title: 'Validation & Matching',
        icon: CheckCircle,
        description: 'Robust static validation and intelligent N-Way matching engine.',
        features: [
            { title: 'Static Validation', description: 'Vendor master, currency, tax ID, and duplicate detection' },
            { title: 'Semantic N-Way Matching', description: 'AI-powered intelligent matching engine' },
            { title: '2-Way & 3-Way Matching', description: 'Invoice + PO + Goods Receipt validation' },
            { title: 'Line-Item Matching', description: 'Granular matching at line level with tolerance configuration' },
            { title: 'PO/GRN Status Verification', description: 'Validate PO and GRN status automatically' },
        ]
    },
    {
        id: 'financial',
        title: 'Tax & Financial',
        icon: DollarSign,
        description: 'Automated tax calculation, currency conversion, and banking reconciliation.',
        features: [
            { title: 'Automated Tax Calculation', description: 'VAT and WHT computation with auto-mapping' },
            { title: 'ERP-Integrated Tax Engine', description: 'Real-time tax calculation with ERP data' },
            { title: 'Multi-Jurisdiction Support', description: 'Handle multiple tax regions and inference logic' },
            { title: 'Currency Conversion', description: 'Multi-currency support with real-time rates' },
            { title: 'Payment Processing', description: 'End-to-end payment tracking and reconciliation' },
        ]
    },
    {
        id: 'workflow',
        title: 'Workflow & Approvals',
        icon: GitPullRequest,
        description: 'Configurable approval chains, spend-based routing, and auto-approval (STP).',
        features: [
            { title: 'Multi-Level Approvals', description: 'Support multiple approval levels and spend-based routing' },
            { title: 'Neil Auto-Approval (STP)', description: 'Straight-through processing for validated invoices' },
            { title: 'Configurable Hierarchies', description: 'Flows based on Plant, BU, Cost Center, or Invoice Type' },
            { title: 'Workflow Actions', description: 'Assign, Re-assign, Raise Query, Bulk Approval, Delegation' },
            { title: 'SLA-Based Escalation', description: 'Automatic escalation for overdue items' },
        ]
    },
    {
        id: 'portals',
        title: 'User Portals',
        icon: Users,
        description: 'Dedicated portals for Vendors, AP Clerks, Managers, CFOs, and Admins.',
        features: [
            { title: 'Vendor Portal', description: 'Dashboard, Invoice Submission, Payment Tracking, Query Management' },
            { title: 'AP Clerk Workbench', description: 'Invoice editing, exception handling, queue management' },
            { title: 'AP Manager Dashboard', description: 'Team performance, advanced analytics, SLA compliance' },
            { title: 'CFO Portal', description: 'Executive dashboard, financial analytics, high-value approvals' },
            { title: 'Admin Portal', description: 'Vendor/User management, system configuration, audit logging' },
        ]
    },
    {
        id: 'erp',
        title: 'ERP Integrations',
        icon: Database,
        description: 'Seamless integration with SAP, QuickBooks, RAMCO, and generic ERP templates.',
        features: [
            { title: 'Supported Systems', description: 'SAP (Ariba, ECC6, S/4HANA), QuickBooks, RAMCO, SharePoint' },
            { title: 'Integration Features', description: 'Real-time API, Flat File, Bidirectional Sync, Batch Processing' },
            { title: 'Data Syncing', description: 'Vendor Master, PO/GRN, GL Codes, Exchange Rates' },
            { title: 'Interface Reconciliation', description: 'Validate Neil vs ERP data integrity' },
        ]
    },
    {
        id: 'reporting',
        title: 'Reporting & Analytics',
        icon: BarChart,
        description: '13+ Enterprise reports and customizable analytics dashboards.',
        features: [
            { title: 'Enterprise Reports', description: 'Ageing, Discard, Exception, Accrual, SLA Compliance, Productivity' },
            { title: 'Analytics Dashboards', description: 'Geographic, Team Performance, Vendor & Payment Analytics' },
            { title: 'Custom Report Builder', description: 'Ad-hoc report creation with export capabilities' },
            { title: 'Status-Based Views', description: 'Filter by Processed, Pending, Exception, Anomaly, etc.' },
        ]
    },
    {
        id: 'communication',
        title: 'Communication',
        icon: Bell,
        description: 'Multi-channel notifications and real-time alerts.',
        features: [
            { title: 'Channel Notifications', description: 'Email and In-App alerts' },
            { title: 'Approval Reminders', description: 'Notifications for pending actions' },
            { title: 'Exception Alerts', description: 'Real-time updates on exceptions' },
        ]
    },
    {
        id: 'security',
        title: 'Security & Compliance',
        icon: Shield,
        description: 'Enterprise-grade security with SSO, RBAC, and complete audit trails.',
        features: [
            { title: 'SSO & Authentication', description: 'Enterprise Single Sign-On support' },
            { title: 'Role-Based Access', description: 'Granular permissions (RBAC)' },
            { title: 'Data Encryption', description: 'At-rest and in-transit protection' },
            { title: 'Audit Trail', description: 'Complete activity logging for every action' },
        ]
    },
    {
        id: 'platform',
        title: 'Platform Features',
        icon: Globe,
        description: 'Multi-language support, responsive design, and intuitive UX.',
        features: [
            { title: 'Multi-Language', description: '50+ extraction languages and UI translation' },
            { title: 'User Experience', description: 'Responsive design, intuitive interface, dark mode support' },
            { title: 'Activity Timeline', description: 'Visual process tracking for every document' },
            { title: 'Pre-Fill from ERP', description: 'Auto-populate fields from ERP data' },
        ]
    }
];
