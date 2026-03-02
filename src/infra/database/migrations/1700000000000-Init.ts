import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE company (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar NOT NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id uuid NOT NULL,
        name varchar NOT NULL,
        email varchar NOT NULL UNIQUE,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        CONSTRAINT fk_user_company FOREIGN KEY (company_id)
        REFERENCES company(id) ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE template (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id uuid NOT NULL,
        name varchar NOT NULL,
        description varchar,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        CONSTRAINT fk_template_company FOREIGN KEY (company_id)
        REFERENCES company(id) ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE template_version (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id uuid NOT NULL,
        template_id uuid NOT NULL,
        version_number int NOT NULL,
        status varchar NOT NULL,
        definition jsonb NOT NULL,
        published_at timestamptz,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        CONSTRAINT fk_tv_template FOREIGN KEY (template_id)
        REFERENCES template(id) ON DELETE CASCADE,
        CONSTRAINT uq_template_version UNIQUE (template_id, version_number)
      )
    `);

    await queryRunner.query(
      `CREATE INDEX idx_user_company ON "user"(company_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_template_company ON template(company_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_tv_company ON template_version(company_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE template_version`);
    await queryRunner.query(`DROP TABLE template`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE company`);
  }
}
