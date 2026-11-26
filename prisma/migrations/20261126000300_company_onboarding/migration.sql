ALTER TABLE "Company"
  ADD COLUMN "rnc" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "tssEmployerCode" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "address" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "phone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "email" TEXT NOT NULL DEFAULT '';

ALTER TABLE "Account" ADD COLUMN "canManageCompany" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Branch" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  CONSTRAINT "Branch_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Branch_companyId_key" ON "Branch"("companyId");
