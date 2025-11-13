/*
  Warnings:

  - You are about to drop the `SavingGoal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `categoryIcon` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `goalId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "SavingGoal_userId_name_dueDate_key";

-- DropIndex
DROP INDEX "SavingGoal_name_idx";

-- DropIndex
DROP INDEX "SavingGoal_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SavingGoal";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isSavingGoal" BOOLEAN NOT NULL DEFAULT false,
    "targetAmout" DECIMAL,
    "currentAmout" DECIMAL,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("createdAt", "icon", "id", "name", "type", "updatedAt", "userId") SELECT "createdAt", "icon", "id", "name", "type", "updatedAt", "userId" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE INDEX "Category_userId_idx" ON "Category"("userId");
CREATE INDEX "Category_type_idx" ON "Category"("type");
CREATE UNIQUE INDEX "Category_userId_name_type_key" ON "Category"("userId", "name", "type");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" DECIMAL NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "categoryId", "createdAt", "date", "description", "id", "updatedAt", "userId") SELECT "amount", "categoryId", "createdAt", "date", "description", "id", "updatedAt", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_amount_idx" ON "Transaction"("amount");
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");
CREATE INDEX "Transaction_userId_categoryId_idx" ON "Transaction"("userId", "categoryId");
CREATE INDEX "Transaction_userId_amount_idx" ON "Transaction"("userId", "amount");
CREATE INDEX "Transaction_userId_date_idx" ON "Transaction"("userId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
