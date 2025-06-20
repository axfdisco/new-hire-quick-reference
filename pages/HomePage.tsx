
import React from 'react';
import { LinkCard } from '../components/LinkCard';
import { GChatIcon } from '../components/icons/GChatIcon';
import { DocumentIcon } from '../components/icons/DocumentIcon';
// import { GmailFilterIcon } from '../components/icons/GmailFilterIcon'; // Removed as no longer used
import { BuildingIcon } from '../components/icons/BuildingIcon'; // New Icon

const HomePage: React.FC = () => {
  const gchatLink = "https://chat.google.com";
  const confluenceLink = "https://vendasta.jira.com/wiki/spaces/SB/pages/1830814148/Contract+Process+Plays";
  
  // Removed createGmailFilterLink as it's no longer used
  // const createGmailFilterLink = (criteria: string) => {
  //   return `https://mail.google.com/mail/u/0/#settings/filters/new?search=${encodeURIComponent(criteria)}`;
  // };

  // const exampleFilterCriteria = "from:(afillo@vendasta.com)"; // Removed as no longer used

  const partnerCenterUrl = "https://partners.vendasta.com/";
  const legalAgreementsDriveUrl = "https://drive.google.com/drive/folders/0AHFDd277lxnHUk9PVA";
  const cpasDriveUrl = "https://drive.google.com/drive/folders/1dB0qLeslXWB0g_mmsKnuDEGDfznGGC8t";
  const ndasDriveUrl = "https://drive.google.com/drive/folders/0B1pI9Jnj1ER5aktRWklnbVFDNzQ?resourcekey=0-17inbM4PWfhCrzS225y6Gg";


  return (
    <>
      <main className="w-full max-w-2xl lg:max-w-3xl space-y-6 sm:space-y-8">
        <LinkCard
          title="Google Chat"
          description="Connect with your team, ask questions, and collaborate in real-time. Your primary communication hub."
          href={gchatLink}
          icon={<GChatIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
          ctaText="Open GChat"
        />
        <LinkCard
          title="Historical Process Plays (Confluence)"
          description="Full of other historical documentation and SOPs for various forms of edge cases that you will eventually be accustomed to in the role. You aren't expected to know all of this right away, as these items are gradually learned. It is to serve as a reference for various edge cases that you may come across. Alternatively you can ask Andrew Fillo and will point you in the correct direction."
          href={confluenceLink}
          icon={<DocumentIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
          ctaText="View Confluence Page (New Tab)"
        />
        <LinkCard
          title="Pending Orders (VMF)"
          description="Access pending orders requiring action. In VMF (ensure PID is 'VMF'; switch from 'VA' if needed by clicking top-left logo area), go to Commerce > Orders & filter by 'Pending'."
          href={partnerCenterUrl} // Link to Partner Center, VMF is a state within
          icon={<DocumentIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
          ctaText="Go to Partner Center"
        />
         <LinkCard
          title="Partner Center"
          description="Main portal for partner tasks. Ensure you operate within the VMF PID (select/search 'VMF' in top-left logo area; switch from 'VA' if necessary) for all contract-related activities."
          href={partnerCenterUrl}
          icon={<BuildingIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
          ctaText="Open Partner Center"
        />
        <LinkCard
          title="Legal Agreements (Drive)"
          description="Main Google Drive folder for all legal agreements. Contract-related work associated with these documents is typically done in the VMF PID."
          href={legalAgreementsDriveUrl}
          icon={<DocumentIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
          ctaText="Open Legal Agreements"
        />
        <LinkCard
          title="CPAs Folder (Drive)"
          description="Houses Internal/Signed Amendments, CPAs, and Volume Commitments, organized by partner. Create new folders for new partners. VMF PID is relevant for associated contract tasks."
          href={cpasDriveUrl}
          icon={<DocumentIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
          ctaText="Open CPAs Folder"
        />
        <LinkCard
          title="NDAs Folder (Drive)"
          description="Repository for actioned NDAs. Most are filed under 'All Other NDAs Executed' (prospects); Investor NDAs are infrequent. VMF PID is relevant for associated contract tasks."
          href={ndasDriveUrl}
          icon={<DocumentIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
          ctaText="Open NDAs Folder"
        />
        {/* Gmail Filter Setup Card Removed */}
      </main>
    </>
  );
};

export default HomePage;
