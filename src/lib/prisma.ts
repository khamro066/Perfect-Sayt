import path from "path";
import { PrismaClient } from "@/generated/prisma/client";

// Prisma's own engine-discovery heuristics fail to find the query engine
// binary once Next.js bundles this into its own server chunk files on
// Vercel — verified via a runtime fs.readdirSync check that the file IS
// physically present at this exact path, Prisma just doesn't guess it.
// Point it there directly, only on Vercel (local dev resolves fine as-is).
if (process.env.VERCEL) {
  process.env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(
    process.cwd(),
    "src/generated/prisma/libquery_engine-rhel-openssl-3.0.x.so.node"
  );
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
