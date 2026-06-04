.PHONY: help build test demo api dev clean deploy

# Colors
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RESET := \033[0m

help: ## Show this help message
	@echo "$(CYAN)Graph Algorithms Library - Deployment Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}'

# Docker Compose Commands
build: ## Build all Docker images
	@echo "$(YELLOW)Building Docker images...$(RESET)"
	docker-compose build

test: ## Run test suite in container
	@echo "$(YELLOW)Running tests...$(RESET)"
	docker-compose run --rm test

demo: ## Run interactive algorithm demo
	@echo "$(YELLOW)Starting demo...$(RESET)"
	docker-compose up demo

api: ## Start API server (detached)
	@echo "$(YELLOW)Starting API server...$(RESET)"
	docker-compose up -d api
	@echo "$(GREEN)API running at http://localhost:3000$(RESET)"
	@echo "$(CYAN)Health check: curl http://localhost:3000/health$(RESET)"

api-logs: ## Show API server logs
	docker-compose logs -f api

dev: ## Start development environment
	@echo "$(YELLOW)Starting development environment...$(RESET)"
	docker-compose up dev

stop: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(RESET)"
	docker-compose down

clean: ## Remove containers, volumes, and images
	@echo "$(YELLOW)Cleaning up...$(RESET)"
	docker-compose down -v --rmi local

# Local Development Commands
install: ## Install npm dependencies
	npm install

test-local: ## Run tests locally
	@echo "$(YELLOW)Running tests locally...$(RESET)"
	node test/test.js && \
	node test/algorithms-test.js && \
	node test/advanced-algorithms-test.js

demo-local: ## Run demo locally
	@echo "$(YELLOW)Running demo locally...$(RESET)"
	node examples/complete-algorithms-demo.js

api-local: ## Start API server locally
	@echo "$(YELLOW)Starting API server locally...$(RESET)"
	@echo "$(GREEN)Running at http://localhost:3000$(RESET)"
	node server.js

# API Testing
api-health: ## Test API health endpoint
	@curl -s http://localhost:3000/health | json_pp || echo "API not running"

api-algorithms: ## List available algorithms
	@curl -s http://localhost:3000/algorithms | json_pp

api-test-dijkstra: ## Test Dijkstra endpoint
	@echo "$(CYAN)Testing Dijkstra's algorithm...$(RESET)"
	@curl -s -X POST http://localhost:3000/dijkstra \
		-H "Content-Type: application/json" \
		-d '{"edges":[["A","B",1],["B","C",2],["A","C",4]],"source":"A"}' | json_pp

api-test-bfs: ## Test BFS endpoint
	@echo "$(CYAN)Testing BFS traversal...$(RESET)"
	@curl -s -X POST http://localhost:3000/bfs \
		-H "Content-Type: application/json" \
		-d '{"edges":[["A","B"],["A","C"],["B","D"]],"start":"A"}' | json_pp

# Deployment
deploy-prod: build ## Deploy to production
	@echo "$(YELLOW)Deploying to production...$(RESET)"
	docker-compose -f docker-compose.yml up -d api
	@echo "$(GREEN)Production deployment complete$(RESET)"

scale: ## Scale API service (usage: make scale REPLICAS=3)
	@echo "$(YELLOW)Scaling API to $(REPLICAS) replicas...$(RESET)"
	docker-compose up -d --scale api=$(REPLICAS)

# Monitoring
stats: ## Show container resource usage
	docker stats graph-algorithms-api

logs: ## Show all service logs
	docker-compose logs -f

inspect: ## Inspect Docker network
	docker network inspect graph-algorithms-network

# Quality
lint: ## Run linter (if configured)
	@echo "$(YELLOW)Running linter...$(RESET)"
	npm run lint || echo "No linter configured"

coverage: ## Run test coverage (if configured)
	@echo "$(YELLOW)Running test coverage...$(RESET)"
	npm run coverage || echo "No coverage configured"

# Documentation
docs: ## Generate documentation
	@echo "$(CYAN)Documentation:$(RESET)"
	@echo "  README.md          - Library documentation"
	@echo "  DEPLOYMENT.md      - Deployment guide"
	@echo "  examples/          - Usage examples"

# Shortcuts
up: api ## Alias for 'make api'
down: stop ## Alias for 'make stop'
