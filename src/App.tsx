import React, { useState, useEffect } from 'react';
import { ModalityType, StudentApplication } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeSections } from './components/HomeSections';
import { EnrollmentForm } from './components/EnrollmentForm';
import { ConfirmationStep } from './components/ConfirmationStep';
import { ProtocolQueryModal } from './components/ProtocolQueryModal';
import { DirectorPortal } from './components/DirectorPortal';
import { AdminPortal } from './components/AdminPortal';

export default function App() {
  const [viewMode, setViewMode] = useState<'home' | 'form' | 'confirmation'>('home');
  const [selectedModality, setSelectedModality] = useState<ModalityType>('educacao-infantil');

  // Confirmation state
  const [confirmationData, setConfirmationData] = useState<{
    protocol: string;
    application: StudentApplication;
  } | null>(null);

  // Modal Visibility States
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [protocolQueryCode, setProtocolQueryCode] = useState('');
  const [isDirectorPortalOpen, setIsDirectorPortalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  // Check URL pathname for hidden route /adminaccess or hash #adminaccess
  useEffect(() => {
    const checkHiddenAdminRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('/adminaccess') || hash.includes('adminaccess')) {
        setIsAdminPortalOpen(true);
      }
    };
    checkHiddenAdminRoute();
    window.addEventListener('popstate', checkHiddenAdminRoute);
    return () => window.removeEventListener('popstate', checkHiddenAdminRoute);
  }, []);

  const handleSelectModality = (modality: ModalityType) => {
    setSelectedModality(modality);
    setViewMode('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSuccess = (result: { protocol: string; application: StudentApplication }) => {
    setConfirmationData(result);
    setViewMode('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchProtocol = (code: string) => {
    setProtocolQueryCode(code);
    setIsProtocolModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col text-indigo-950 font-sans antialiased selection:bg-indigo-300 selection:text-indigo-950">
      {/* Top Main Navigation Header */}
      <Header
        onGoHome={() => setViewMode('home')}
        onOpenConsult={() => {
          setProtocolQueryCode('');
          setIsProtocolModalOpen(true);
        }}
        onOpenDirectorLogin={() => setIsDirectorPortalOpen(true)}
      />

      {/* Main Page Layout Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {viewMode === 'home' && (
          <HomeSections
            onSelectModality={handleSelectModality}
            onSearchProtocol={handleSearchProtocol}
          />
        )}

        {viewMode === 'form' && (
          <EnrollmentForm
            modality={selectedModality}
            onBack={() => setViewMode('home')}
            onSuccess={handleFormSuccess}
          />
        )}

        {viewMode === 'confirmation' && confirmationData && (
          <ConfirmationStep
            protocol={confirmationData.protocol}
            application={confirmationData.application}
            onGoHome={() => setViewMode('home')}
            onConsultNow={(code) => {
              setProtocolQueryCode(code);
              setIsProtocolModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer with Discreet School Director Access Link */}
      <Footer
        onOpenDirectorLogin={() => setIsDirectorPortalOpen(true)}
        onOpenAdminAccess={() => setIsAdminPortalOpen(true)}
      />

      {/* Protocol Query Status Modal */}
      <ProtocolQueryModal
        isOpen={isProtocolModalOpen}
        initialProtocol={protocolQueryCode}
        onClose={() => setIsProtocolModalOpen(false)}
      />

      {/* School Directors Management Area */}
      <DirectorPortal
        isOpen={isDirectorPortalOpen}
        onClose={() => setIsDirectorPortalOpen(false)}
      />

      {/* Hidden System Admins Area (/adminaccess) */}
      <AdminPortal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
      />
    </div>
  );
}
