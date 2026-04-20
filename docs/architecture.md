# System Architecture

## Layers

- **Client Layer**: React application for upload, analysis visualization, resume editing, and job discovery.
- **API Layer**: FastAPI routes for analysis, scoring, suggestion, export, and job matching endpoints.
- **Service Layer**: Domain-specific services (parser, extractor, scoring, AI, matching, export).
- **Schema Layer**: Request/response definitions and data contracts.
- **Integration Layer (future)**: OpenAI API, parsing libraries, export engine adapters.

## Key Design Principles

- Separation of concerns by domain module
- Thin controllers (route handlers)
- Service orchestration for business workflows
- Config-driven integrations
- Explicit schema contracts between client and server
