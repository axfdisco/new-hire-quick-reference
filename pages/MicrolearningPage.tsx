

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Helper to determine display text for a URL
const getLinkDisplayText = (url: string): string => {
  try {
    const { hostname } = new URL(url);
    if (hostname.includes('scribehow.com')) {
      return "Scribe Guide";
    }
    if (hostname.includes('share.vidyard.com')) {
      return "Vidyard Video";
    }
  } catch (e) {
    // Fallback for invalid URLs or environments where URL is not available
    if (url.includes('scribehow.com')) {
      return "Scribe Guide";
    }
    if (url.includes('share.vidyard.com')) {
      return "Vidyard Video";
    }
  }
  return "Link"; // Default for other URLs
};

// Updated Helper function to process a line of text for **bold**, links, and placeholders
const processLineContentForLinksAndPlaceholders = (lineText: string, baseKey: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  // Regex to capture **bold text**, https links, (Placeholder for video: "title" - [Link to Video]) or [Link to Video]
  const lineParsingRegex = /(\*\*(.*?)\*\*|https?:\/\/[^\s]+|\(\s*Placeholder for video:\s*"([^"]+)"(?: - \[\s*Link to Video\s*\])?\s*\)|\[\s*Link to Video\s*\])/g;
  
  let lastIndex = 0;
  let match;

  while ((match = lineParsingRegex.exec(lineText)) !== null) {
    // Add plain text before the current match
    if (match.index > lastIndex) {
      nodes.push(lineText.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];
    const boldContent = match[2]; // Content inside **...**
    const placeholderTitle = match[4]; // Title from (Placeholder for video: "...")

    if (boldContent !== undefined) { // Captured **bold text**
      nodes.push(<strong key={`${baseKey}-bold-${match.index}`}>{boldContent}</strong>);
    } else if (fullMatch.startsWith('http')) { // Captured a URL
      const linkText = getLinkDisplayText(fullMatch);
      nodes.push(
        <a key={`${baseKey}-link-${match.index}`} href={fullMatch} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-200 hover:underline">
          {linkText}
        </a>
      );
    } else if (fullMatch.startsWith('(Placeholder for video:')) { // Captured (Placeholder for video: "title")
      const title = placeholderTitle || "video";
      nodes.push(<em key={`${baseKey}-ph-${match.index}`} className="text-slate-400 text-sm">(Placeholder for video: {title})</em>);
    } else if (fullMatch === '[Link to Video]') { // Captured [Link to Video]
      nodes.push(<em key={`${baseKey}-lv-${match.index}`} className="text-slate-400 text-sm"> (video link placeholder)</em>);
    } else {
      // Fallback for any part of the match not specifically handled (should be rare with this regex)
      nodes.push(fullMatch);
    }
    lastIndex = lineParsingRegex.lastIndex;
  }

  // Add any remaining plain text after the last match
  if (lastIndex < lineText.length) {
    nodes.push(lineText.substring(lastIndex));
  }
  
  // Wrap in fragments to ensure stable keys if some nodes are just strings
  return nodes.map((node, idx) => <React.Fragment key={`${baseKey}-segment-${idx}`}>{node}</React.Fragment>);
};


// Helper component to render content with parsed links, placeholders, line breaks, AND hyphenated lists
const ContentRenderer: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];

  const flushList = (keySuffix: string) => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`ul-${keySuffix}`} className="list-disc list-outside pl-5 my-2 space-y-1">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, index) => {
    const listItemMatch = line.match(/^(\s*)-\s+(.*)/); // Detects lines like "  - Item content"

    if (listItemMatch) {
      const itemContent = listItemMatch[2]; // Content of the list item
      const processedItemContent = processLineContentForLinksAndPlaceholders(itemContent, `li-ctx-${index}`);
      currentListItems.push(
        <li key={`li-item-${index}`} className="text-slate-300 leading-relaxed">
          {processedItemContent}
        </li>
      );
    } else {
      flushList(`before-line-${index}`); 
      
      const processedLine = processLineContentForLinksAndPlaceholders(line, `line-ctx-${index}`);
      elements.push(<React.Fragment key={`line-frag-${index}`}>{processedLine}</React.Fragment>);
      
      if (index < lines.length - 1 && line.trim() !== '') { 
         elements.push(<br key={`br-${index}`} />);
      }
    }
  });

  flushList(`final`); 

  return <>{elements}</>;
};


const SectionComponent: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} aria-labelledby={`${id}-heading`} className="mb-10 scroll-mt-20">
    <h2 id={`${id}-heading`} className="text-3xl font-bold text-sky-300 mb-6 pb-2 border-b border-slate-700">{title}</h2>
    {children}
  </section>
);

const PlayCardComponent: React.FC<{ id: string; title: string; objective?: string; whenToUse?: string; children: React.ReactNode }> = ({ id, title, objective, whenToUse, children }) => (
  <div id={id} className="bg-slate-800/80 p-6 rounded-xl shadow-xl border border-slate-700/80 mb-8 transition-all duration-300 hover:border-sky-600/70 hover:shadow-sky-500/20 scroll-mt-20">
    <h3 id={`${id}-heading`} className="text-2xl font-semibold text-sky-400 mb-3">{title}</h3>
    {objective && <p className="text-slate-300 mb-2 italic"><strong className="text-sky-300/90 font-medium">Objective:</strong> <ContentRenderer text={objective} /></p>}
    {whenToUse && <p className="text-slate-300 mb-4 italic"><strong className="text-sky-300/90 font-medium">When to use this play:</strong> <ContentRenderer text={whenToUse} /></p>}
    {children}
  </div>
);

