SHELL := /bin/bash

.PHONY: dev migrate migrate-local migrate-prod

dev:
	@printf "Ensuring local Supabase is running...\n"
	@(cd app/supabase && npx supabase@latest status >/dev/null 2>&1 || npx supabase@latest start)
	@printf "Starting site, app frontend and backend in parallel...\n"
	@(cd site && npm run dev) &
	@(cd app/frontend && corepack pnpm run dev) &
	@(cd app/backend && corepack pnpm run dev) &
	wait

migrate:
	@printf "Running database migration locally and on production...\n"
	@cd app/supabase && node migrate-db.js

migrate-local:
	@printf "Running database migration locally...\n"
	@cd app/supabase && node migrate-db.js --local

migrate-prod:
	@printf "Running database migration on production...\n"
	@cd app/supabase && node migrate-db.js --linked
