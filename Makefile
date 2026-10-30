#criar migrate usando o cmd make generate-migrate name=nome-migration
generate-migrate:
	npx typeorm-ts-node-esm migration:generate \
  src/infrastructure/database/migrations/$(name) \
  -d src/infrastructure/database/data-source.ts

#aplicar migrate
migrate-run:
	npx typeorm-ts-node-esm migration:run \
  -d src/infrastructure/database/data-source.ts
