import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTemplates1700001000000 implements MigrationInterface {
  name = 'CreateTemplates1700001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE templates (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id uuid NOT NULL,
        name varchar NOT NULL,
        description varchar,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX unique_template_name_per_company
      ON templates (company_id, name);
    `);

    await queryRunner.query(`
      CREATE TABLE template_versions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id uuid NOT NULL,
        version int NOT NULL,
        status varchar NOT NULL DEFAULT 'DRAFT',
        definition jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_template
          FOREIGN KEY(template_id)
          REFERENCES templates(id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX unique_version_per_template
      ON template_versions (template_id, version);
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX unique_published_template
      ON template_versions (template_id)
      WHERE status = 'PUBLISHED';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS unique_published_template;`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS unique_version_per_template;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS template_versions;`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS unique_template_name_per_company;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS templates;`);
  }
}
