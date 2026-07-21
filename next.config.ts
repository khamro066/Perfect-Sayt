import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Prisma Client generates to a non-default location (see
  // prisma/schema.prisma's generator `output`). Next.js's serverless
  // function file-tracing doesn't always follow that custom path and can
  // leave the native query engine binary out of the deployed bundle —
  // this forces it to always be included.
  outputFileTracingIncludes: {
    "/**/*": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
