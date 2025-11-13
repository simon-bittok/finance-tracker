/*
  Warnings:

  - You are about to drop the `MonthHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `YearHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `type` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - A unique constraint covering the columns `[userId,name,type]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_name_userId_type_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MonthHistory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "YearHistory";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "SavingGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DECIMAL NOT NULL DEFAULT 0,
    "currentAmount" DECIMAL NOT NULL DEFAULT 0,
    "dueDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavingGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" DECIMAL NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "categoryIcon" TEXT NOT NULL,
    "goalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Transaction_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "SavingGoal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "categoryIcon", "categoryId", "createdAt", "date", "description", "id", "updatedAt", "userId") SELECT "amount", "categoryIcon", "categoryId", "createdAt", "date", "description", "id", "updatedAt", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_amount_idx" ON "Transaction"("amount");
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_categoryId_idx" ON "Transaction"("categoryId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SavingGoal_userId_idx" ON "SavingGoal"("userId");

-- CreateIndex
CREATE INDEX "SavingGoal_name_idx" ON "SavingGoal"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SavingGoal_userId_name_dueDate_key" ON "SavingGoal"("userId", "name", "dueDate");

-- CreateIndex
CREATE INDEX "Category_userId_idx" ON "Category"("userId");

-- CreateIndex
CREATE INDEX "Category_type_idx" ON "Category"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_name_type_key" ON "Category"("userId", "name", "type");
