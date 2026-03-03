import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInstancesTable1700000000000 implements MigrationInterface {
  name = 'CreateInstancesTable1700001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "instances" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "template_version_id" uuid NOT NULL,
        "snapshot" jsonb NOT NULL,
        "status" varchar NOT NULL DEFAULT 'draft',
        "submitted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_instances_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "instances"
      ADD CONSTRAINT "FK_instances_template_version"
      FOREIGN KEY ("template_version_id")
      REFERENCES "template_versions"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_instances_template_version"
      ON "instances" ("template_version_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_instances_template_version"`);
    await queryRunner.query(`
      ALTER TABLE "instances"
      DROP CONSTRAINT "FK_instances_template_version"
    `);
    await queryRunner.query(`DROP TABLE "instances"`);
  }
}
