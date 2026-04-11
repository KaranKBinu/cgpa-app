-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scheme" TEXT DEFAULT 'Revision 2021'
);

-- CreateTable
CREATE TABLE "SyllabusSemester" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "programId" TEXT NOT NULL,
    CONSTRAINT "SyllabusSemester_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyllabusSubject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" REAL NOT NULL,
    "category" TEXT,
    "semesterId" TEXT NOT NULL,
    CONSTRAINT "SyllabusSubject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "SyllabusSemester" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Calculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL DEFAULT 'My CGPA',
    "cgpa" REAL NOT NULL DEFAULT 0,
    "programId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Calculation_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSemester" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "sgpa" REAL NOT NULL DEFAULT 0,
    "credits" REAL NOT NULL DEFAULT 0,
    "calculationId" TEXT NOT NULL,
    CONSTRAINT "UserSemester_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "Calculation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSubject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "credits" REAL NOT NULL,
    "grade" TEXT NOT NULL,
    "points" REAL NOT NULL,
    "userSemesterId" TEXT NOT NULL,
    CONSTRAINT "UserSubject_userSemesterId_fkey" FOREIGN KEY ("userSemesterId") REFERENCES "UserSemester" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_code_key" ON "Program"("code");
