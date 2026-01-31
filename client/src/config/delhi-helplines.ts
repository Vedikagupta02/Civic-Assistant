// Official Delhi Civic Helplines and Contact Information
// Source: Delhi Government departments, Municipal Corporation of Delhi, and official civic bodies

export const DELHI_HELPLINES = {
  // Waste Management
  waste: {
    authority: "Municipal Corporation of Delhi (MCD)",
    helpline: "155305",
    alternateHelpline: "011-23970404",
    department: "Sanitation Department",
    grievancePortal: "MCD Citizen Services Portal",
    description: "For garbage collection, waste management, and sanitation issues"
  },

  // Water Supply
  water: {
    authority: "Delhi Jal Board (DJB)",
    helpline: "1916",
    alternateHelpline: "011-23634467",
    department: "Customer Care Center",
    grievancePortal: "DJB Online Complaint System",
    description: "For water supply, leakage, and pipeline issues"
  },

  // Air Pollution
  air: {
    authority: "Delhi Pollution Control Committee (DPCC)",
    helpline: "011-42200500",
    alternateHelpline: "1800-11-4000",
    department: "Environmental Monitoring",
    grievancePortal: "DPCC Grievance Redressal System",
    description: "For air pollution, industrial emissions, and environmental complaints"
  },

  // Transport & Traffic
  transport: {
    authority: "Delhi Traffic Police",
    helpline: "1075",
    alternateHelpline: "011-25844444",
    department: "Traffic Control Room",
    grievancePortal: "Delhi Traffic Police Complaint Portal",
    description: "For traffic violations, road safety, and transport issues"
  },

  // Electricity & Power
  energy: {
    authority: "Delhi DISCOMs",
    helpline: "1912",
    alternateHelpline: "1800-103-0808",
    department: "Customer Care",
    grievancePortal: "Consumer Grievance Redressal Forum",
    description: "For power outages, electricity supply, and billing issues"
  },

  // Street Lighting
  street_lighting: {
    authority: "Municipal Corporation of Delhi (MCD)",
    helpline: "155305",
    alternateHelpline: "011-23970404",
    department: "Electrical Department",
    grievancePortal: "MCD Citizen Services Portal",
    description: "For street light maintenance and lighting issues"
  },

  // Roads & Infrastructure
  roads: {
    authority: "Public Works Department (PWD)",
    helpline: "011-23393233",
    alternateHelpline: "1800-11-0000",
    department: "Engineering Division",
    grievancePortal: "PWD Delhi Complaint System",
    description: "For road maintenance, potholes, and infrastructure issues"
  },

  // Health & Sanitation
  health: {
    authority: "Delhi Health Department",
    helpline: "104",
    alternateHelpline: "011-22307145",
    department: "Public Health Services",
    grievancePortal: "Delhi Health Services Portal",
    description: "For public health concerns and medical facility complaints"
  },

  // Default fallback
  default: {
    authority: "Delhi Government",
    helpline: "1076",
    alternateHelpline: "011-23392007",
    department: "Citizen Services",
    grievancePortal: "Delhi Government Portal",
    description: "For general civic issues and complaints"
  }
} as const;

// Category mapping for helpline lookup
export const CATEGORY_TO_HELPLINE: Record<string, keyof typeof DELHI_HELPLINES> = {
  'Waste': 'waste',
  'Water': 'water', 
  'Air': 'air',
  'Transport': 'transport',
  'Energy': 'energy',
  'Electricity': 'energy',
  'Power': 'energy',
  'Street Light': 'street_lighting',
  'Street Lighting': 'street_lighting',
  'Roads': 'roads',
  'Infrastructure': 'roads',
  'Health': 'health',
  'Medical': 'health',
  'Sanitation': 'waste',
  'Garbage': 'waste',
  'Traffic': 'transport',
  'Pollution': 'air'
};

export function getHelplineInfo(category: string) {
  const helplineKey = CATEGORY_TO_HELPLINE[category] || 'default';
  return DELHI_HELPLINES[helplineKey];
}

export function formatHelplineDisplay(helplineInfo: ReturnType<typeof getHelplineInfo>) {
  return {
    authority: helplineInfo.authority,
    primaryHelpline: helplineInfo.helpline,
    alternateHelpline: helplineInfo.alternateHelpline,
    department: helplineInfo.department,
    portal: helplineInfo.grievancePortal,
    description: helplineInfo.description
  };
}
