CREATE TABLE "CommercialQuoteRequest" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locale" TEXT NOT NULL,
    "catalogVersion" TEXT NOT NULL,
    "selection" JSONB NOT NULL,
    "contact" JSONB NOT NULL,
    CONSTRAINT "CommercialQuoteRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommercialQuoteRequest_createdAt_idx" ON "CommercialQuoteRequest"("createdAt");
