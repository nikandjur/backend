dev:
	docker-compose -f docker-compose.dev.yml up -d
	npm run dev

prod:
	docker-compose up -d --build

stop:
	docker-compose down


dev-down:
	docker-compose -f docker-compose.dev.yml down

prod:
	docker-compose -f docker-compose.yml up -d

prod-down:
	docker-compose -f docker-compose.yml down
