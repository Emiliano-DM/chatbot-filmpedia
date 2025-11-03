```mermaid
flowchart TD
    U[Usuario] --> FE[Chatbot Frontend]
    FE --> BE[Backend Python]
    BE --> DB[(datos_filmpedia.json)]
    BE --> IA[Gemini API]
    IA --> BE
    BE --> FE
    FE --> U[Recomendación de película]
