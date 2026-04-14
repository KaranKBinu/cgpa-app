-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "appName" TEXT NOT NULL DEFAULT 'PolyCGPA',
    "revision" TEXT NOT NULL DEFAULT 'Revision 2021',
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Calculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL DEFAULT 'My CGPA',
    "cgpa" REAL NOT NULL DEFAULT 0,
    "programId" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Calculation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Calculation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Calculation" ("cgpa", "createdAt", "id", "label", "programId", "updatedAt") SELECT "cgpa", "createdAt", "id", "label", "programId", "updatedAt" FROM "Calculation";
DROP TABLE "Calculation";
ALTER TABLE "new_Calculation" RENAME TO "Calculation";
CREATE TABLE "new_SyllabusSemester" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "isInternship" BOOLEAN NOT NULL DEFAULT false,
    "programId" TEXT NOT NULL,
    CONSTRAINT "SyllabusSemester_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SyllabusSemester" ("id", "name", "number", "programId") SELECT "id", "name", "number", "programId" FROM "SyllabusSemester";
DROP TABLE "SyllabusSemester";
ALTER TABLE "new_SyllabusSemester" RENAME TO "SyllabusSemester";
CREATE TABLE "new_SyllabusSubject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" REAL NOT NULL,
    "category" TEXT,
    "semesterId" TEXT NOT NULL,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    CONSTRAINT "SyllabusSubject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "SyllabusSemester" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SyllabusSubject_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "SyllabusSubject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SyllabusSubject" ("category", "code", "credits", "id", "name", "semesterId") SELECT "category", "code", "credits", "id", "name", "semesterId" FROM "SyllabusSubject";
DROP TABLE "SyllabusSubject";
ALTER TABLE "new_SyllabusSubject" RENAME TO "SyllabusSubject";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
