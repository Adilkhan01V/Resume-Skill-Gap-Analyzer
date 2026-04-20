<<<<<<< HEAD
# Resume Skill Gap Analyzer + Career Assistant

Production-ready monorepo skeleton for an AI-powered resume analysis and career guidance platform.

## Project Overview

This repository contains a clean architecture scaffold for:
- Resume ingestion (PDF/DOCX)
- Job description analysis
- Skill gap detection
- Explainable scoring
- AI-powered improvement suggestions
- Live resume editing
- Resume export
- Job recommendations

No business logic or UI implementation is included yet. This is a structure-only baseline.

## Monorepo Structure

- `client/` React + Vite frontend
- `server/` FastAPI backend
- `docs/` architecture and module docs
- `assets/` static project assets
- `.env.example` environment variable template

## Setup (High Level)

- Configure environment values using `.env.example`
- Prepare frontend dependencies and local environment in `client/`
- Prepare backend dependencies and local environment in `server/`
- Implement feature modules incrementally by domain

## Folder Guide

### Frontend (`client/`)
- `src/components/layout/` app shell and dashboard layout containers
- `src/components/dashboard/` domain-driven dashboard panels
- `src/components/common/` shared UI primitives
- `src/pages/` route-level page containers
- `src/hooks/` reusable React hooks
- `src/services/` API clients
- `src/store/` state modules
- `src/utils/` frontend utilities
- `src/styles/` global style layers
- `src/config/` app-level frontend configuration

### Backend (`server/`)
- `app/api/` route handlers
- `app/core/` configuration and settings
- `app/models/` data models
- `app/services/` business service modules
- `app/utils/` helper utilities
- `app/schemas/` request/response schemas

## Notes

- This scaffold intentionally uses placeholder classes and functions.
- Add tests as modules become implemented.
- Keep business logic inside services and keep routes thin.
=======
# Resume-Skill-Gap-Analyzer
>>>>>>> 15637c5a63234281f2514da0325d2beb2a102aae
