include Make.depend

run:
	export APP_ROOT=$(app_root) && \
	docker compose -f $(compose-config) -p $(project-name) up -d $(service-name)

stop:
	export APP_ROOT=$(app_root) && \
	docker compose -f $(compose-config) -p $(project-name) stop $(service-name)

build:
	export APP_ROOT=$(app_root) && \
	docker compose -f $(compose-config) -p $(project-name) build $(service-name)

clean-build:
	export APP_ROOT=$(app_root) && \
	docker compose -f $(compose-config) -p $(project-name) build --no-cache $(service-name)

ps:
	export APP_ROOT=$(app_root) && \
	docker compose -f $(compose-config) -p $(project-name) ps

watch-logs:
	export APP_ROOT=$(app_root) && \
	docker compose -f $(compose-config) -p $(project-name) logs -f $(service-name)

exec:
ifdef cmd
	export APP_ROOT=$(app_root) && \
	docker compose -f $(compose-config) -p $(project-name) exec $(service-name) $(cmd)
else
	@echo "ERROR : You must pass a "cmd" value make cmd='your command' exec"
endif

.PHONY: lint
lint:
	make exec cmd="$(make_lint)"

.PHONY: test
test:
	make exec cmd="$(make_test)"

.PHONY: db
db:
	make exec cmd="$(make_db)"

.PHONY: migration
migration:
ifdef name
	make exec cmd="npx typeorm-ts-node-esm migration:generate src/migrations/$(name) -d ./dist/config/postgres-config.service.js"
else
	@echo "ERROR : You must pass a 'name' option:"
	@echo "  ex: make migration name='MigrationName'"
endif