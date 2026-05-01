SHELL := /bin/bash

.PHONY: dev

dev:
	@printf "Starting site, app frontend and backend in parallel...\n"
	@(cd site && npm run dev) &
	@(cd app/frontend && corepack pnpm run dev) &
	@(cd app/backend && corepack pnpm run dev) &
	wait
