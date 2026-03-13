#!/usr/bin/env python3
"""Generate all 7 station detail pages with proper OSE-style design."""

STATIONS = [
    {
        'id': 'environment',
        'title': 'ENVIRONMENT',
        'hero_img': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80',
        'desc': 'Sector-specific diagnostics for food systems, textiles, manufacturing, biodiversity, energy, and water — grounded in EU Farm to Fork, REACH, NERC CIP, CITES, and 15+ regulatory frameworks.',
        'body': 'Every environmental sector carries unique regulatory obligations. AMC maps each obligation to diagnostic questions that score whether your agent handles them correctly — from pesticide limits in food AI to endangered species detection in biodiversity monitoring.',
        'pack_count': 6, 'q_count': 87,
        'packs': [
            {'name': 'Farm to Fork', 'desc': 'Food safety AI from precision agriculture through processing and retail.', 'frameworks': 'EU Farm to Fork, ISO 22000, HACCP, EUDR',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c-4-3-8-6-8-11a4 4 0 018 0 4 4 0 018 0c0 5-4 8-8 11z"/></svg>',
             'skill': 'Precision agriculture, HACCP compliance monitoring, food chain traceability, pesticide residue detection'},
            {'name': 'Weave to Wear', 'desc': 'Textile and fashion supply chain AI governance covering chemical safety and labour.', 'frameworks': 'REACH, ZDHC, GRS, ILO labour standards',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3v18"/><path d="M18 3v18"/><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg>',
             'skill': 'Chemical safety tracking, labour compliance, sustainable material verification, supply chain transparency'},
            {'name': 'Material to Machines', 'desc': 'Manufacturing and electronics AI compliance for hazardous substances and ecodesign.', 'frameworks': 'RoHS, WEEE, ecodesign, EU Battery Reg',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4"/><path d="M14 12h4"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/></svg>',
             'skill': 'Hazardous substance detection, ecodesign assessment, battery regulation, end-of-life compliance'},
            {'name': 'Source to Sustenance', 'desc': 'Biodiversity and natural resource AI governance for endangered species and genetic resources.', 'frameworks': 'CBD, CITES, FSC, REDD+, Nagoya Protocol',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34"/><path d="M21 3s-2 2-4 2c-3 0-4-2-4-2"/><path d="M11 8c-2 3-3 9-2 14"/></svg>',
             'skill': 'Species identification, trade monitoring, forest certification, genetic resource tracking'},
            {'name': 'Ubiquity to Utility', 'desc': 'Energy and utilities AI safety covering critical infrastructure protection and grid management.', 'frameworks': 'NERC CIP, RED III, ISO 50001, grid safety',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
             'skill': 'Grid stability monitoring, NERC CIP compliance, renewable integration, demand response safety'},
            {'name': 'Sip to Sanitation', 'desc': 'Water management and sanitation AI governance for drinking water and pollution prevention.', 'frameworks': 'EU WFD, WHO water safety, MARPOL, PFAS',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v6"/><path d="M12 8c-4 4-6 7-6 10a6 6 0 0012 0c0-3-2-6-6-10z"/></svg>',
             'skill': 'Water quality monitoring, pollutant detection, PFAS screening, wastewater treatment compliance'},
        ]
    },
    {
        'id': 'health',
        'title': 'HEALTH',
        'hero_img': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&q=80',
        'desc': 'Diagnostics for clinical AI, patient privacy, drug discovery, medical devices, mental health, insurance, precision medicine, telehealth, and elderly care — mapped to HIPAA, FDA, MDR, GDPR, and WHO guidelines.',
        'body': 'Healthcare AI carries life-or-death stakes. AMC diagnostics probe whether your agent handles patient data correctly, follows clinical protocols, maintains audit trails, and responds safely under uncertainty.',
        'pack_count': 9, 'q_count': 162,
        'packs': [
            {'name': 'Clinical AI Safety', 'desc': 'Diagnostics for clinical decision support systems and treatment recommendation AI.', 'frameworks': 'FDA SaMD, IEC 62304, WHO AI ethics',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
             'skill': 'Clinical decision support, treatment safety, diagnostic accuracy, alert fatigue management'},
            {'name': 'Patient Data Privacy', 'desc': 'Privacy and consent management for health data handling AI systems.', 'frameworks': 'HIPAA, GDPR, HITECH, HL7 FHIR',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
             'skill': 'Data anonymization, consent workflow, breach notification, access control'},
            {'name': 'Drug Discovery AI', 'desc': 'AI governance for computational chemistry, target identification, and clinical trials.', 'frameworks': 'ICH GxP, FDA 21 CFR Part 11, EMA guidelines',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2v8L4.5 20.5a2 2 0 001.5 3.5h12a2 2 0 001.5-3.5L14 10V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>',
             'skill': 'Molecule screening, trial protocol compliance, adverse event prediction, GxP documentation'},
            {'name': 'Medical Device AI', 'desc': 'Diagnostics for AI-powered medical devices and SaMD classification compliance.', 'frameworks': 'EU MDR, FDA SaMD, IEC 62304, ISO 14971',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/><path d="M9 6h6"/></svg>',
             'skill': 'Device classification, risk management, software lifecycle, post-market surveillance'},
            {'name': 'Mental Health AI', 'desc': 'Safety diagnostics for therapy bots, mood tracking, and crisis intervention AI.', 'frameworks': 'APA ethics, WHO mhGAP, duty of care, crisis protocols',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a9 9 0 019 9c0 3.9-2 6.7-4.5 8.8L12 22l-4.5-2.2C5 17.7 3 14.9 3 11a9 9 0 019-9z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
             'skill': 'Crisis detection, therapeutic boundaries, consent for minors, escalation protocols'},
            {'name': 'Health Insurance AI', 'desc': 'Governance for claims processing, underwriting, and fraud detection AI.', 'frameworks': 'HIPAA, ACA, state insurance regs, NAIC',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>',
             'skill': 'Claims fairness, underwriting bias, fraud detection accuracy, appeal transparency'},
            {'name': 'Precision Medicine', 'desc': 'AI diagnostics for genomic analysis, biomarker discovery, and personalized treatment.', 'frameworks': 'GINA, EU IVDR, pharmacogenomics guidelines',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c0-7 4-12 4-12s4 5 4 12"/></svg>',
             'skill': 'Genomic data handling, biomarker validation, treatment personalization, genetic discrimination prevention'},
            {'name': 'Telehealth AI', 'desc': 'Governance for remote consultation, triage, and virtual care AI systems.', 'frameworks': 'CMS telehealth rules, state licensure, informed consent',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15.6 11.6A1.6 1.6 0 0114 13.2H7.8L4 17V5a2 2 0 012-2h8a2 2 0 012 2v3"/><path d="M16 3h4a2 2 0 012 2v8a2 2 0 01-2 2h-2l-2 2v-2h-2a2 2 0 01-2-2V5"/></svg>',
             'skill': 'Virtual triage safety, remote monitoring, cross-state licensure, emergency escalation'},
            {'name': 'Elderly Care AI', 'desc': 'Safety diagnostics for companion robots, fall detection, and assisted living AI.', 'frameworks': 'ADA, elder care standards, EU care robot guidelines',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 00-16 0"/></svg>',
             'skill': 'Fall detection accuracy, companion safety, medication reminders, dignity preservation'},
        ]
    },
    {
        'id': 'wealth',
        'title': 'WEALTH',
        'hero_img': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&q=80',
        'desc': 'Diagnostics for fintech, insurance AI, algorithmic trading, DeFi, and banking — mapped to MiFID II, PSD2, Basel III, SEC, and AML/KYC regulations.',
        'body': 'Financial AI operates under some of the strictest regulatory regimes on earth. AMC probes whether your agent handles transactions safely, explains decisions to regulators, and maintains audit trails that survive examination.',
        'pack_count': 5, 'q_count': 92,
        'packs': [
            {'name': 'Fintech Compliance', 'desc': 'Diagnostics for payment AI, lending, and financial product recommendation systems.', 'frameworks': 'PSD2, GDPR, FCA, consumer credit regs',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
             'skill': 'Payment safety, lending fairness, product suitability, open banking security'},
            {'name': 'Insurance AI', 'desc': 'Governance for underwriting AI, claims automation, and actuarial modeling.', 'frameworks': 'Solvency II, NAIC, EIOPA, anti-discrimination',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
             'skill': 'Pricing fairness, claims transparency, actuarial model validation, discrimination prevention'},
            {'name': 'Algorithmic Trading', 'desc': 'Safety diagnostics for trading bots, market-making AI, and portfolio management.', 'frameworks': 'MiFID II, SEC, CFTC, circuit breaker rules',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
             'skill': 'Market manipulation prevention, circuit breaker compliance, order execution fairness, flash crash mitigation'},
            {'name': 'DeFi & Crypto', 'desc': 'Governance for decentralized finance AI, smart contract auditing, and wallet management.', 'frameworks': 'MiCA, FATF travel rule, AML/KYC, SEC guidance',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
             'skill': 'Smart contract safety, AML compliance, wallet security, transaction monitoring'},
            {'name': 'Banking AI', 'desc': 'Diagnostics for core banking AI, credit scoring, and customer service automation.', 'frameworks': 'Basel III, CRD, PSD2, fair lending',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/><path d="M4 10v11"/><path d="M20 10v11"/><path d="M8 10v11"/><path d="M12 10v11"/><path d="M16 10v11"/></svg>',
             'skill': 'Credit fairness, account security, customer data protection, transaction fraud detection'},
        ]
    },
    {
        'id': 'education',
        'title': 'EDUCATION',
        'hero_img': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=80',
        'desc': 'Diagnostics for EdTech, assessment AI, research integrity, language learning, and special needs — mapped to FERPA, COPPA, GDPR-K, UNESCO, and accessibility standards.',
        'body': 'Education AI shapes minds. AMC diagnostics ensure your agent protects student data, delivers fair assessments, avoids harmful content for minors, and meets accessibility requirements across jurisdictions.',
        'pack_count': 5, 'q_count': 78,
        'packs': [
            {'name': 'EdTech Platforms', 'desc': 'Governance for learning management, adaptive tutoring, and student engagement AI.', 'frameworks': 'FERPA, COPPA, GDPR-K, student privacy',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
             'skill': 'Student data protection, adaptive learning safety, content age-appropriateness, engagement ethics'},
            {'name': 'Assessment AI', 'desc': 'Fairness and validity diagnostics for AI grading, proctoring, and evaluation systems.', 'frameworks': 'Testing standards, anti-cheating, ADA, bias audits',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
             'skill': 'Grading fairness, proctoring privacy, accommodation compliance, score reliability'},
            {'name': 'Research Integrity', 'desc': 'AI governance for academic research, peer review, and publication assistance.', 'frameworks': 'Responsible AI in research, plagiarism detection, IRB',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
             'skill': 'Citation accuracy, authorship attribution, data fabrication detection, peer review integrity'},
            {'name': 'Language Learning', 'desc': 'Safety diagnostics for conversational AI tutors and translation learning tools.', 'frameworks': 'CEFR, cultural sensitivity, age-appropriate content',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
             'skill': 'Cultural sensitivity, pronunciation safety, content filtering, level-appropriate responses'},
            {'name': 'Special Needs Education', 'desc': 'Accessibility and safety diagnostics for AI supporting learners with disabilities.', 'frameworks': 'ADA, IDEA, WCAG, universal design',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>',
             'skill': 'Assistive technology integration, IEP compliance, sensory accommodation, communication support'},
        ]
    },
    {
        'id': 'mobility',
        'title': 'MOBILITY',
        'hero_img': 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600&q=80',
        'desc': 'Diagnostics for autonomous vehicles, maritime AI, aviation, rail, and logistics — mapped to UNECE, IMO, EASA, ERA, and supply chain regulations.',
        'body': 'Mobility AI moves people and goods. Failures mean collisions, grounding, or supply chain disruptions. AMC diagnostics verify safety-critical decision-making, sensor fusion reliability, and regulatory compliance.',
        'pack_count': 5, 'q_count': 84,
        'packs': [
            {'name': 'Autonomous Vehicles', 'desc': 'Safety diagnostics for self-driving systems, ADAS, and V2X communication AI.', 'frameworks': 'UNECE WP.29, ISO 26262, SOTIF, SAE levels',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2M5 17l-1 3h1m15-3l1 3h-1"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></svg>',
             'skill': 'Perception safety, decision-making under uncertainty, ODD compliance, cybersecurity'},
            {'name': 'Maritime AI', 'desc': 'Governance for autonomous ships, port management, and maritime navigation AI.', 'frameworks': 'IMO MSC, COLREG, SOLAS, MASS guidelines',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20l.6-2.2C3.3 14.8 6.4 13 9.7 13h4.6c3.3 0 6.4 1.8 7.1 4.8L22 20"/><path d="M12 13V4"/><path d="M12 4l5 4H7l5-4z"/></svg>',
             'skill': 'Collision avoidance, weather response, port automation safety, crew assistance'},
            {'name': 'Aviation AI', 'desc': 'Safety diagnostics for flight management, air traffic, and maintenance prediction AI.', 'frameworks': 'EASA AI roadmap, DO-178C, DO-254, FAA',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
             'skill': 'Flight safety, maintenance prediction, ATC support, pilot workload management'},
            {'name': 'Rail AI', 'desc': 'Governance for train control, signalling, and rail network management AI.', 'frameworks': 'ERA, ERTMS/ETCS, EN 50128, CENELEC SIL',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/><path d="M6 19l-2 3"/><path d="M18 19l2 3"/></svg>',
             'skill': 'Signalling safety, predictive maintenance, passenger flow, timetable optimization'},
            {'name': 'Logistics AI', 'desc': 'Diagnostics for supply chain, warehouse, and last-mile delivery AI systems.', 'frameworks': 'EU supply chain due diligence, customs, ADR/IMDG',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
             'skill': 'Route optimization safety, warehouse automation, cold chain monitoring, customs compliance'},
        ]
    },
    {
        'id': 'technology',
        'title': 'TECHNOLOGY',
        'hero_img': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80',
        'desc': 'Diagnostics for AI infrastructure, IoT, cybersecurity, cloud AI, and robotics — mapped to NIST, ISO 27001, IEC 62443, SOC2, and emerging AI standards.',
        'body': 'Technology AI is the substrate everything else runs on. AMC diagnostics verify that your infrastructure, networking, security, and robotics agents maintain safety invariants even as they scale.',
        'pack_count': 5, 'q_count': 71,
        'packs': [
            {'name': 'Cognition to Intelligence', 'desc': 'AI infrastructure diagnostics for model serving, training pipelines, and MLOps.', 'frameworks': 'NIST AI RMF, MLOps maturity, model governance',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1"/><circle cx="6" cy="18" r="1"/></svg>',
             'skill': 'Model lifecycle, training data governance, inference safety, resource optimization'},
            {'name': 'Networked Ecosystems', 'desc': 'IoT and edge AI governance for connected devices and sensor networks.', 'frameworks': 'IEC 62443, ETSI EN 303 645, matter protocol',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="2"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><path d="M6 7.5L10.5 11M13.5 11L18 7.5M6 16.5L10.5 13M13.5 13L18 16.5"/></svg>',
             'skill': 'Device security, data aggregation privacy, edge inference safety, firmware update governance'},
            {'name': 'OS for Sustainable Outcomes', 'desc': 'Cybersecurity AI diagnostics for threat detection, incident response, and SOC automation.', 'frameworks': 'ISO 27001, SOC2, NIST CSF, MITRE ATT&CK',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
             'skill': 'Threat detection accuracy, false positive management, incident escalation, SOC automation safety'},
            {'name': 'Infotainment', 'desc': 'Cloud and platform AI governance for multi-tenant systems and API security.', 'frameworks': 'CSA STAR, FedRAMP, ISO 27017, API security',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>',
             'skill': 'Multi-tenant isolation, API rate limiting, data residency, service availability'},
            {'name': 'Partnerships for Prosperity', 'desc': 'Robotics and physical AI diagnostics for industrial robots, cobots, and drones.', 'frameworks': 'ISO 10218, ISO 13482, EU Machinery Reg, drone regs',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="3"/><path d="M12 8v3"/><path d="M8 16h.01"/><path d="M16 16h.01"/></svg>',
             'skill': 'Cobot safety, force limiting, human detection, operational boundary enforcement'},
        ]
    },
    {
        'id': 'governance',
        'title': 'GOVERNANCE',
        'hero_img': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&q=80',
        'desc': 'Diagnostics for legal AI, public sector, defense, tax compliance, and electoral integrity — mapped to EU AI Act, NIST, OECD AI principles, and government-specific regulations.',
        'body': 'Governance AI touches democratic institutions, legal systems, and public trust. AMC diagnostics ensure these systems are transparent, auditable, and aligned with constitutional and regulatory requirements.',
        'pack_count': 5, 'q_count': 74,
        'packs': [
            {'name': 'Legal AI', 'desc': 'Governance for contract analysis, legal research, and litigation prediction AI.', 'frameworks': 'ABA ethics, GDPR, e-discovery rules, legal privilege',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3v18"/><path d="M4 7l8-4 8 4"/><path d="M2 17l4-10 4 10"/><path d="M14 17l4-10 4 10"/><path d="M2 17h8"/><path d="M14 17h8"/></svg>',
             'skill': 'Contract analysis accuracy, legal privilege protection, bias in prediction, citation verification'},
            {'name': 'Public Sector AI', 'desc': 'Diagnostics for government services, benefits processing, and citizen engagement AI.', 'frameworks': 'EU AI Act (high-risk), GovTech standards, FOI',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>',
             'skill': 'Benefits fairness, citizen data protection, decision explainability, public accountability'},
            {'name': 'Defense & Security', 'desc': 'AI governance for intelligence analysis, surveillance, and defense decision support.', 'frameworks': 'DoD AI ethics, NATO AI strategy, export controls',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
             'skill': 'Intelligence accuracy, surveillance boundaries, lethal autonomy prevention, operational security'},
            {'name': 'Tax & Compliance', 'desc': 'Diagnostics for tax calculation, audit AI, and regulatory reporting systems.', 'frameworks': 'OECD BEPS, DAC7, SAF-T, MTD',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
             'skill': 'Tax calculation accuracy, cross-border compliance, audit trail integrity, reporting automation'},
            {'name': 'Electoral Integrity', 'desc': 'Safety diagnostics for voter systems, political AI, and election monitoring.', 'frameworks': 'Election commission rules, EU DSA, political ad transparency',
             'icon': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 4v16"/><path d="M3 8h8"/><path d="M3 4h8"/><path d="M13 12l4 4 4-4"/><path d="M17 8v8"/></svg>',
             'skill': 'Vote counting accuracy, deepfake detection, political ad transparency, disinformation prevention'},
        ]
    },
]

