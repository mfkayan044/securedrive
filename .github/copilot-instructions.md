# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a modern React + TypeScript web application using Vite and Tailwind CSS.
- The `src/` directory contains all source code, organized by feature and role (admin, driver, user, messaging).
- State management and context are handled via React Contexts in `src/contexts/`.
- Supabase is used for backend/database integration, with configuration in `src/lib/supabase.ts` and SQL migrations in `supabase/migrations/`.

## Key Architectural Patterns
- **Component Structure:**
  - Major features are grouped by user role: `src/components/admin/`, `src/components/driver/`, `src/components/user/`, `src/components/messaging/`.
  - Shared components are in `src/components/`.
- **Context Usage:**
  - Each major role (Admin, Driver, User, Messaging) has a dedicated context in `src/contexts/` for state and logic.
- **Data Layer:**
  - Supabase is the primary data source. All DB/API logic should use `src/lib/supabase.ts` or relevant hooks in `src/hooks/`.
  - Mock data for development is in `src/data/mockData.ts`.
- **Type Definitions:**
  - All shared types are in `src/types/` (e.g., `admin.ts`, `driver.ts`, etc.).

## Developer Workflows
- **Development:**
  - Start the dev server: `npm run dev`
  - Vite is used for fast refresh and builds.
- **Build:**
  - Production build: `npm run build`
- **Styling:**
  - Tailwind CSS is configured via `tailwind.config.js` and `postcss.config.js`.
  - Use utility classes; avoid custom CSS unless necessary.
- **TypeScript:**
  - Configured via `tsconfig.json` and `tsconfig.app.json`.
- **Supabase:**
  - SQL migrations are in `supabase/migrations/`.
  - Use `src/lib/supabase.ts` for all Supabase interactions.

## Project-Specific Conventions
- **Role-based Component Organization:**
  - Place new features/components in the appropriate role-based folder.
- **Context-first State Management:**
  - Add new global state to the relevant context in `src/contexts/`.
- **Type Safety:**
  - Always define/update types in `src/types/` when adding new data models or API responses.
- **No direct DOM manipulation:**
  - Use React patterns and hooks for all UI logic.

## Integration Points
- **Supabase:**
  - All backend/database logic must go through the Supabase client in `src/lib/supabase.ts`.
- **Messaging:**
  - Messaging features are in `src/components/messaging/` and use `MessagingContext`.

## Examples
- To add a new admin feature, create a component in `src/components/admin/` and update `AdminContext` as needed.
- For new data models, add a type in `src/types/` and update relevant hooks/contexts.

## References
- `src/contexts/` — Context/state management
- `src/lib/supabase.ts` — Supabase integration
- `src/types/` — Type definitions
- `supabase/migrations/` — Database migrations

---
For questions or unclear patterns, review existing code in the relevant directory or ask for clarification.
