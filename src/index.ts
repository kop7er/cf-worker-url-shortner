import { Hono } from "hono";
import { cors } from "hono/cors";
import { bearerAuth } from "hono/bearer-auth";
import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import { eq, sql } from "drizzle-orm";
import { urlMappings, addUrlRecordSchema, getUrlRecordSchema, updateUrlRecordSchema } from "./schema";

export type Bindings = {

    API_TOKEN: string;

    D1_Database: D1Database;

}

const RESERVED_SLUGS = ["api", "dashboard"];

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", cors());

app.use("/api/*", (c, next) => bearerAuth({ token: c.env.API_TOKEN })(c, next));

app.get("/api/url-mappings", async (c) => {

    try {

        const result = await drizzle(c.env.D1_Database).select().from(urlMappings);

        return c.json(result);

    } catch (error) {

        console.error(error);

        return c.body(null, 500);

    }

});

app.get("/api/url-mappings/:slug", zValidator("param", getUrlRecordSchema), async (c) => {

    try {

        const { slug } = c.req.valid("param");

        const result = await drizzle(c.env.D1_Database).select().from(urlMappings).where(eq(urlMappings.slug, slug)).get();

        return c.json(result);

    } catch (error) {

        console.error(error);

        return c.body(null, 500);

    }

});

app.post("/api/url-mappings", zValidator("json", addUrlRecordSchema), async (c) => {

    try {

        const data = c.req.valid("json");

        if (RESERVED_SLUGS.includes(data.slug)) {

            return c.json({ message: "Slug is reserved" }, 400);

        }

        const result = await drizzle(c.env.D1_Database).insert(urlMappings).values(data).returning().get();

        return c.json(result, 201);

    } catch (error) {

        console.error(error);

        return c.body(null, 500);

    }

});

app.put("/api/url-mappings/:slug", zValidator("param", getUrlRecordSchema), zValidator("json", updateUrlRecordSchema), async (c) => {

    try {

        const data = c.req.valid("json");

        const { slug } = c.req.valid("param");

        const result = await drizzle(c.env.D1_Database)
            .update(urlMappings)
            .set({ ...data, updatedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(urlMappings.slug, slug))
            .returning()
            .get();

        return c.json(result);

    } catch (error) {

        console.error(error);

        return c.body(null, 500);

    }

});

app.delete("/api/url-mappings/:slug", zValidator("param", getUrlRecordSchema), async (c) => {

    try {

        const { slug } = c.req.valid("param");

        await drizzle(c.env.D1_Database).delete(urlMappings).where(eq(urlMappings.slug, slug));

        return c.body(null, 204);

    } catch (error) {

        console.error(error);

        return c.body(null, 500);

    }

});

app.get("/:slug", async (c) => {

    try {

        const slug = c.req.param("slug");

        const db = drizzle(c.env.D1_Database);

        const result = await db.select().from(urlMappings).where(eq(urlMappings.slug, slug)).get();

        if (!result) {

            return c.body(null, 404);

        }

        await db
            .update(urlMappings)
            .set({ visits: sql`${urlMappings.visits} + 1`, lastVisitedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(urlMappings.slug, slug));

        return c.redirect(result.targetURL);

    } catch (error) {

        console.error(error);

        return c.body(null, 500);

    }

});

export default app;
