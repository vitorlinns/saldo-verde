SHELL := /bin/bash

.PHONY: dev

dev:
	@printf "Ensuring local Supabase is running...\n"
	@(cd app/supabase && npx supabase@latest status >/dev/null 2>&1 || npx supabase@latest start)
	@printf "Starting site, app frontend and backend in parallel...\n"
	@(cd site && npm run dev) &
	@(cd app/frontend && corepack pnpm run dev) &
	@(cd app/backend && corepack pnpm run dev) &
	wait