# Station icon SVGs for cross-nav
STATION_ICONS = {
    'environment': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
    'health': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    'wealth': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
    'education': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
    'mobility': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>',
    'technology': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></svg>',
    'governance': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>',
}

def gen_station_nav(current_id):
    """Generate the cross-station navigation icons."""
    rows = []
    for s in STATIONS:
        cls = 'station-nav-item station-nav-active' if s['id'] == current_id else 'station-nav-item'
        href = '#' if s['id'] == current_id else f"station-{s['id']}.html"
        rows.append(f'              <a href="{href}" class="{cls}" title="{s["id"].title()}">{STATION_ICONS[s["id"]]}</a>')
    return '\n'.join(rows)

def gen_page(station):
    nav_html = gen_station_nav(station['id'])
    packs_html = ''
    for p in station['packs']:
        packs_html += f'''
          <div class="pack-article gs">
            <div class="pack-tag">{p['icon']}</div>
            <div class="pack-article-body">
              <h3>{p['name']}</h3>
              <p>{p['desc']}</p>
              <span class="pack-frameworks">{p['frameworks']}</span>
            </div>
            <span class="pack-arrow">↗</span>
          </div>'''

    skills_html = ''
    for i, p in enumerate(station['packs']):
        is_open = ' open' if i == 0 else ''
        toggle = '—' if i == 0 else '+'
        skills_html += f'''
            <div class="skill-item{is_open}">
              <button class="skill-q">{p['name']}<span class="skill-toggle">{toggle}</span></button>
              <div class="skill-a"><p>{p['skill']}</p></div>
            </div>'''

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AMC — {station['title']} Station</title>
  <meta name="description" content="AMC {station['title']} Station: {station['pack_count']} packs · {station['q_count']} questions">
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="station.css">
</head>
<body>
  <nav class="nav">
    <div class="nav-inner">
      <a href="index.html" class="nav-brand">amc<span style="color:var(--accent)">_</span></a>
      <ul class="nav-links">
        <li><a href="index.html#products">products</a></li>
        <li><a href="index.html#domains">stations</a></li>
        <li><a href="docs/index.html">docs</a></li>
      </ul>
      <div class="nav-right"><a href="https://github.com/thewisecrab/AgentMaturityCompass" class="nav-cta" target="_blank" rel="noopener">GitHub →</a></div>
    </div>
  </nav>

  <section class="station-hero" style="background-image:url('{station['hero_img']}')">
    <div class="station-hero-overlay"></div>
    <div class="station-hero-blocks" aria-hidden="true"></div>
    <div class="container" style="position:relative;z-index:3">
      <div class="station-nav gs">
        <div class="station-nav-row">
{nav_html}
        </div>
      </div>
      <h1 class="station-hero-title gs">{station['title']}<span class="accent">_</span></h1>
    </div>
  </section>

  <section class="station-content">
    <div class="container">
      <div class="station-two-col gs">
        <div class="station-left">
          <p class="label">■ {station['pack_count']} diagnostic packs · {station['q_count']} questions</p>
          <h2 class="station-tagline">{station['desc']}</h2>
          <p class="station-body">{station['body']}</p>
        </div>
        <div class="station-right">
          <div class="skills-accordion">{skills_html}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="station-packs">
    <div class="container">
      <p class="label">■ diagnostic packs</p>
      <h2 class="gs">Our diagnostic packs<span class="accent blink-cursor">_</span></h2>
      <div class="pack-articles">{packs_html}
      </div>
    </div>
  </section>

  <div class="station-breadcrumb">
    <div class="container">
      <a href="index.html">HOME</a> / <a href="index.html#domains">OUR STATIONS</a> / <strong>{station['title']}</strong>
    </div>
  </div>

  <section class="station-cta">
    <div class="gradient-cta-lines" aria-hidden="true">
      <div class="gradient-cta-line" style="left:8%;--dur:5s;--delay:0s"></div>
      <div class="gradient-cta-line" style="left:22%;--dur:7s;--delay:1.2s"></div>
      <div class="gradient-cta-line" style="left:36%;--dur:6s;--delay:0.5s"></div>
      <div class="gradient-cta-line" style="left:50%;--dur:8s;--delay:2s"></div>
      <div class="gradient-cta-line" style="left:64%;--dur:5.5s;--delay:0.8s"></div>
      <div class="gradient-cta-line" style="left:78%;--dur:7.5s;--delay:1.5s"></div>
      <div class="gradient-cta-line" style="left:92%;--dur:6.5;--delay:0.3s"></div>
    </div>
    <div class="gradient-cta-watermark" aria-hidden="true">amc</div>
    <div class="container" style="position:relative;z-index:1;text-align:center">
      <h2 class="gs">A single score <strong>can spark<br>trust in your agents<span class="accent blink-cursor">_</span></strong></h2>
      <div style="margin-top:2rem">
        <a href="index.html" class="btn btn-primary btn-xl">try in browser →</a>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-top">
        <div><div class="footer-brand">amc<span style="color:var(--accent)">_</span></div><p class="footer-tagline">Score, fix, ship AI agents.<br>Evidence over claims.</p></div>
        <div class="footer-col"><h4>Our stations</h4><a href="station-environment.html">Environment</a><a href="station-health.html">Health</a><a href="station-wealth.html">Wealth</a><a href="station-education.html">Education</a><a href="station-mobility.html">Mobility</a><a href="station-technology.html">Technology</a><a href="station-governance.html">Governance</a></div>
        <div class="footer-col"><h4>Product</h4><a href="docs/index.html">Documentation</a><a href="playground.html">Playground</a><a href="https://github.com/thewisecrab/AgentMaturityCompass">GitHub</a></div>
        <div class="footer-col"><h4>Contact</h4><a href="https://github.com/thewisecrab/AgentMaturityCompass" target="_blank" rel="noopener">↗ GitHub</a></div>
      </div>
      <div class="footer-bottom"><span class="footer-copy">© 2026 Agent Maturity Compass. MIT License.</span><span class="footer-copy">LEGAL NOTICES</span></div>
    </div>
  </footer>

  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {{
      // Make .gs visible by default before GSAP enhancement
      var els = document.querySelectorAll('.gs');
      els.forEach(function(el) {{ el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }});

      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {{
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({{limitCallbacks:true}});

        // Batch reveals
        ScrollTrigger.batch('.gs', {{
          onEnter: function(batch) {{ gsap.to(batch, {{opacity:1, y:0, duration:0.4, ease:'power2.out', stagger:0.08}}); }},
          start: 'top 92%',
          once: true
        }});

        // Nav scroll behavior
        var nav = document.querySelector('.nav');
        if (nav) {{
          ScrollTrigger.create({{start:'top -60', onUpdate:function(self){{ nav.classList.toggle('scrolled', self.progress > 0); }}}});
        }}

        // Hero block reveal on scroll
        var blocks = document.querySelector('.station-hero-blocks');
        var hero = document.querySelector('.station-hero');
        if (blocks && hero) {{
          ScrollTrigger.create({{
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
            onUpdate: function(self) {{
              blocks.style.opacity = self.progress;
            }}
          }});
        }}
      }}

      // Accordion
      document.querySelectorAll('.skill-q').forEach(function(btn) {{
        btn.addEventListener('click', function() {{
          var item = btn.closest('.skill-item');
          var wasOpen = item.classList.contains('open');
          document.querySelectorAll('.skill-item.open').forEach(function(o) {{
            o.classList.remove('open');
            o.querySelector('.skill-toggle').textContent = '+';
          }});
          if (!wasOpen) {{ item.classList.add('open'); btn.querySelector('.skill-toggle').textContent = '—'; }}
        }});
      }});
    }});
  </script>
</body>
</html>'''

if __name__ == '__main__':
    for s in STATIONS:
        filename = f"station-{s['id']}.html"
        with open(filename, 'w') as f:
            f.write(gen_page(s))
        print(f'Generated {filename}')
    print(f'Done — {len(STATIONS)} station pages generated.')
