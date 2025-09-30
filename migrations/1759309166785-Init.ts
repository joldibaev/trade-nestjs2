import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1759309166785 implements MigrationInterface {
    name = 'Init1759309166785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_purchases" DROP CONSTRAINT "UQ_607828298fdb07f3eb6072f6d69"`);
        await queryRunner.query(`ALTER TABLE "document_purchases" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "document_sells" DROP CONSTRAINT "UQ_ec6db31b10a478907e6ac0f123c"`);
        await queryRunner.query(`ALTER TABLE "document_sells" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" DROP CONSTRAINT "UQ_96ada1d4d9b92eff14de53429e9"`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" DROP COLUMN "code"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP CONSTRAINT "FK_5d0d8227a1870669dd47a53ea30"`);
        await queryRunner.query(`ALTER TABLE "document_purchases" DROP CONSTRAINT "PK_da3380025ccdccb4d16cb6e1dae"`);
        await queryRunner.query(`ALTER TABLE "document_purchases" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "document_purchases" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_purchases" ADD CONSTRAINT "PK_da3380025ccdccb4d16cb6e1dae" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "operations" DROP CONSTRAINT "FK_a40e72f3a8cd651e439005df617"`);
        await queryRunner.query(`ALTER TABLE "document_sells" DROP CONSTRAINT "PK_077029a7529269234d0a7551259"`);
        await queryRunner.query(`ALTER TABLE "document_sells" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "document_sells" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_sells" ADD CONSTRAINT "PK_077029a7529269234d0a7551259" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "operations" DROP CONSTRAINT "FK_a9a9fc0ae90a341a6a77b95374f"`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" DROP CONSTRAINT "PK_7d9fa8b0e33d6d6a2e6477ddc79"`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" ADD CONSTRAINT "PK_7d9fa8b0e33d6d6a2e6477ddc79" PRIMARY KEY ("id")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5d0d8227a1870669dd47a53ea3"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "documentPurchaseId"`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "documentPurchaseId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a40e72f3a8cd651e439005df61"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "documentSellId"`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "documentSellId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9a9fc0ae90a341a6a77b95374"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "documentAdjustmentId"`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "documentAdjustmentId" integer`);
        await queryRunner.query(`CREATE INDEX "IDX_a9a9fc0ae90a341a6a77b95374" ON "operations" ("documentAdjustmentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a40e72f3a8cd651e439005df61" ON "operations" ("documentSellId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5d0d8227a1870669dd47a53ea3" ON "operations" ("documentPurchaseId") `);
        await queryRunner.query(`ALTER TABLE "operations" ADD CONSTRAINT "FK_5d0d8227a1870669dd47a53ea30" FOREIGN KEY ("documentPurchaseId") REFERENCES "document_purchases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "operations" ADD CONSTRAINT "FK_a40e72f3a8cd651e439005df617" FOREIGN KEY ("documentSellId") REFERENCES "document_sells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "operations" ADD CONSTRAINT "FK_a9a9fc0ae90a341a6a77b95374f" FOREIGN KEY ("documentAdjustmentId") REFERENCES "document_adjustments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "operations" DROP CONSTRAINT "FK_a9a9fc0ae90a341a6a77b95374f"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP CONSTRAINT "FK_a40e72f3a8cd651e439005df617"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP CONSTRAINT "FK_5d0d8227a1870669dd47a53ea30"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5d0d8227a1870669dd47a53ea3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a40e72f3a8cd651e439005df61"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a9a9fc0ae90a341a6a77b95374"`);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "documentAdjustmentId"`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "documentAdjustmentId" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_a9a9fc0ae90a341a6a77b95374" ON "operations" ("documentAdjustmentId") `);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "documentSellId"`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "documentSellId" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_a40e72f3a8cd651e439005df61" ON "operations" ("documentSellId") `);
        await queryRunner.query(`ALTER TABLE "operations" DROP COLUMN "documentPurchaseId"`);
        await queryRunner.query(`ALTER TABLE "operations" ADD "documentPurchaseId" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_5d0d8227a1870669dd47a53ea3" ON "operations" ("documentPurchaseId") `);
        await queryRunner.query(`ALTER TABLE "document_adjustments" DROP CONSTRAINT "PK_7d9fa8b0e33d6d6a2e6477ddc79"`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" ADD CONSTRAINT "PK_7d9fa8b0e33d6d6a2e6477ddc79" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "operations" ADD CONSTRAINT "FK_a9a9fc0ae90a341a6a77b95374f" FOREIGN KEY ("documentAdjustmentId") REFERENCES "document_adjustments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_sells" DROP CONSTRAINT "PK_077029a7529269234d0a7551259"`);
        await queryRunner.query(`ALTER TABLE "document_sells" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "document_sells" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_sells" ADD CONSTRAINT "PK_077029a7529269234d0a7551259" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "operations" ADD CONSTRAINT "FK_a40e72f3a8cd651e439005df617" FOREIGN KEY ("documentSellId") REFERENCES "document_sells"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_purchases" DROP CONSTRAINT "PK_da3380025ccdccb4d16cb6e1dae"`);
        await queryRunner.query(`ALTER TABLE "document_purchases" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "document_purchases" ADD "id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_purchases" ADD CONSTRAINT "PK_da3380025ccdccb4d16cb6e1dae" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "operations" ADD CONSTRAINT "FK_5d0d8227a1870669dd47a53ea30" FOREIGN KEY ("documentPurchaseId") REFERENCES "document_purchases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" ADD "code" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_adjustments" ADD CONSTRAINT "UQ_96ada1d4d9b92eff14de53429e9" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "document_sells" ADD "code" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_sells" ADD CONSTRAINT "UQ_ec6db31b10a478907e6ac0f123c" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "document_purchases" ADD "code" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_purchases" ADD CONSTRAINT "UQ_607828298fdb07f3eb6072f6d69" UNIQUE ("code")`);
    }

}
