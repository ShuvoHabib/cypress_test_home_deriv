.PHONY: help install test test-signup test-open test-report clean lint format ci

# Variables
NODE_BIN := ./node_modules/.bin
CYPRESS := $(NODE_BIN)/cypress
TEST_EMAIL ?= 
TEST_PASSWORD ?= 

help:
	@echo "Rock's Test & Automation Commands"
	@echo "=================================="
	@echo ""
	@echo "Setup:"
	@echo "  make install              Install dependencies (npm)"
	@echo ""
	@echo "Testing (Cypress):"
	@echo "  make test                 Run all Cypress tests (headless)"
	@echo "  make test-signup          Run signup tests only (headless)"
	@echo "  make test-open            Open Cypress GUI"
	@echo "  make test-signup-open     Open Cypress GUI on signup tests"
	@echo "  make test-report          Run tests + open HTML report"
	@echo ""
	@echo "CI/Automation:"
	@echo "  make ci                   Run full CI suite (lint + test + report)"
	@echo "  make ci-with-creds        Run CI with env vars (TEST_EMAIL, TEST_PASSWORD)"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean                Remove node_modules, reports, screenshots"
	@echo "  make lint                 Run linters"
	@echo "  make format               Auto-format code"
	@echo ""
	@echo "Examples:"
	@echo "  make test-signup"
	@echo "  make test-signup TEST_EMAIL=test@deriv.com TEST_PASSWORD=SecurePass123!"
	@echo "  make ci-with-creds TEST_EMAIL=test@deriv.com TEST_PASSWORD=SecurePass123!"

install:
	npm install
	$(CYPRESS) install

test: install
	$(CYPRESS) run --spec 'cypress/e2e/**/*.cy.js'

test-signup: install
	$(CYPRESS) run --spec cypress/e2e/signup.cy.js

test-signup-with-creds: install
	@if [ -z "$(TEST_EMAIL)" ] || [ -z "$(TEST_PASSWORD)" ]; then \
		echo "Error: TEST_EMAIL and TEST_PASSWORD required"; \
		echo "Usage: make test-signup-with-creds TEST_EMAIL=... TEST_PASSWORD=..."; \
		exit 1; \
	fi
	$(CYPRESS) run --spec cypress/e2e/signup.cy.js \
		--env TEST_EMAIL=$(TEST_EMAIL),TEST_PASSWORD=$(TEST_PASSWORD)

test-open: install
	$(CYPRESS) open

test-signup-open: install
	$(CYPRESS) open --spec cypress/e2e/signup.cy.js

test-report: install
	@echo "Running tests and generating report..."
	$(CYPRESS) run --spec 'cypress/e2e/**/*.cy.js' --reporter html
	@echo ""
	@echo "Report generated: cypress/reports/index.html"
	@if command -v open > /dev/null; then \
		open cypress/reports/index.html; \
	elif command -v xdg-open > /dev/null; then \
		xdg-open cypress/reports/index.html; \
	else \
		echo "Open cypress/reports/index.html in your browser"; \
	fi

lint:
	@echo "Linting project..."
	@echo "No linters configured yet. Add eslint, prettier, etc. as needed."

format:
	@echo "Formatting code..."
	@echo "No formatters configured yet. Add prettier, etc. as needed."

clean:
	@echo "Cleaning up..."
	rm -rf node_modules
	rm -rf cypress/screenshots
	rm -rf cypress/videos
	rm -rf cypress/reports
	@echo "✓ Cleaned"

ci: lint test test-report
	@echo "✓ CI pipeline complete"

ci-with-creds: lint test-signup-with-creds test-report
	@echo "✓ CI pipeline complete (with credentials)"

.DEFAULT_GOAL := help
