# Prompt para Cursor utilizando Claude 3.7 modo agent y thinking

Como experto en prompt engineering y frontend. Construye un prompt con el contexto que hay en @README.md,el siguiente enunciado:
"En LTI ya tenemos la funcionalidad para listar las diferentes posiciones requeridas por la empresa. Está disponible en una pagina "positions" que muestra una lista de tarjetas que describen cada posición. Cuenta con filtros para poder buscar por texto, fecha límite, estado y manager responsable. Queremos que al hacer clic en el botón "Ver proceso" de cualquiera de las posiciones, nos lleve a la vista de detalle de cada posición, denominada "position".". y las siguientes indicaciones "Tu misión en este ejercicio es crear la interfaz "position", una página en la que poder visualizar y gestionar los diferentes candidatos de una posición específica.

Se ha decidido que la interfaz sea tipo kanban, mostrando los candidatos como tarjetas en diferentes columnas que representan las fases del proceso de contratación, y pudiendo actualizar la fase en la que se encuentra un candidato solo arrastrando su tarjeta.Aquí tienes un ejemplo de interfaz posible:

Algunos de los requerimientos del equipo de diseño que se pueden ver en el ejemplo son:

Se debe mostrar el título de la posición en la parte superior, para dar contexto
Añadir una flecha a la izquierda del título que permita volver al listado de posiciones
Deben mostrarse tantas columnas como fases haya en el proceso
La tarjeta de cada candidato/a debe situarse en la fase correspondiente, y debe mostrar su nombre completo y su puntuación media
Si es posible, debe mostrarse adecuadamente en móvil (las fases en vertical ocupando todo el ancho)
Algunas observaciones:

Asume que la página de posiciones la encuentras 
Asume que existe la estructura global de la página, la cual incluye los elementos comunes como menú superior y footer. Lo que estás creando es el contenido interno de la página.
Para implementar la funcionalidad de la página cuentas con diversos endpoints API que ha preparado el equipo de backend:

GET /positions/:id/interviewFlow
Este endpoint devuelve información sobre el proceso de contratación para una determinada posición:

positionName: Título de la posición
interviewSteps: id y nombre de las diferentes fases de las que consta el proceso de contratación
{
      "positionName": "Senior backend engineer",
      "interviewFlow": {
              
              "id": 1,
              "description": "Standard development interview process",
              "interviewSteps": [
                  {
                      "id": 1,
                      "interviewFlowId": 1,
                      "interviewTypeId": 1,
                      "name": "Initial Screening",
                      "orderIndex": 1
                  },
                  {
                      "id": 2,
                      "interviewFlowId": 1,
                      "interviewTypeId": 2,
                      "name": "Technical Interview",
                      "orderIndex": 2
                  },
                  {
                      "id": 3,
                      "interviewFlowId": 1,
                      "interviewTypeId": 3,
                      "name": "Manager Interview",
                      "orderIndex": 2
                  }
              ]
          }
  }
GET /positions/:id/candidates
Este endpoint devuelve todos los candidatos en proceso para una determinada posición, es decir, todas las aplicaciones para un determinado positionID. Proporciona la siguiente información:

name: Nombre completo del candidato
current_interview_step: en qué fase del proceso está el candidato.
score: La puntuación media del candidato
[
      {
           "fullName": "Jane Smith",
           "currentInterviewStep": "Technical Interview",
           "averageScore": 4
       },
       {
           "fullName": "Carlos García",
           "currentInterviewStep": "Initial Screening",
           "averageScore": 0            
       },        
       {
           "fullName": "John Doe",
           "currentInterviewStep": "Manager Interview",
           "averageScore": 5            
      }    
 ]

 
PUT /candidates/:id/stage
Este endpoint actualiza la etapa del candidato movido. Permite modificar la fase actual del proceso de entrevista en la que se encuentra un candidato específico, a través del parámetro "new_interview_step" y proporionando el interview_step_id correspondiente a la columna en la cual se encuentra ahora el candidato.

