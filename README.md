
# Desafio Backend – Workflow InCicle

📌 Sobre o Projeto

API de workflow de aprovações corporativas para ambiente multiempresa (multi-tenant).

Cada empresa (company-id via header) possui:
  - Templates isolados
  - Múltiplas versões por template
  - Apenas uma versão publicada por vez
  - Instâncias criadas a partir de versões
  - Snapshot imutável após submissão

O sistema simula um fluxo real de workflow corporativo com controle de versionamento e congelamento de dados.

## Stack

- **Framework:** NestJS  
- **ORM:** TypeORM  
- **Banco:** PostgreSQL  
- **Mensageria:** RabbitMQ  
- **Containerização:** Docker + Docker Compose  
- **Testes:** Jest  
- **Healthcheck:** @nestjs/terminus  
- **Documentação:** OpenAPI 3.0.3 (openapi.yaml)

---

# Estrutura de pastas

Estrutura baseada em separação por camadas:

````
.
├──src/
|   ├── infra/
|   │    ├── database/
|   │    │    ├── migrations/
|   │    │    ├── seeds/
|   │    │    └── data-source.ts
|   │    ├── messaging/
|   │    └── health/
|   ├── modules/
|   |    ├── approvals/
|   |    ├── audit/
|   |    ├── company/
|   |    ├── delegations/
|   |    ├── instances/
|   |    ├── templates/
|   |    ├── user/
|   └──  common/
├── test/
|     ├── health.e2e-spec.ts
|     ├── instances.e2e-spec.ts
├── app.module.ts
├── openapi.yaml
├── request.http
├── docker-compose.yml
└── Dockerfile
````
---

# Setup

## 1️⃣ Subir ambiente

```bash
docker compose up --build -d
```

---

## 2️⃣ Rodar migrations

```bash
docker exec -it workflow-incicle-api npm run migration:run
```

---

## 3️⃣ Rodar seed

```bash
docker exec -it workflow-incicle-api npm run seed
```

---

## 4️⃣ Rodar testes

E2E

```bash
npm run test:e2e
```

Unitários

```bash
docker compose exec api npm run test
```

Ou local:

```bash
npm run test
```

---

# Scripts disponíveis

```json
{
  "migration:run": "typeorm migration:run -d dist/infra/database/data-source.js",
  "migration:revert": "typeorm migration:revert -d dist/infra/database/data-source.js",
  "seed": "node dist/infra/database/seeds/seed.js",
  "test:e2e": "NODE_ENV=test jest --config ./test/jest-e2e.json"
  "test": "jest",
}
```

---


# Arquitetura

**Decisão**

Separar clara enter:
  - Camada de domíonio (modules)
  - Infraestrutura (database, messaging, health)
  - Infraestrutura (database, messaging, health)

**Trade-off**

Mais organização e escalabilidade   

---

# Multi-tenant

- Header obrigatório: company-id
- Templates são isolados por empresa
- Acesso cruzado entre empresas é bloqueado

# Health Checks

- /health → aplicação viva
- /health/ready → banco e Rabbit conectados

Decisão: readiness separado de liveness.

---

# Banco de Dados

- PostgreSQL rodando via Docker  
- Migrations controladas pelo TypeORM  
- Seeds executadas manualmente

---

## Testes Unitários

Testes focam em regra de negócio.

### Cobertura:

createTemplate

- Cria template
- Cria versão 1 automaticamente

publishVersion

- Publica versão
- Despublica anterior
- Lança erro se:
  - Template não existir
  - Versão não existir
  - Versão já publicada
- Garante uso de transaction

Multi-tenant

- Não permite acesso entre empresas

Framework: Jest

## Teste E2E

* Testes e2e com Jest
* Teste do endpoint `/health`
* Conexão com banco encerrada corretamente após testes

Problema resolvido:
Encerramento explícito do `DataSource.destroy()` para evitar open handles.

---

# Docker

Serviços:

* `workflow-incicle-api`
* `workflow-incicle-postgres`
* `workflow-incicle-rabbitmq`
* `workflow-incicle-swagger`

## Decisão

Migrations e seeds **não rodam automaticamente no container**.

## Motivo

* Separação entre boot da aplicação e tarefas administrativas
* Evita efeitos colaterais automáticos
* Simula fluxo real de produção

### Trade-off

Maior controle operacional

---

## Documentação

A documentação da API está disponível em [http://localhost:8081](http://localhost:8080).

---

# Entregue

✔ API rodando em container
✔ Postgress funcionando
✔ RabbitMQ funcionando
✔ Migrations estruturadas
✔ Seeds funcionais
✔ Health endpoint
✔ Testes e2e funcionando
✔ Módulo Templates (Criar template, Criar versão, Publicar versão, Garantir apenas 1 publicada por template)
✔ Testes unitário para service do módulo Templates
✔ Modulo Instances (Criar, Listar, Submeter)



