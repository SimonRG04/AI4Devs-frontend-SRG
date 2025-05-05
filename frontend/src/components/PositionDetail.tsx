import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Breadcrumb, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getPositionInterviewFlow, getPositionCandidates, updateCandidateStage } from '../services/positionService';
import { ArrowLeft, Star, StarFill, PersonFill, Briefcase, People, EnvelopeFill, TelephoneFill, FileEarmarkTextFill, Calendar2CheckFill } from 'react-bootstrap-icons';
import '../styles/PositionDetail.css';

// Tipos para TypeScript
interface InterviewStep {
  id: number;
  name: string;
  orderIndex: number;
  interviewFlowId: number;
  interviewTypeId: number;
}

interface InterviewFlow {
  id: number;
  description: string;
  interviewSteps: InterviewStep[];
}

interface Candidate {
  id: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
}

interface PositionData {
  positionName: string;
  interviewFlow: InterviewFlow;
}

const PositionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [positionData, setPositionData] = useState<PositionData | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Cargar datos del backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const positionId = id || '1'; // Usa un ID por defecto si no hay uno en la URL
        const [positionResponse, candidatesResponse] = await Promise.all([
          getPositionInterviewFlow(positionId),
          getPositionCandidates(positionId)
        ]);
        
        setPositionData(positionResponse);
        setCandidates(candidatesResponse);
      } catch (err) {
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Organizar candidatos por etapa de entrevista
  const getCandidatesByStage = useCallback((stageName: string) => {
    return candidates.filter(
      candidate => candidate.currentInterviewStep === stageName
    );
  }, [candidates]);

  // Manejar el inicio del arrastre
  const handleDragStart = (start: any) => {
    setDraggedItemId(start.draggableId);
  };

  // Manejar el arrastre de candidatos entre etapas
  const handleDragEnd = async (result: any) => {
    setDraggedItemId(null);
    
    if (!result.destination || !positionData) return;

    const { draggableId, source, destination } = result;
    
    // Si no se cambió de columna, no hacemos nada
    if (source.droppableId === destination.droppableId) return;

    // Encontrar la etapa de entrevista de destino
    const targetStepId = positionData.interviewFlow.interviewSteps.find(
      step => step.name === destination.droppableId
    )?.id;

    if (!targetStepId) return;

    // Actualizar estado localmente primero (optimistic update)
    const candidateId = parseInt(draggableId);
    const updatedCandidates = candidates.map(candidate => {
      if (candidate.id === candidateId) {
        return {
          ...candidate,
          currentInterviewStep: destination.droppableId
        };
      }
      return candidate;
    });
    
    setCandidates(updatedCandidates);

    try {
      // Luego actualizar en el backend
      await updateCandidateStage(candidateId, candidateId, targetStepId);
    } catch (err) {
      // Si hay error, revertir cambios
      setError('Error al actualizar la etapa del candidato. Intenta de nuevo.');
      setCandidates(candidates); // Revertir al estado anterior
      console.error(err);
    }
  };

  // Abrir modal con detalles del candidato
  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowModal(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCandidate(null);
  };

  // Renderizar indicador de carga
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3 text-muted">Cargando datos del proceso...</p>
        </div>
      </Container>
    );
  }

  // Renderizar mensaje de error
  if (error || !positionData) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error || 'No se pudo cargar la información de la posición.'}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/positions')}>
          <ArrowLeft className="me-2" /> Volver a posiciones
        </Button>
      </Container>
    );
  }

  // Renderizar estrellas de puntuación
  const renderStars = (score: number) => {
    if (score <= 0) {
      return <span className="candidate-score-empty">Sin evaluar</span>;
    }
    
    return (
      <>
        {Array(5).fill(0).map((_, i) => 
          i < score ? 
            <StarFill key={i} className="me-1" /> : 
            <Star key={i} className="me-1" style={{ opacity: 0.3 }} />
        )}
      </>
    );
  };

  // Obtener estadísticas de candidatos
  const getCandidateStats = () => {
    const totalCandidates = candidates.length;
    const stagesWithCandidates = new Set(candidates.map(c => c.currentInterviewStep)).size;
    const avgScore = candidates.reduce((acc, c) => acc + c.averageScore, 0) / (totalCandidates || 1);
    
    return { totalCandidates, stagesWithCandidates, avgScore: avgScore.toFixed(1) };
  };

  const stats = getCandidateStats();

  return (
    <Container fluid className="position-detail-container py-4">
      {/* Breadcrumb para navegación */}
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item onClick={() => navigate('/')} className="breadcrumb-link">
          <Briefcase className="me-1" /> Dashboard
        </Breadcrumb.Item>
        <Breadcrumb.Item onClick={() => navigate('/positions')} className="breadcrumb-link">
          <People className="me-1" /> Posiciones
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          {positionData.positionName}
        </Breadcrumb.Item>
      </Breadcrumb>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-primary" 
            className="back-button" 
            onClick={() => navigate('/positions')}
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className="position-title">{positionData.positionName}</h2>
        </div>
        
        {/* Stats de candidatos */}
        <div className="d-none d-md-flex candidate-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.totalCandidates}</span>
            <span className="stat-label">Candidatos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.stagesWithCandidates}</span>
            <span className="stat-label">Etapas activas</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.avgScore}</span>
            <span className="stat-label">Puntuación media</span>
          </div>
        </div>
      </div>

      {/* Tablero Kanban */}
      <DragDropContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {positionData.interviewFlow.interviewSteps.map((step) => {
            const candidatesInStage = getCandidatesByStage(step.name);
            return (
              <div key={step.id} className="kanban-column">
                <h5 className="column-header">
                  {step.name}
                  <span className="column-counter">{candidatesInStage.length}</span>
                </h5>
                <Droppable droppableId={step.name}>
                  {(provided, snapshot) => (
                    <div
                      className={`column-content ${snapshot.isDraggingOver ? 'bg-light' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {candidatesInStage.length === 0 && (
                        <div className="text-center text-muted p-3">
                          <PersonFill size={20} className="mb-2" />
                          <p className="mb-0" style={{ fontSize: '0.9rem' }}>No hay candidatos en esta etapa</p>
                        </div>
                      )}
                      {candidatesInStage.map((candidate, index) => (
                        <Draggable 
                          key={candidate.id} 
                          draggableId={candidate.id.toString()} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Card
                              className={`candidate-card ${draggedItemId === candidate.id.toString() ? 'is-dragging' : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleCandidateClick(candidate)}
                            >
                              <Card.Body>
                                <Card.Title className="candidate-name">{candidate.fullName}</Card.Title>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="candidate-score">
                                    {renderStars(candidate.averageScore)}
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal para detalles del candidato */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className="candidate-modal-title">
            {selectedCandidate?.fullName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCandidate && (
            <div>
              <div className="mb-4">
                <h6 className="candidate-detail-subtitle">Información de contacto</h6>
                <div className="candidate-detail-item">
                  <EnvelopeFill className="detail-icon" />
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">candidato{selectedCandidate.id}@example.com</span>
                </div>
                <div className="candidate-detail-item">
                  <TelephoneFill className="detail-icon" />
                  <span className="detail-label">Teléfono:</span>
                  <span className="detail-value">+34 6{selectedCandidate.id}{selectedCandidate.id} {selectedCandidate.id}{selectedCandidate.id}{selectedCandidate.id} {selectedCandidate.id}{selectedCandidate.id}{selectedCandidate.id}</span>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="candidate-detail-subtitle">Estado del proceso</h6>
                <div className="candidate-detail-item">
                  <Calendar2CheckFill className="detail-icon" />
                  <span className="detail-label">Etapa actual:</span>
                  <Badge bg="primary" className="ms-2">{selectedCandidate.currentInterviewStep}</Badge>
                </div>
                <div className="candidate-detail-item">
                  <FileEarmarkTextFill className="detail-icon" />
                  <span className="detail-label">Puntuación:</span>
                  <div className="ms-2 candidate-score">{renderStars(selectedCandidate.averageScore)}</div>
                </div>
              </div>

              <div className="candidate-detail-actions mt-4">
                <Button variant="outline-secondary" size="sm" className="me-2">
                  Ver CV completo
                </Button>
                <Button variant="outline-primary" size="sm">
                  Programar entrevista
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
          <Button variant="primary">
            Editar candidato
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PositionDetail; 