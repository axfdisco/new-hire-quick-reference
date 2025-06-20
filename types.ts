
import React from 'react';

export interface LinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  ctaText?: string;
}

export interface AISuggestion {
  title: string;
  summary: string;
  processDetails: string;
  actualPageUrl: string; // The full URL of the Confluence page where the details are found
  pageSectionAnchor?: string; // Optional: anchor for a specific section within the actualPageUrl
}
