import React, { useState } from 'react';
import { useClientsAndProjects } from './application/useClientsAndProjects';
import { useMeasurementSession } from './application/useMeasurementSession';
import { DashboardView } from './ui/views/DashboardView';
import { RoomCaptureView } from './ui/views/RoomCaptureView';
import { RoomReviewView } from './ui/views/RoomReviewView';
import { MeasurementOverviewView } from './ui/views/MeasurementOverviewView';
import { ObjectEditorView } from './ui/views/ObjectEditorView';
import { MeasurementSummaryView } from './ui/views/MeasurementSummaryView';
import { ClientProjectModal } from './ui/views/ClientProjectModal';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'room_capture' | 'room_review' | 'overview' | 'editor' | 'summary'
  >('dashboard');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const activeMeasurementId: string | null = null;
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Client & Project Global State
  const {
    clients,
    projects,
    rooms,
    measurements,
    loading: isDataLoading,
    refresh: refreshGlobalData,
    createClient,
    createProject,
    createRoom
  } = useClientsAndProjects();

  // Active Measurement Session Hook (for legacy compatibility)
  const {
    measurement,
    activeObject,
    setActiveObjectId,
    isSaving,
    lastSavedAt,
    addFurnitureObject,
    updateFurnitureObject,
    attachMediaBlob,
    removeMediaAttachment,
    removeFurnitureObject,
    updateMeasurementStatus,
    downloadExportJson
  } = useMeasurementSession(activeMeasurementId || undefined);

  // Helper functions for rooms
  const getRoom = (roomId: string | null) => rooms.find(r => r.id === roomId);
  const getRoomProject = (roomId: string | null) => {
    const room = getRoom(roomId);
    return projects.find(p => p.id === room?.projectId);
  };
  const getRoomClient = (roomId: string | null) => {
    const proj = getRoomProject(roomId);
    return clients.find(c => c.id === proj?.clientId);
  };

  const getRoomProjectName = (roomId: string | null) => getRoomProject(roomId)?.name || 'Projekt';
  const getRoomClientName = (roomId: string | null) => {
    const cl = getRoomClient(roomId);
    return cl ? `${cl.firstName} ${cl.lastName}` : 'Klient';
  };
  const getRoomClientPhone = (roomId: string | null) => getRoomClient(roomId)?.phone || '+48 ...';
  const getRoomSiteAddress = (roomId: string | null) => {
    const cl = getRoomClient(roomId);
    return cl?.address ? `${cl.address.street}, ${cl.address.city}` : undefined;
  };

  // Helper functions to resolve display names for legacy measurements
  const getProjectName = (projectId?: string) => {
    if (!projectId) return 'Custom Project';
    return projects.find(p => p.id === projectId)?.name || 'Custom Project';
  };

  const getClientName = (projectId?: string) => {
    if (!projectId) return 'Client';
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return 'Client';
    const cl = clients.find(c => c.id === proj.clientId);
    return cl ? `${cl.firstName} ${cl.lastName}` : 'Client';
  };

  const handleStartNewVisit = () => {
    setIsProjectModalOpen(true);
  };

  const handleOpenRoomCapture = (roomId: string) => {
    setActiveRoomId(roomId);
    setCurrentView('room_capture');
  };

  const handleBackToDashboard = async () => {
    await refreshGlobalData();
    setCurrentView('dashboard');
  };

  if (isDataLoading && rooms.length === 0 && measurements.length === 0) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-pulse">
          <span className="text-amber-400 font-black text-xl">YD</span>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-extrabold tracking-tight">Firma YADIMA Platform</h2>
          <p className="text-xs text-stone-400">Ładowanie lokalnego magazynu IndexedDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans antialiased selection:bg-amber-500 selection:text-white">
      {/* View Router */}
      {currentView === 'dashboard' && (
        <DashboardView
          rooms={rooms}
          projects={projects}
          clients={clients}
          onStartNewMeasurement={handleStartNewVisit}
          onOpenRoom={handleOpenRoomCapture}
        />
      )}

      {currentView === 'room_capture' && activeRoomId && (
        <RoomCaptureView
          roomId={activeRoomId}
          projectName={getRoomProjectName(activeRoomId)}
          clientName={getRoomClientName(activeRoomId)}
          onBack={handleBackToDashboard}
          onGoToReview={() => setCurrentView('room_review')}
        />
      )}

      {currentView === 'room_review' && activeRoomId && (
        <RoomReviewView
          roomId={activeRoomId}
          projectName={getRoomProjectName(activeRoomId)}
          clientName={getRoomClientName(activeRoomId)}
          clientPhone={getRoomClientPhone(activeRoomId)}
          siteAddress={getRoomSiteAddress(activeRoomId)}
          onBackToEdit={() => setCurrentView('room_capture')}
          onDone={handleBackToDashboard}
        />
      )}

      {/* Legacy Furniture Object Views (Preserved) */}
      {currentView === 'overview' && measurement && (
        <MeasurementOverviewView
          measurement={measurement}
          projectName={getProjectName(measurement.projectId)}
          clientName={getClientName(measurement.projectId)}
          onBackToDashboard={handleBackToDashboard}
          onSelectObject={(objId) => {
            setActiveObjectId(objId);
            setCurrentView('editor');
          }}
          onAddObject={addFurnitureObject}
          onRemoveObject={removeFurnitureObject}
          onProceedToSummary={() => setCurrentView('summary')}
          isSaving={isSaving}
          lastSavedAt={lastSavedAt}
        />
      )}

      {currentView === 'editor' && activeObject && (
        <ObjectEditorView
          object={activeObject}
          onUpdateObject={updateFurnitureObject}
          onAttachPhoto={(file, tag, caption) =>
            attachMediaBlob(activeObject.id, file, tag, caption)
          }
          onRemovePhoto={(mediaId) => removeMediaAttachment(activeObject.id, mediaId)}
          onBackToOverview={() => setCurrentView('overview')}
          isSaving={isSaving}
        />
      )}

      {currentView === 'summary' && measurement && (
        <MeasurementSummaryView
          measurement={measurement}
          projectName={getProjectName(measurement.projectId)}
          clientName={getClientName(measurement.projectId)}
          onBackToOverview={() => setCurrentView('overview')}
          onBackToDashboard={handleBackToDashboard}
          onDownloadJson={downloadExportJson}
          onStatusChange={updateMeasurementStatus}
        />
      )}

      {/* Modal: Client & Project Selection for new room capture */}
      <ClientProjectModal
        clients={clients}
        projects={projects}
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onStartRoomCapture={handleOpenRoomCapture}
        onCreateClient={createClient}
        onCreateProject={createProject}
        onCreateRoom={createRoom}
      />
    </div>
  );
};

export default App;
