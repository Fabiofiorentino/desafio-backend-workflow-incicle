import { AppDataSource } from '../data-source';

async function run() {
  await AppDataSource.initialize();

  const companyId = process.env.COMPANY_ID;

  await AppDataSource.query(`
    INSERT INTO company (id, name)
    VALUES ('${companyId}', 'InCicle')
  `);

  await AppDataSource.query(`
    INSERT INTO "user" (id, company_id, name, email)
    VALUES
    (gen_random_uuid(), '${companyId}', 'Admin', 'admin@incicle.com'),
    (gen_random_uuid(), '${companyId}', 'Teste', 'teste@incicle.com')
  `);

  console.log('Seed executado com sucesso');
  process.exit(0);
}

run();
