-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SavingGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DECIMAL NOT NULL,
    "deadline" DATETIME,
    "icon" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavingGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SavingGoal" ("createdAt", "deadline", "icon", "id", "isActive", "metadata", "name", "targetAmount", "updatedAt", "userId") SELECT "createdAt", "deadline", "icon", "id", "isActive", "metadata", "name", "targetAmount", "updatedAt", "userId" FROM "SavingGoal";
DROP TABLE "SavingGoal";
ALTER TABLE "new_SavingGoal" RENAME TO "SavingGoal";
CREATE UNIQUE INDEX "SavingGoal_userId_name_targetAmount_deadline_key" ON "SavingGoal"("userId", "name", "targetAmount", "deadline");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
