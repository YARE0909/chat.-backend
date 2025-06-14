/*
  Warnings:

  - Added the required column `type` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageTypesType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'VOICE', 'VIDEO');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "type" "MessageTypesType" NOT NULL;
