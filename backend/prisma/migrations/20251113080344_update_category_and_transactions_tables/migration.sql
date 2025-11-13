/*
  Warnings:

  - You are about to drop the column `currentAmout` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `isSavingGoal` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `targetAmout` on the `Category` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Transaction_categoryId_idx";

-- DropIndex
DROP INDEX "Transaction_date_idx";

-- DropIndex
DROP INDEX "Transaction_amount_idx";

-- CreateTable
CREATE TABLE "GoalContribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoalContribution_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "SavingGoal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GoalContribution_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavingGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DECIMAL NOT NULL,
    "currentAmount" DECIMAL NOT NULL DEFAULT 0,
    "deadline" DATETIME,
    "icon" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavingGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" TEXT NOT NULL,
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "GoalContribution_transactionId_key" ON "GoalContribution"("transactionId");
