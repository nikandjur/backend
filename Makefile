dev:
	docker-compose -f docker-compose.dev.yml up -d
	npm run dev

dev-down:
	docker-compose -f docker-compose.dev.yml down

prod:
	docker-compose -f docker-compose.prod.yml up -d

prod-down:
	docker-compose -f docker-compose.prod.yml down
