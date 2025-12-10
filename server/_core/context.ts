import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // For local / hackathon use we skip Manus OAuth and treat every visitor
  // as a logged-in demo user. This keeps the UI working without external auth.
  const now = new Date();
  const user: User = {
    id: 1,
    openId: "local-demo-user",
    name: "Local Demo User",
    email: null,
    loginMethod: "local",
    role: "admin",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  };

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
