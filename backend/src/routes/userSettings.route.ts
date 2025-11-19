import { Hono } from "hono";
import { requireAuth } from "@/middlewares/auth.middleware.js";
import * as userSettingsRepository from "@/repository/userSettings.repository.js";
import type { AuthType } from "@/utils/auth.utils.js";
import { prisma } from "@/utils/prisma.utils.js";

const app = new Hono<{ Bindings: AuthType }>({
  strict: false,
});

app.post("/", requireAuth, async (c) => {
  const user = c.get("user");
  const { currency } = await c.req.json();

  const userSettings = await userSettingsRepository.createUserSettings(
    user.id,
    currency,
    prisma,
  );

  return c.json(userSettings, 201);
});

app.patch("/", requireAuth, async (c) => {
  const user = c.get("user");
  const { currency } = await c.req.json();

  const userSettings = await userSettingsRepository.updateUserCurrency(
    user.id,
    currency,
    prisma,
  );

  return c.json(userSettings, 201);
});

app.get("/", requireAuth, async (c) => {
  const user = c.get("user");

  const settings = await userSettingsRepository.getUserSettings(user.id);

  return c.json(settings);
});

export default {
  handler: app,
  path: "/user-settings",
};
