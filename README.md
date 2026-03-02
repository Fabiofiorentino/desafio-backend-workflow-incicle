
# Desafio Backend – Workflow InCicle

## Stack

- **Framework:** NestJS  
- **ORM:** TypeORM  
- **Banco:** PostgreSQL  
- **Mensageria:** RabbitMQ  
- **Containerização:** Docker + Docker Compose  
- **Testes:** Jest (e2e)  
- **Healthcheck:** @nestjs/terminus  

---

# Arquitetura adotada

Estrutura baseada em separação por camadas:


src/
├── infra/
│    ├── database/
│    │    ├── migrations/
│    │    ├── seeds/
│    │    └── data-source.ts
│    ├── messaging/
│    └── health/
├── modules/
|    ├── approvals/
|    ├── audit/
|    ├── company/
|    ├── delegations/
|    ├── instances/
|    ├── templates/
|    ├── user/
├── common/
├── test/
└── app.module.ts

## Decisão

Separar **infraestrutura de domínio**.

### Trade-off

Mais organização e escalabilidade   

---

# Banco de Dados

- PostgreSQL rodando via Docker  
- Migrations controladas pelo TypeORM  
- Seeds executadas manualmente

---

# Testes

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

Banco e Rabbit são serviços reais.

## Decisão

Migrations e seeds **não rodam automaticamente no container**.

## Motivo

* Separação entre boot da aplicação e tarefas administrativas
* Evita efeitos colaterais automáticos
* Simula fluxo real de produção

### Trade-off

Maior controle operacional

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

```bash
npm run test:e2e
```

---

# Scripts disponíveis

```json
{
  "migration:run": "typeorm migration:run -d dist/infra/database/data-source.js",
  "migration:revert": "typeorm migration:revert -d dist/infra/database/data-source.js",
  "seed": "node dist/infra/database/seeds/seed.js",
  "test:e2e": "NODE_ENV=test jest --config ./test/jest-e2e.json"
}
```

---

# Decisões Técnicas Justificadas

| Decisão            | Motivo                                           | Trade-off            |
| ------------------ | ------------------------------------------------ | -------------------- |
| TypeORM            | Migrations robustas + integração madura com Nest | Verbosidade          |
| RabbitMQ           | Arquitetura orientada a eventos                  | Complexidade inicial |
| Docker             | Ambiente reproduzível                            | Setup inicial maior  |
| Migrations manuais | Controle operacional                             | Passo extra          |
| Health real        | Observabilidade confiável                        | Teste mais pesado    |

---

# Entregue

✔ API rodando em container
✔ Postgress funcionando
✔ RabbitMQ funcionando
✔ Migrations estruturadas
✔ Seeds funcionais
✔ Health endpoint
✔ Testes e2e funcionando