const TopicComponent: React.FC<{ id: string; title: string; objective?: string; children: React.ReactNode }> = ({ id, title, objective, children }) => (
 <div id={id} className="bg-slate-800/60 p-5 rounded-lg shadow-lg border border-slate-700 mb-6 scroll-mt-20">
    <h3 id={`${id}-heading`} className="text-xl font-semibold text-sky-400 mb-3">{title}</h3>
    {objective && <p className="text-slate-300 mb-3 italic"><strong className="text-sky-300/90 font-medium">Objective:</strong> <ContentRenderer text={objective} /></p>}
    {children}
  </div>
);

const StepByStepGuide: React.FC<{ steps: string[] }> = ({ steps }) => (
  <>
    <h4 className="text-lg font-medium text-sky-300 mt-4 mb-2">Step-by-Step Guide:</h4>
    <ol className="list-decimal list-inside space-y-3 mb-4 pl-4 text-slate-300 leading-relaxed">
      {steps.map((step, index) => (
        <li key={index} className="pl-2">
          <ContentRenderer text={step} />
        </li>
      ))}
    </ol>
  </>
);

const PreformattedText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-700/60 p-4 rounded-md overflow-x-auto font-mono text-sm text-slate-200 my-4 border border-slate-600 shadow-inner">
        <code>{children}</code>
    </pre>
);

interface TocItem {
  id: string;
  title: string;
  level: 1 | 2;
}

const tocData: TocItem[] = [
  { id: 'understanding-role', title: '1. Understanding the Contract Admin Role', level: 1 },
  { id: 'key-processes', title: '2. Key Contract Processes (Plays)', level: 1 },
  { id: 'play-nda', title: 'Play: How to Order an NDA', level: 2 },
  { id: 'play-internal-amendment', title: 'Play: Internal Amendment Process', level: 2 },
  { id: 'play-submit-contracts', title: 'Play: Submitting Contracts for New Partners', level: 2 },
  { id: 'play-charging-contracts', title: 'Play: Charging Contracts (Standard)', level: 2 },
  { id: 'play-nsf', title: 'Play: Handling Insufficient Funds (NSF)', level: 2 },
  { id: 'play-billing-concerns', title: 'Play: Handling Billing Concerns', level: 2 },
  { id: 'financial-strategies', title: '3. Key Financial Strategies', level: 1 },
  { id: 'topic-order-bookings', title: 'Topic: 1st Order vs. 2nd Order Bookings', level: 2 },
  { id: 'topic-billing-strategy', title: 'Topic: Invoiced vs Instant Billing', level: 2 },
  { id: 'tools-best-practices', title: '4. Critical Tools & Best Practices', level: 1 },
  { id: 'topic-naming-convention', title: 'Topic: Naming Convention for Contracts', level: 2 },
  { id: 'topic-approval-docs', title: 'Topic: General Approval Documentation', level: 2 },
  { id: 'dealcrafting-limitations', title: '5. Dealcrafting Limitations', level: 1 },
  { id: 'continuous-learning', title: '6. Continuous Learning & Resources', level: 1 },
];

const MicrolearningSearch: React.FC<{ searchTerm: string; onSearchChange: (term: string) => void }> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="mb-6">
      <label htmlFor="microlearning-search" className="sr-only">Search Microlearning Content</label>
      <input
        type="search"
        id="microlearning-search"
        placeholder="Search topics..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full p-3 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors placeholder-slate-400"
      />
    </div>
  );
};

const TableOfContents: React.FC<{ items: TocItem[]; activeId: string | null; onItemClick: (id: string) => void }> = ({ items, activeId, onItemClick }) => {
  if (!items.length) {
    return <p className="text-slate-400 text-sm">No matching topics found.</p>;
  }
  return (
    <nav aria-label="Microlearning Table of Contents">
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                onItemClick(item.id);
              }}
              className={`block rounded-md p-2.5 text-sm transition-colors duration-150 ease-in-out
                ${item.level === 2 ? 'ml-4' : ''}
                ${activeId === item.id 
                  ? 'bg-sky-500 text-white font-semibold shadow-md' 
                  : 'text-sky-200 hover:bg-slate-700 hover:text-sky-100'
                }`}
              aria-current={activeId === item.id ? 'location' : undefined}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};


const MicrolearningPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTocId, setActiveTocId] = useState<string | null>(null);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const filteredTocItems = useMemo(() => {
    if (!searchTerm) return tocData;
    return tocData.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const handleTocItemClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // setActiveTocId(id); // Set active immediately for better UX, observer will confirm
      if (window.innerWidth < 1024) setIsMobileTocOpen(false); // Close mobile ToC on click
    }
  };
  
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
           // Prioritize entries that are more visible or higher up in the viewport.
          const visibleEntries = entries.filter(e => e.isIntersecting);
          if (visibleEntries.length > 0) {
            // Find the top-most visible entry
            visibleEntries.sort((a,b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
            setActiveTocId(visibleEntries[0].target.id);
          }
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      rootMargin: '-20% 0px -70% 0px', 
      threshold: 0.1 
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = tocData.map(item => document.getElementById(item.id)).filter(el => el !== null) as Element[];
    
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);


  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="lg:hidden mb-6">
          <button
            onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
            className="w-full p-3 bg-slate-700 text-sky-200 rounded-lg flex justify-between items-center"
            aria-expanded={isMobileTocOpen}
            aria-controls="mobile-toc-container"
          >
            {isMobileTocOpen ? 'Hide' : 'Show'} Table of Contents
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 transition-transform ${isMobileTocOpen ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {isMobileTocOpen && (
            <div id="mobile-toc-container" className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <MicrolearningSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
              <TableOfContents items={filteredTocItems} activeId={activeTocId} onItemClick={handleTocItemClick} />
            </div>
          )}
        </div>

      <div className="flex flex-col lg:flex-row lg:gap-8">
        <aside className="hidden lg:block lg:w-1/4 lg:sticky lg:top-8 self-start h-[calc(100vh-4rem)] overflow-y-auto p-1 pr-4 rounded-lg scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-700">
           <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
            <MicrolearningSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            <TableOfContents items={filteredTocItems} activeId={activeTocId} onItemClick={handleTocItemClick} />
           </div>
        </aside>

        <main className="lg:w-3/4 prose prose-slate prose-invert 
                        prose-headings:text-sky-400 prose-a:text-sky-400 prose-strong:text-sky-300 
                        prose-ul:list-disc prose-ol:list-decimal
                        prose-li:my-1
                        selection:bg-sky-500 selection:text-white leading-relaxed">
      
          <p className="text-lg text-slate-300 mb-8 text-center bg-slate-800/50 p-4 rounded-lg border border-slate-700 shadow-md">
            Welcome! As a Contract Administrator, you are a crucial guardian of our agreements, ensuring precision and smooth processing for all our partners. This document will guide you through key manual processes and essential knowledge to excel in your role.
          </p>

          <SectionComponent id="understanding-role" title="1. Understanding the Contract Admin Role">
            <p>Think of a Contract Administrator as the guardian of agreements for a company. Just like a librarian meticulously organizes books so anyone can find what they need, a Contract Admin ensures that all agreements (contracts!) are accurate, properly processed, and easily accessible. They make sure the company's promises and expectations, and those of its partners, are clearly understood and followed. This is especially important when dealing with lots of manual steps, as precision prevents mix-ups and keeps everything running smoothly.</p>
          </SectionComponent>

          <SectionComponent id="key-processes" title="2. Key Contract Processes (Plays)">
            <p className="mb-6">In a role with many manual processes, having clear, step-by-step guides is like having a recipe for every dish you need to make. We call these "plays" because they lay out exactly how to execute a specific contract-related task, from start to finish. They streamline operations by ensuring everyone follows the same, correct procedure, reducing errors and making training new hires much easier.</p>
            
            <PlayCardComponent 
              id="play-nda"
              title="Play: How to Order a Non-Disclosure Agreement (NDA)"
              objective="To ensure all required Non-Disclosure Agreements are accurately generated, sent for signature, and properly archived."
              whenToUse="When a new partner or signatory requires a mutual NDA before proceeding with discussions or agreements."
            >
              <StepByStepGuide steps={[
                "**Partner Center Order as Call to Action:** The NDA order will typically show up as an order in Partner Center; this is your call to action to start the process. The order form in Partner Center will contain key information that will help you complete the NDA process.",
                "**Receive/Acknowledge NDA Requirement:** Acknowledge any direct request for an NDA from a signatory who requires it mutually, in addition to the Partner Center order.",
                "**Gather Information from Order Form:** Utilize the Partner Center order form as your primary source for all necessary NDA details (signatory names, addresses, etc.).",
                "**Utilize Standard Template:** Access and use the \"2021 - Vendasta Company Mutual NDA\" template.",
                "**Send via Adobe E-Sign:**\n  - Initiate the sending process through Adobe E-Sign. For a detailed guide, refer to: https://scribehow.com/shared/How_to_Request_E-Signatures_for_a_Mutual_NDA__8bX_P92dQQ6DcAqzQVz1_w\n  - Ensure a copy is sent to each requested signatory.\n  - Crucially, a copy must also be sent to Brian Shelton, who acts as Vendasta's official signatory.",
                "**Archive Signed NDAs:** Once actioned, all partner NDAs must be saved in the designated \"Legal Agreements > NDAs\" folder for future reference and compliance."
              ]} />
            </PlayCardComponent>

            <PlayCardComponent
              id="play-internal-amendment"
              title="Play: Internal Amendment Process"
              objective="To accurately process product adjustments, discounts, and corrective actions in the Billing Center, ensuring proper approvals and documentation."
            >
              <StepByStepGuide steps={[
                "**Verify Approvals:**\n  - Upon receiving a request for an Internal Amendment (e.g., for a discount, free product, or adjustment), the first action is to verify that all required approvals are in place.\n  - Check the Sales-Acquisition-Makeadeal Channel in GChat for the approval thread. You can search using the PID or Partner Name.\n  - This step is critical for any product being provided at no additional cost or with a discount.",
                "**Handle Missing Approvals:**\n  - If an approval thread is missing, notify the requesting rep immediately, as it's their responsibility to obtain the necessary approval for discounted or free products/onboarding.\n  - Do NOT proceed with charging or provisioning until the approval is in place.\n  - If the rep isn't posting for approval, or if you're unsure if a deal requires approval, the Contract Admin should consult the sales manager or director for guidance on how to proceed.",
                "**Link Approval Thread to VMF Order:**\n  - Once the approval thread is created and verified, link it in the Admin Notes Section of the VMF order.\n  - This ensures proper documentation and traceability for future reference.",
                "**Set Up Discounts/Adjustments in Billing Center:**\n  - Once approvals are verified and linked, the next step is to implement the approved discounts or adjustments in the Billing Center. This involves navigating to the relevant product or service and applying the agreed-upon changes.\n  - For monthly billed SKUs, ensure \"Reset Each Period\" is checked when provisioning discounts. For one-time or yearly billed SKUs, ensure this box is unchecked.",
                "**Upload Documentation (Internal Amendment):**\n  - After making the adjustments, upload all relevant internal amendment documentation (e.g., the signed amendment, approval thread screenshot) to both Drive and Billing Center, ensuring a complete and easily accessible record.",
                "**Notify Rep of Completion:**\n  - As a final confirmation, notify the requesting rep or operational stakeholder that the internal amendment request has been completed and the adjustments have been provisioned."
              ]} />
            </PlayCardComponent>

            <PlayCardComponent
              id="play-submit-contracts"
              title="Play: Submitting Contracts for New Partners in VMF (with Discounts and Custom Pricing)"
              objective="To accurately submit new partner contracts in VMF, ensuring all order details, including applicable discounts and custom pricing, are correctly reviewed, approved, and provisioned post-signature, understanding the nuances of different sales team workflows."
            >
              <StepByStepGuide steps={[
                "**Rep Creates Order:** The sales representative initiates the process by creating the order, providing quantities for O&O (Owned & Operated) and other additions. All product discounts, custom rates, or specific terminology should be entered in the Custom Pricing field of the order.",
                "**Workflow for Different Sales Teams:**\n  - High Velocity (HV) Sales Group: Are generally free to submit their own partnership agreements. However, some newer HV sales team members may still choose to come to the Contract Admin for review and submission before the contract goes out. Senior HV sales team members typically handle these submissions themselves.\n  - Agency and Vertical Sales Group: Should always be sending their partnership agreements to the Contract Admin to review prior to submission.",
                "**Rep Submits Order for Contract Admin Approval:** The rep submits the order, which then moves to a \"Pending\" status. This submission sends the order to the Contract Admin for review first, not directly to the partner for signing.",
                "**Admin Reviews Order & Checks for Approvals (Pre-Signature / Post-Signature for HV):** The Contract Admin's first step is to carefully review the order while it's in \"Pending\" status.\n  - The Custom Pricing field is the most crucial spot to review for accuracy.\n  - Crucially, the admin must check for approvals, but only if discounts or additional O&O products (Snapshots, Team Member Seats, or Standard Product) are being offered.\n  - Over time, the Contract Admin should develop the ability to identify what is considered standard within an agreement versus what is discounted or added as an incentive (\"fluff\") requiring specific approval.\n  - If this is a new Channel Partner Agreement, the approval will almost always live in the Sales-Acquisition-Makeadeal Channel in GChat.\n  - The Finance GChat space, on the other hand, typically contains approvals for credits and corrective actions, which is where an Internal Amendment would primarily come into play.\n  - Specific to High Velocity Agreements: Due to their rigid nature regarding what they can sell, Contract Admins may check for approval for High Velocity agreements after they've been signed.\n  - If no approval is found, follow the same steps as with Internal Amendments: notify the rep, do NOT proceed, and consult the sales manager or director if needed.\n  - Also, review the 1st Order and 2nd Order fields. These fields are manual in nature and do not auto-calculate; therefore, ensure they are converted properly (e.g., from CAD to USD) if applicable. This manual conversion requires careful attention to detail.",
                "**Send for Customer Approval:** After the Contract Admin's initial review and approval verification, the order is sent for customer approval and signing.",
                "**Partner Signs Contract:** The partner reviews and signs the contract.",
                "**Process Order & Provision Discounts (Post-Signature/Charging Phase):**\n  - Once the contract is signed and you are in the phase of charging the contract, the Contract Admin proceeds to process the order in VMF.\n  - This includes provisioning any approved discounts or setting up custom pricing in the Billing Center, ensuring all details are accurate and aligned with the signed agreement.\n  - For detailed visual steps on how to create and save a discount (how to discount the wholesale rate from the full wholesale rate), please refer to steps 24-33 in the \"Guide to Adding Discounts and Promotions in Vendasta Platform\" Scribe guide: https://scribehow.com/viewer/Guide_to_Adding_Discounts_and_Promotions_in_Vendasta_Platform__s4-NmWM0Q1O0K76xDbZJMQ?referrer=documents&pdfPreview=false.\n  - If you are discounting full units or quantities, please refer to steps 166-180 in the same Scribe guide: https://scribehow.com/viewer/Guide_to_Adding_Discounts_and_Promotions_in_Vendasta_Platform__s4-NmWM0Q1O0K76xDbZJMQ?referrer=documents&pdfPreview=false as an example for a monthly billed product.\n  - Important for One-Time Products: If the product is one-time billed (like any Google product or Snapshot Reports), follow the same process for discounting full units/quantities, but ensure the \"Reset Each Period\" box is unchecked, as the product is only one-time billed and does not need to reset each month.\n  - The general charging process is demonstrated here: https://share.vidyard.com/watch/bfDYmakArWDwLdWNJ8ZrX1."
              ]} />
            </PlayCardComponent>

            <PlayCardComponent
              id="play-charging-contracts"
              title="Play: Charging Contracts (Standard)"
              objective="To successfully charge new partner contracts, ensuring all financial details are accurate, payment methods are verified, and relevant stakeholders are informed."
            >
              <StepByStepGuide steps={[
                "**Review Signed Contract & Verified Approvals:** Ensure the contract is fully signed, and all necessary approvals (especially for discounts or custom pricing) are in place, as previously discussed.",
                "**Verify Rates and Timelines:** Double-check all product, add-on rates, and charging timelines as stipulated in the agreement.",
                "**Payment Method Confirmation:** This is a critical step:\n  - For Credit Card Payments: Go into the Billing Center > Partner's PID > Payments Tab, and check to see if a Credit Card is correctly entered into the platform.\n  - For Invoiced Partners (Non-ACH/Wire): Verify with the representative (rep) that a Credit Application is with the partner.\n  - For Invoiced Partners (ACH/Wire Transfer): Verify with Julie Gregorash and the rep that all pertaining documentation is with the partner.",
                "**Process Charging:** Once all checks are complete, proceed with charging the contract in the system. The process is demonstrated here: https://share.vidyard.com/watch/bfDYmakArWDwLdWNJ8ZrX1.",
                "**Communicate Completion:** Inform the representative that the contract has been successfully charged.",
                "**Handle Insufficient Funds/Errors (Future Step):** Be prepared to follow procedures for issues like insufficient funds, which we will detail in the next play."
              ]} />
            </PlayCardComponent>

            <PlayCardComponent
              id="play-nsf"
              title="Play: Handling Insufficient Funds (NSF) & Other Payment Declines"
              objective="To identify payment decline notifications (NSF or other Stripe errors) promptly, use appropriate resources for diagnosis, and communicate effectively with the sales representative to ensure successful retry or resolution."
            >
                <StepByStepGuide steps={[
                    "**Check Payment Status & Identify Error:**\n  - Navigate to Billing Center > Partner's PID > Payments Tab.\n  - Look for a Stripe notification within the message of the purchase attempt.\n  - If it says \"Charge Succeeded,\" the card has gone through successfully.\n  - If you see an \"NSF\" (Insufficient Funds) notification, this is a specific type of decline.\n  - Other messages from Stripe indicate a different type of payment decline.",
                    "**Handle Non-NSF Decline Codes (If Applicable):**\n  - If the error message is **not** \"Insufficient Funds,\" this is your first point of reference: https://docs.stripe.com/declines/codes. Use this guide to understand the specific decline code.\n  - **Important:** In 99% of these non-NSF decline cases, the partner (card owner) will need to contact their financial institution (bank) to resolve the issue.\n  - **Best Practice:** Provide a screenshot of the specific error code/message to the sales representative. Advise the rep to inform the partner about the decline and instruct them to contact their bank, referencing the error details you provided.",
                    "**Notify the Representative (Rep) for NSF or After Other Errors are Addressed:**\n  - **For NSF:** Once an NSF is identified, immediately inform the relevant sales representative about the insufficient funds.\n  - **For Other Declines:** After you've consulted the Stripe documentation and guided the rep (who then guides the partner), if the issue persists or requires further rep intervention with the partner, ensure the rep is fully informed.\n  - It is ultimately the rep's responsibility to communicate with the partner regarding any payment issue and the steps needed for resolution.",
                    "**Await Instruction for Retry:**\n  - The rep will inform you when it is appropriate to retry the charge (after the partner has resolved the issue with their bank or updated payment information).\n  - Do **not** attempt a retry until instructed by the rep.\n  - The general process for NSF identification and rep communication is also covered in this video: https://share.vidyard.com/watch/aJ1jTngsmzFfv9uCyRnpu5."
                ]} />
            </PlayCardComponent>

            <PlayCardComponent
              id="play-billing-concerns"
              title="Play: Handling Billing Concerns - Crediting Erroneous Amounts"
              objective="To accurately submit requests for crediting erroneous amounts due to human error or other specified reasons, ensuring proper approvals and detailed documentation."
            >
                <StepByStepGuide steps={[
                    "**Initiate Approval Thread in Finance:**\n  - Start an approval thread in the Finance GChat space.\n  - Include the PID (Partner Identifier), Invoice # or Purchase ID (which can be found in Billing Center Purchases or Sales Invoices tabs), and the price total of the credit.\n  - Provide a clear reason or rationale behind the credit. Don't hesitate to state if an error was made, as these are easily fixed.",
                    "**Access Billing Concern Form:** Locate and open the Billing Concern form.",
                    "**Select \"Give the Partner a credit/discount/refund (up to 3 months)\" Option:** On the first page of the form, choose this specific option.",
                    "**Complete Second Page of Form:**\n  - Enter the PID and Partner Name.\n  - Select \"Finance Team (other)\" from the \"Approved By\" dropdown menu.\n  - Under \"Approval Details,\" provide the URL or link to your approval thread in Finance.\n  - Under \"What,\" specify if you are crediting subscription, O&O Products, or Third Party (non-Vendasta) products.\n  - Provide the Past Invoice or Purchase ID number.\n  - Under the \"Why\" dropdown menu, you can choose \"Human Error\".\n  - Under \"Why are we doing this\" question, provide a full description like you did for the approval thread.\n  - Verify with the rep if the credit will be applied to their Credit Card, or as vCash towards their next activation/purchase.\n  - Provide the How Much quantity, and all fields relating to Partner Relations should be 'No'.",
                    "**Complete Third Page of Form & Submit:**\n  - Skip directly to Page 3.\n  - Provide the full breakdown here (this is where you'll provide Invoices, totals, product SKUs if absolutely required). If it's straightforward, just copy what you put in the approval thread and paste it here.\n  - Hit Submit!"
                ]} />
            </PlayCardComponent>
          </SectionComponent>

          <hr className="border-slate-700 my-12" />

          <SectionComponent id="financial-strategies" title="3. Key Financial Strategies">
            <TopicComponent
                id="topic-order-bookings"
                title="Topic: 1st Order vs. 2nd Order Bookings"
                objective="To understand the distinction between initial sales and subsequent expansions, which impacts financial reporting."
            >
                <p className="mb-2"><strong className="font-semibold text-sky-300">1st Order Bookings:</strong> This typically refers to the initial sale to a new partner or customer. It's the revenue generated from their very first agreement, often encompassing the initial subscription and onboarding fees. Think of it as the "new business" revenue.</p>
                <p className="mb-2"><strong className="font-semibold text-sky-300">2nd Order Bookings:</strong> This refers to additional sales or expansions made to existing partners. This is all about the product-based revenue or "product commitments" (e.g., upgrades, add-ons, new products) that come after their initial agreement. This is often called "expansion revenue" or "upsell/cross-sell."</p>
                <p>Understanding this distinction is valuable as it helps you appreciate how your careful processing of each contract contributes to different revenue streams and the overall financial picture of the company.</p>
            </TopicComponent>

            <TopicComponent
                id="topic-billing-strategy"
                title="Topic: Invoiced vs Instant Billing Strategy & Setup"
                objective="To understand the two primary billing strategies (Instant and Invoiced), their implications for processing payments, and the steps to correctly set them up in the Billing Center."
            >
                <h4 className="text-lg font-medium text-sky-300 mt-4 mb-2">Key Strategies & Setup Steps:</h4>
                <div className="mb-4">
                    <h5 className="text-md font-semibold text-sky-200 mb-1">Invoiced Billing:</h5>
                    <ContentRenderer text={
`- This is like receiving a traditional bill at the end of a period (e.g., end of month). "Invoiced means that all transactions that occur in billing center, end up on one EOM [End of Month] invoice."
- **Requirement:** All instances of Invoiced Billing require a credit application to be filled out by the partner.
- **Default Payment Terms:** The default Net days to pay an invoice on Invoiced billing is 10 days. However, more or fewer payment days may be requested and approved, depending on the agreement.
- **Setup in Billing Center:**
  - Once you verify with Julie Gregorash that the partner's credit application has been completed and approved, navigate to Billing Center > Partner's PID > Billing Strategy.
  - Adjust the billing strategy to "Invoiced."
  - Adjust all O&O (Owned & Operated) products (such as Snapshots, Team Members, and Standard Products) to be "End of Period" (this is functionally the same as "Invoiced" for these items).
- This strategy often involves ACH/Wire transfers, and requires ensuring proper documentation is with the partner.`
                    } />
                </div>
                <div>
                    <h5 className="text-md font-semibold text-sky-200 mb-1">Instant Billing:</h5>
                    <ContentRenderer text={
`- This is like paying for something online with a credit card – the transaction happens immediately, or very close to it.
- **Requirement:** For Instant billing, partners only need a credit card entered in the system to be charged.
- **Payment Terms:** They do not carry Net terms, as these transactions will always be instantaneous.
- It's generally a more automated and immediate process for the Contract Admin after the initial setup.`
                    } />
                </div>
            </TopicComponent>
          </SectionComponent>

          <hr className="border-slate-700 my-12" />

          <SectionComponent id="tools-best-practices" title="4. Critical Tools & Best Practices">
            <TopicComponent
              id="topic-naming-convention"
              title="Topic: Naming Convention for Contracts"
              objective="To standardize the naming of all contract documents for efficient organization, easy retrieval, and clear identification of document type and key details, referencing the official guidelines."
            >
                <p className="mb-3"><strong className="font-semibold text-sky-300">Overall Guidance:</strong> The naming conventions we've discussed so far have primarily focused on agreements related to Channel Partner Agreements (CPAs), such as new partner contracts and internal amendments. However, for a full operational list of all agreement naming conventions across the company, please refer to the comprehensive source document: "SB-Naming Convention for Contracts".</p>
                <p className="mb-3">This document is your gold standard for naming any type of agreement you encounter in your role. It covers a wide range of contract types, ensuring consistency across all departments.</p>
                
                <h4 className="text-lg font-medium text-sky-300 mt-4 mb-2">Standard Naming Convention Format for Sales Contracts (TOS, ORDER FORM, CP):</h4>
                <p className="mb-2">The general format follows this structure:</p>
                <PreformattedText>PID_Company-Name_YYYY-MM-DD_[CPA/TOS/Amend/Internal Amend]_[SubscriptionTier/Pricing].pdf</PreformattedText>
                <p className="mb-2">Let's break down each element:</p>
                <ContentRenderer text={
`- **[PID]:** This refers to the Partner Identifier.
- **[Company-Name]:** This clearly states the name of the partner the contract is with (e.g., Konstruct-Media).
- **[YYYY-MM-DD]:** This uses the year, month, and day to indicate the date of the agreement, ensuring chronological order (e.g., 2024-03-10, 2024-08-22).
- **[Type of Agreement]:** This crucial part identifies the specific nature of the document.
  - Examples from provided documents: TOS_Premium, TOS_Professional, Product-Commitment, InternalAmend, Additional-Market, Additional-Branded-PID, Premium-Reports
  - Your input additions: Pricing-Amendment, Base-Onboarding (for base implementation), Standard-Onboarding (for standard implementation), Advanced-Onboarding (for advanced implementation)
  - If a subscription is sold with a product commitment, only use the subscription name: TOS-Professional, TOS-Premium, TOS-Custom, etc.
  - NDA (for Non-Disclosure Agreement).`
                } />
                

                <h4 className="text-lg font-medium text-sky-300 mt-4 mb-2">Key Naming Conventions from the Official Document by Type:</h4>
                <div className="space-y-3">
                    <div>
                        <h5 className="text-md font-semibold text-sky-200 mb-1">Sales Contract (TOS, ORDER FORM, CP):</h5>
                        <PreformattedText>Format: PID_Company-Name_YYYY-MM-DD [CPA/TOS/Amend/Internal Amend]_[SubscriptionTier/Pricing].pdf</PreformattedText>
                        <p>Examples: <ContentRenderer text="ERIC_Konstruct-Media_2024-03-10_TOS_Premium.pdf, ERIC_Konstruct-Media_2024-08-22_TOS_Professional.pdf, ERIC_Konstruct-Media_2024-09-15_Product-Commitment.pdf" /></p>
                        <p>All actioned (signed or internal) sales contracts are uploaded here: Executed Agreements by Company</p>
                    </div>
                    <div>
                        <h5 className="text-md font-semibold text-sky-200 mb-1">Amendment Files/Additional Markets/Premium Reports:</h5>
                        <p>Examples: <ContentRenderer text="ERIC_Konstruct-Media_2024-09-15_InternalAmend.pdf, ERIC_Konstruct-Media_2024-09-15_Product-Commitment.pdf, ERIC_Konstruct-Media_2024-09-15_Additional-Market.pdf, ERIC_Konstruct-Media_2024-09-15_Additional-Branded-PID.pdf, ERIC_Konstruct-Media_2024-09-15_Premium-Reports.pdf" /></p>
                    </div>
                    <div>
                        <h5 className="text-md font-semibold text-sky-200 mb-1">Non Disclosure Agreement (NDA)/ Confidentiality Agreement:</h5>
                        <ContentRenderer text={
`- **Investment Related:** YYYY.MM.DD Investor NDA INVESTOR_NAME (Example: 2019.01.01 Investor NDA Birds) - Uploaded here: Investor NDAs executed
- **Sales Related:** YYYY.MM.DD Partner NDA PARTNER_NAME (Example: 2000.01.01 Partner NDA Frankly) - Uploaded here: All other NDAs executed
- **Operational/Service Related:** YYYY.MM.DD Other NDA VENDOR_NAME (Example: 2019.02.02 Other NDA CapShare)`
                        } />
                    </div>
                    <div>
                        <h5 className="text-md font-semibold text-sky-200 mb-1">MARKETPLACE (VENDOR DISTRIBUTION AGREEMENT):</h5>
                        <PreformattedText>Format: YYYY.MM.DD Marketplace VDA VENDOR_NAME PARNER_NAME (if applicable)  (or with AmendX for amendments )</PreformattedText>
                        <p>Example: <ContentRenderer text="2017.07.25 Marketplace VDA Boostability" /></p>
                        <p>Related Billing Center Naming: <ContentRenderer text="PID_Vendor-Name_2024-01-01_Vendor-Distribution-Agreement" /></p>
                    </div>
                    <p className="italic">Operational/Service/Supplier Contracts, Employment Agreement, Marketing/Conquer Local sections also exist in the full document with specific formats.</p>
                </div>
            </TopicComponent>

            <TopicComponent
                id="topic-approval-docs"
                title="Topic: General Approval Documentation - Differentiated by Sales Group"
                objective="To understand the specific approval processes and hierarchies for different sales teams (High Velocity vs. Agency/Vertical), ensuring correct approvals are obtained for various deal types. It also clarifies the responsibilities of reps and sales managers in the discount approval process and the underlying sales philosophy."
            >
                <h4 className="text-lg font-medium text-sky-300 mt-4 mb-2">Foundational Sales Responsibility for Discounts:</h4>
                <p className="mb-3">As a crucial responsibility, reps need to understand that their focus should be on selling solutions while simultaneously maximizing profit. This inherently means they must focus on rationalizing what is being discounted, ensuring a balance between client needs and company profitability.</p>
                
                <h4 className="text-lg font-medium text-sky-300 mt-4 mb-2">Crucial Responsibility for Discounts (Detailed):</h4>
                <ContentRenderer text={
`- Reps are responsible for rationalizing the discounts.
- Sales managers are responsible for rationalizing and approving the discounts, using the current cost structure as well as the margin point behind the deal.`
                }/>
                

                <div className="mb-4 p-4 bg-slate-700/40 rounded-md border border-slate-600">
                    <h5 className="text-md font-semibold text-sky-200 mb-2">1. Approval Guidelines for Agency + Vertical Sales Group:</h5>
                    <p className="mb-2 text-sm">These guidelines apply to deals originating from the Agency and Vertical sales teams, with approval levels determined by the total margin per deal.</p>
                    <p className="font-medium">Total Margin per Deal & Required Approval Level:</p>
                    <ContentRenderer text={
`- Total margin between 65% and 75%: **Level 1 Approval**
- Total margin between 45% and 65%: **Level 2 Approval**
- Total margin below 45%: **Level 3 Approval**`
                    } />
                    <p className="font-medium">Approvers by Level:</p>
                     <ContentRenderer text={
`- **Level 1 Approvers:** Head of Sales (High Velocity - Spencer Krieger, Vertical Acquisition - Jeff Leach, Vertical Expansion - Desiree Kupietz, Global - Brad Petersen, Agency - Jeff Leibel)
- **Level 2 Approver:** CRO Jackie Wandzura
- **Level 3 Approvers:** CFO/CEO Brian Shelton/Brendan King`
                    } />
                    <p className="font-medium mt-2">Other Parameters Requiring Specific Approval:</p>
                    <ContentRenderer text={
`- **Executive Sponsorship:** Level 3
- **Custom Development:** Level 3
- **Integration & implementation support (Professional Services):** Level 3
- **Custom contract language:** Level 3
- **Credit Approval Policy:** This will be amended and will cover one-time giveaways`
                    } />
                </div>
                
                <div className="p-4 bg-slate-700/40 rounded-md border border-slate-600">
                    <h5 className="text-md font-semibold text-sky-200 mb-2">2. Approval Guidelines for High Velocity (HV) Sales Group:</h5>
                    <p className="mb-2 text-sm">These guidelines are specific to deals originating from the High Velocity sales team, with approval levels tied to the target margin.</p>
                    <p className="font-medium">Target Margin & Approval Level:</p>
                    <ContentRenderer text={
`- Total margin is above 80%: **Level 1**
- Total margin is between 70% and 80%: **Level 2**
- Total Margin is between 60% and 70%: **Level 3**
- Total Margin is below 60%: **Level 4**`
                    } />
                    <p className="font-medium">Approvers by Level:</p>
                    <ContentRenderer text={
`- **Level 1 Approvers:** Level 3 AEs
- **Level 2 Approvers:** Director of Sales (Spencer) / Account Executive Manager (Megan)
- **Level 3 Approvers:** Jackie / Sandy
- **Level 4 Approvers:** Brendan / Brian`
                    } />
                </div>
            </TopicComponent>
          </SectionComponent>
          
          <hr className="border-slate-700 my-12" />

          <SectionComponent id="dealcrafting-limitations" title="5. Dealcrafting Limitations - Billing System Limitations">
            <p className="mb-3">**Objective:** To quickly understand the main limitations of our automated billing system, so you know when manual tracking or specific deal structuring is required. This helps you review contracts accurately and anticipate challenges.</p>
            <p className="mb-4">Think of our billing system as a very capable, but sometimes particular, assistant. It can do most things, but some complex deal structures or specific timings require a human touch (often from the sales rep, with your awareness!). Here are the main limitations you should know about:</p>
            <ContentRenderer text={
`- **No Discounting Within the First 30 Days of Activation:** Our system cannot apply discounts to products within their first 30 days of activation , nor can it bill within 30 days of a new product's activation. This means we can't offer traditional "30-day free trials" via the system. Please offer a short-term discount instead of trialing products for 30 days.
- **No Bundling Products at a Single Price:** You cannot group two or more different products together and sell them for one combined price. Each product requires its own respective price. This is not only a limitation in the platform but also does not properly showcase the cost savings to the partner as intended. We can only provide value-based discounts (either "Fixed" or "Percent") for X number of units.
- **Manual Tracking for Complex Commitments (QCR Tracked):** Our system can't automatically track several types of complex commitments. These often require the sales rep to manually follow up and track progress (known as QCR Tracking), and you need to be aware of them:
  - **Monthly Minimums/Spending Targets:** If a partner commits to spending a certain amount per month, our system won't automatically invoice them if they fall short. The rep needs to manage this with a follow-up.
  - **If/Then Statements:** Our system cannot support the use of if/then conditions when pricing these items out. Try to avoid using these, unless you are ready to manually track them. These cases need to be manually tracked (QCR tracked) if we wish to hold the partners to these agreements.
  - **Tiered Pricing vs. Stairstep Pricing:** Our system prevents automating group conditions from stairstep pricing. It supports "Stairstep Pricing" (where different price points apply to different blocks of units, e.g., first 20 at $10, next 10 at $8.50) but not "Tiered Pricing" (where a single price applies to all units once a certain volume is hit). If you require tiered pricing for a partner, you will need to track this manually, and submit a Billing Concern to correct their billing.
  - **BOGO (Buy One Get One Free) Deals:** Manual tracking is needed for free units provided. The additional free units are charged when the partner is ready to activate them.`
            }/>
          </SectionComponent>
          
          <hr className="border-slate-700 my-12" />

          <SectionComponent id="continuous-learning" title="6. Continuous Learning & Resources (Contract Administrator Training & Procedures)">
            <p className="mb-3">**Objective:** To recognize that this microlearning document is a starting point, and that continuous learning and utilization of available resources are vital for success and growth in the Contract Admin role.</p>
            <p className="mb-4">Your role as a Contract Administrator is dynamic, and processes can evolve. This microlearning document provides a strong foundation for the most critical manual processes and concepts. To continue growing and staying up-to-date, remember to:</p>
             <ContentRenderer text={
`- Ask 
- **Utilize Training Materials:** Access any official "Contract Administrator Training & Procedures"  or other internal training modules provided in the Confluence link, which can found on the 'Quick Links' tab.
- **Leverage Internal Experts:** Don't hesitate to reach out to specific individuals or teams known for their expertise (e.g., Emily Howe for platform billing, Spencer or Megan for certain approvals, as discussed in the plays) when you have questions or need clarification.
- **Engage in Team Discussions:** Participate in team meetings and discussions to learn from shared experiences and stay informed about updates or new challenges.`
            }/>
            <p className="mt-4">By embracing continuous learning, you'll become an even more efficient and invaluable part of the team.</p>
          </SectionComponent>

        </main>
      </div>
    </div>
  );
};

export default MicrolearningPage;
