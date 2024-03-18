import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const SLUG_REGEX = /^[a-zA-Z0-9-]+$/;

export const urlMappings = sqliteTable("url_mappings", {

    id: integer("id").primaryKey({ autoIncrement: true }),

    slug: text("slug").unique().notNull(),

    targetURL: text("target_url").notNull(),

    visits: integer("visits").notNull().default(0),

    lastVisitedAt: text("last_visited_at"),

    disabled: integer("disabled", { mode: "boolean" }).notNull().default(false),

    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),

    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)

});

const insertUrlRecordSchema = createInsertSchema(urlMappings, {

    slug: (schema) => schema.slug.regex(SLUG_REGEX),

    targetURL: (schema) => schema.targetURL.url()

});

const selectUrlRecordSchema = createSelectSchema(urlMappings, {

    slug: (schema) => schema.slug.regex(SLUG_REGEX)

});

export const addUrlRecordSchema = insertUrlRecordSchema.pick({ slug: true, targetURL: true });

export const getUrlRecordSchema = selectUrlRecordSchema.pick({ slug: true });

export const updateUrlRecordSchema = insertUrlRecordSchema.pick({ slug: true, targetURL: true, disabled: true }).partial();
