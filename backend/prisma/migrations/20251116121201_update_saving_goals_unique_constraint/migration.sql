/*
  Warnings:

  - A unique constraint covering the columns `[userId,name,targetAmount,deadline]` on the table `SavingGoal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SavingGoal_userId_name_targetAmount_deadline_key" ON "SavingGoal"("userId", "name", "targetAmount", "deadline");
