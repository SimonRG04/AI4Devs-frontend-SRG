import axios from 'axios';

// Flag to determine if we should use mock data or real API
const USE_MOCK = true;

// Mock data for interview flow
const mockInterviewFlow = {
  positionName: "Senior backend engineer",
  interviewFlow: {
    id: 1,
    description: "Standard development interview process",
    interviewSteps: [
      {
        id: 1,
        interviewFlowId: 1,
        interviewTypeId: 1,
        name: "Initial Screening",
        orderIndex: 1
      },
      {
        id: 2,
        interviewFlowId: 1,
        interviewTypeId: 2,
        name: "Technical Interview",
        orderIndex: 2
      },
      {
        id: 3,
        interviewFlowId: 1,
        interviewTypeId: 3,
        name: "Manager Interview",
        orderIndex: 3
      }
    ]
  }
};

// Mock data for candidates
const mockCandidates = [
  {
    id: 1,
    fullName: "Jane Smith",
    currentInterviewStep: "Technical Interview",
    averageScore: 4
  },
  {
    id: 2,
    fullName: "Carlos García",
    currentInterviewStep: "Initial Screening",
    averageScore: 0
  },
  {
    id: 3,
    fullName: "John Doe",
    currentInterviewStep: "Manager Interview",
    averageScore: 5
  },
  {
    id: 4,
    fullName: "Ana Pérez",
    currentInterviewStep: "Initial Screening",
    averageScore: 3
  },
  {
    id: 5,
    fullName: "Mark Johnson",
    currentInterviewStep: "Technical Interview",
    averageScore: 2
  }
];

// Function to get position interview flow
export const getPositionInterviewFlow = async (positionId) => {
  if (USE_MOCK) {
    return Promise.resolve(mockInterviewFlow);
  }

  try {
    const response = await axios.get(`/positions/${positionId}/interviewFlow`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching position interview flow: ' + error.message);
  }
};

// Function to get candidates for a position
export const getPositionCandidates = async (positionId) => {
  if (USE_MOCK) {
    return Promise.resolve(mockCandidates);
  }

  try {
    const response = await axios.get(`/positions/${positionId}/candidates`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching position candidates: ' + error.message);
  }
};

// Function to update a candidate's stage
export const updateCandidateStage = async (candidateId, applicationId, interviewStepId) => {
  if (USE_MOCK) {
    // Simulate updating the candidate in our mock data
    const candidateIndex = mockCandidates.findIndex(c => c.id === candidateId);
    if (candidateIndex !== -1) {
      const interviewStep = mockInterviewFlow.interviewFlow.interviewSteps.find(
        step => step.id === parseInt(interviewStepId)
      );
      if (interviewStep) {
        mockCandidates[candidateIndex].currentInterviewStep = interviewStep.name;
      }
    }
    
    return Promise.resolve({
      message: "Candidate stage updated successfully",
      data: {
        id: candidateId,
        positionId: 1,
        candidateId: candidateId,
        applicationDate: "2024-06-04T13:34:58.304Z",
        currentInterviewStep: interviewStepId,
        notes: null,
        interviews: []
      }
    });
  }

  try {
    const response = await axios.put(`/candidates/${candidateId}/stage`, {
      applicationId,
      currentInterviewStep: interviewStepId
    });
    return response.data;
  } catch (error) {
    throw new Error('Error updating candidate stage: ' + error.message);
  }
}; 