{
     "applicationId": "1",
     "currentInterviewStep": "3"
 }
{    
    "message": "Candidate stage updated successfully",
     "data": {
         "id": 1,
         "positionId": 1,
         "candidateId": 1,
         "applicationDate": "2024-06-04T13:34:58.304Z",
         "currentInterviewStep": 3,
         "notes": null,
         "interviews": []    
     }
 }". El entregable será un prompt en @prompts-SRG.md para construir la solución.

# Prompt para Cursor utilizando Claude 3.7 modo agent

## Context
We're expanding an existing recruitment application. The application already has a "positions" page that lists job positions with filtering capabilities (by text, deadline, status, and manager). Now we need to build a detail view for each position that displays candidates in a kanban-style interface.

## Objective
Create a responsive React component for the "position" detail page that displays candidates as cards in columns representing different stages of the hiring process, with drag-and-drop functionality to update a candidate's stage.

## Current System
- The "positions" page already exists with a "Ver proceso" button on each position card
- The global page structure (header/menu, footer) already exists
- Backend APIs are already developed and available

## Key Requirements
1. **UI Requirements:**
   - Display position title at the top for context
   - Include a back arrow to return to positions list
   - Show a column for each interview phase in the process
   - Display candidate cards in their corresponding phase columns
   - Each candidate card must show full name and average score
   - Make the interface responsive (vertical columns on mobile)

2. **Functionality Requirements:**
   - Fetch and display position details and interview flow data
   - Fetch and display candidates for the position
   - Implement drag-and-drop functionality to move candidates between stages
   - Update the backend when candidates are moved between stages

## Available APIs

### 1. GET /positions/:id/interviewFlow
Returns position name and interview stages:
```json
{
  "positionName": "Senior backend engineer",
  "interviewFlow": {
    "id": 1,
    "description": "Standard development interview process",
    "interviewSteps": [
      {
        "id": 1,
        "interviewFlowId": 1,
        "interviewTypeId": 1,
        "name": "Initial Screening",
        "orderIndex": 1
      },
      {
        "id": 2,
        "interviewFlowId": 1,
        "interviewTypeId": 2,
        "name": "Technical Interview",
        "orderIndex": 2
      },
      {
        "id": 3,
        "interviewFlowId": 1,
        "interviewTypeId": 3,
        "name": "Manager Interview",
        "orderIndex": 2
      }
    ]
  }
}
```

### 2. GET /positions/:id/candidates
Returns all candidates for a position:
```json
[
  {
    "fullName": "Jane Smith",
    "currentInterviewStep": "Technical Interview",
    "averageScore": 4
  },
  {
    "fullName": "Carlos García",
    "currentInterviewStep": "Initial Screening",
    "averageScore": 0
  },
  {
    "fullName": "John Doe",
    "currentInterviewStep": "Manager Interview",
    "averageScore": 5
  }
]
```

### 3. PUT /candidates/:id/stage
Updates a candidate's stage:
- Request:
```json
{
  "applicationId": "1",
  "currentInterviewStep": "3"
}
```
- Response:
```json
{
  "message": "Candidate stage updated successfully",
  "data": {
    "id": 1,
    "positionId": 1,
    "candidateId": 1,
    "applicationDate": "2024-06-04T13:34:58.304Z",
    "currentInterviewStep": 3,
    "notes": null,
    "interviews": []
  }
}
```

## Deliverable
Please create a complete React component for the "position" detail page that:
1. Implements the kanban board UI with proper styling
2. Fetches data from the provided APIs
3. Allows drag-and-drop functionality to move candidates between stages
4. Updates the backend when candidates are moved
5. Is responsive for mobile devices
6. Includes proper error handling and loading states

Provide the full component code with any necessary hooks, utilities, and imports. Include comments explaining your implementation choices where needed.

## Technical Considerations
- Use React hooks for state management
- Implement a responsive design that works well on mobile devices
- Consider accessibility in your implementation
- Include error handling for API calls
- Consider performance optimizations. @README.md @frontend Utiliza data mock, con una variable bool que determine si usa el back o la data mock que por ahora dejaremos para que la use en lugar del back.