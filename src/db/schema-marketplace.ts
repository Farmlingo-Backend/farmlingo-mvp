// src/db/schema-marketplace.ts
// Marketplace and Learning Materials Database Schema

import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { InferModel } from "drizzle-orm";
import { users, institutions, courses, lessons } from "./schema";

/**
 * Marketplace Enums
 */
export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "active",
  "inactive",
  "sold_out",
  "suspended",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "completed",
  "cancelled",
  "refunded",
  "failed",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
  "partial_refund",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
  "flagged",
]);

export const categoryStatusEnum = pgEnum("category_status", [
  "active",
  "inactive",
  "archived",
]);

/**
 * Learning Materials Enums
 */
export const materialTypeEnum = pgEnum("material_type", [
  "video",
  "pdf",
  "document",
  "audio",
  "image",
  "interactive",
  "link",
]);

export const materialStatusEnum = pgEnum("material_status", [
  "draft",
  "published",
  "archived",
  "private",
]);

export const accessLevelEnum = pgEnum("access_level", [
  "public",
  "enrolled",
  "instructor",
  "admin",
]);

/**
 * Marketplace Tables
 */

/**
 * Marketplace Categories
 */
export const marketplace_categories = pgTable("marketplace_categories", {
  category_id: uuid("category_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  parent_category_id: uuid("parent_category_id"),
  display_order: integer("display_order").default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type MarketplaceCategory = InferModel<typeof marketplace_categories>;
export type NewMarketplaceCategory = InferModel<typeof marketplace_categories, "insert">;

/**
 * Marketplace Listings
 */
export const marketplace_listings = pgTable("marketplace_listings", {
  listing_id: uuid("listing_id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  seller_id: uuid("seller_id").notNull(),
  institution_id: uuid("institution_id"),
  category_id: uuid("category_id"),
  listing_type: varchar("listing_type", { length: 50 }).default("product"),
  status: listingStatusEnum("status").default("draft"),
  stock_quantity: integer("stock_quantity").default(0),
  is_digital: boolean("is_digital").default(false),
  download_url: varchar("download_url", { length: 1000 }),
  thumbnail_url: varchar("thumbnail_url", { length: 1000 }),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type MarketplaceListing = InferModel<typeof marketplace_listings>;
export type NewMarketplaceListing = InferModel<typeof marketplace_listings, "insert">;

/**
 * Marketplace Orders
 */
export const orders = pgTable("orders", {
  order_id: uuid("order_id").primaryKey().defaultRandom(),
  buyer_id: uuid("buyer_id").notNull(),
  listing_id: uuid("listing_id").notNull(),
  seller_id: uuid("seller_id").notNull(),
  institution_id: uuid("institution_id"),
  quantity: integer("quantity").default(1),
  unit_price: doublePrecision("unit_price").notNull(),
  total_amount: doublePrecision("total_amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  payment_status: paymentStatusEnum("payment_status").default("pending"),
  order_status: orderStatusEnum("order_status").default("pending"),
  shipping_address: jsonb("shipping_address"),
  billing_address: jsonb("billing_address"),
  payment_method: varchar("payment_method", { length: 100 }),
  transaction_id: varchar("transaction_id", { length: 256 }),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type Order = InferModel<typeof orders>;
export type NewOrder = InferModel<typeof orders, "insert">;

/**
 * Marketplace Reviews
 */
export const marketplace_reviews = pgTable("marketplace_reviews", {
  review_id: uuid("review_id").primaryKey().defaultRandom(),
  order_id: uuid("order_id").notNull(),
  reviewer_id: uuid("reviewer_id").notNull(),
  reviewee_id: uuid("reviewee_id").notNull(),
  rating: integer("rating").notNull(),
  review_text: text("review_text"),
  review_type: varchar("review_type", { length: 20 }).default("buyer_to_seller"),
  status: reviewStatusEnum("status").default("pending"),
  helpful_count: integer("helpful_count").default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type MarketplaceReview = InferModel<typeof marketplace_reviews>;
export type NewMarketplaceReview = InferModel<typeof marketplace_reviews, "insert">;

/**
 * Learning Materials Tables
 */

/**
 * Learning Materials
 */
export const learning_materials = pgTable("learning_materials", {
  material_id: uuid("material_id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  file_url: varchar("file_url", { length: 1000 }),
  file_type: materialTypeEnum("file_type").notNull(),
  file_size: integer("file_size"),
  file_name: varchar("file_name", { length: 512 }),
  mime_type: varchar("mime_type", { length: 128 }),
  duration_seconds: integer("duration_seconds"),
  thumbnail_url: varchar("thumbnail_url", { length: 1000 }),
  uploaded_by: uuid("uploaded_by").notNull(),
  course_id: uuid("course_id"),
  lesson_id: uuid("lesson_id"),
  institution_id: uuid("institution_id"),
  access_level: accessLevelEnum("access_level").default("public"),
  status: materialStatusEnum("status").default("draft"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type LearningMaterial = InferModel<typeof learning_materials>;
export type NewLearningMaterial = InferModel<typeof learning_materials, "insert">;

/**
 * Material Access Logs
 */
export const material_access_logs = pgTable("material_access_logs", {
  log_id: uuid("log_id").primaryKey().defaultRandom(),
  material_id: uuid("material_id").notNull(),
  user_id: uuid("user_id").notNull(),
  access_type: varchar("access_type", { length: 50 }).default("view"),
  ip_address: varchar("ip_address", { length: 64 }),
  user_agent: varchar("user_agent", { length: 1000 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type MaterialAccessLog = InferModel<typeof material_access_logs>;
export type NewMaterialAccessLog = InferModel<typeof material_access_logs, "insert">;

/**
 * Material Categories (for organizing learning materials)
 */
export const material_categories = pgTable("material_categories", {
  category_id: uuid("category_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  parent_category_id: uuid("parent_category_id"),
  display_order: integer("display_order").default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type MaterialCategory = InferModel<typeof material_categories>;
export type NewMaterialCategory = InferModel<typeof material_categories, "insert">;

/**
 * Material Tags
 */
export const material_tags = pgTable("material_tags", {
  tag_id: uuid("tag_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 128 }).notNull().unique(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type MaterialTag = InferModel<typeof material_tags>;
export type NewMaterialTag = InferModel<typeof material_tags, "insert">;

/**
 * Material-Tag Relationships
 */
export const material_tag_relationships = pgTable("material_tag_relationships", {
  relationship_id: uuid("relationship_id").primaryKey().defaultRandom(),
  material_id: uuid("material_id").notNull(),
  tag_id: uuid("tag_id").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type MaterialTagRelationship = InferModel<typeof material_tag_relationships>;
export type NewMaterialTagRelationship = InferModel<typeof material_tag_relationships, "insert">;

/**
 * Relations
 */

/* Marketplace Categories Relations */
export const marketplaceCategoriesRelations = relations(marketplace_categories, ({ many, one }) => ({
  parent: one(marketplace_categories, {
    fields: [marketplace_categories.parent_category_id],
    references: [marketplace_categories.category_id],
  }),
  children: many(marketplace_categories),
  listings: many(marketplace_listings),
}));

/* Marketplace Listings Relations */
export const marketplaceListingsRelations = relations(marketplace_listings, ({ one, many }) => ({
  seller: one(users, { fields: [marketplace_listings.seller_id], references: [users.user_id] }),
  institution: one(institutions, { fields: [marketplace_listings.institution_id], references: [institutions.institution_id] }),
  category: one(marketplace_categories, { fields: [marketplace_listings.category_id], references: [marketplace_categories.category_id] }),
  orders: many(orders),
  reviews: many(marketplace_reviews),
}));

/* Orders Relations */
export const ordersRelations = relations(orders, ({ one }) => ({
  buyer: one(users, { fields: [orders.buyer_id], references: [users.user_id] }),
  listing: one(marketplace_listings, { fields: [orders.listing_id], references: [marketplace_listings.listing_id] }),
}));

/* Marketplace Reviews Relations */
export const marketplaceReviewsRelations = relations(marketplace_reviews, ({ one }) => ({
  order: one(orders, { fields: [marketplace_reviews.order_id], references: [orders.order_id] }),
  reviewer: one(users, { fields: [marketplace_reviews.reviewer_id], references: [users.user_id] }),
  reviewee: one(users, { fields: [marketplace_reviews.reviewee_id], references: [users.user_id] }),
}));

/* Learning Materials Relations */
export const learningMaterialsRelations = relations(learning_materials, ({ one, many }) => ({
  uploadedBy: one(users, { fields: [learning_materials.uploaded_by], references: [users.user_id] }),
  institution: one(institutions, { fields: [learning_materials.institution_id], references: [institutions.institution_id] }),
  course: one(courses, { fields: [learning_materials.course_id], references: [courses.course_id] }),
  lesson: one(lessons, { fields: [learning_materials.lesson_id], references: [lessons.lesson_id] }),
  accessLogs: many(material_access_logs),
  tagRelationships: many(material_tag_relationships),
}));

/* Material Access Logs Relations */
export const materialAccessLogsRelations = relations(material_access_logs, ({ one }) => ({
  material: one(learning_materials, { fields: [material_access_logs.material_id], references: [learning_materials.material_id] }),
  user: one(users, { fields: [material_access_logs.user_id], references: [users.user_id] }),
}));

/* Material Categories Relations */
export const materialCategoriesRelations = relations(material_categories, ({ many, one }) => ({
  parent: one(material_categories, {
    fields: [material_categories.parent_category_id],
    references: [material_categories.category_id],
  }),
  children: many(material_categories),
}));

/* Material Tags Relations */
export const materialTagsRelations = relations(material_tags, ({ many }) => ({
  relationships: many(material_tag_relationships),
}));

/* Material Tag Relationships Relations */
export const materialTagRelationshipsRelations = relations(material_tag_relationships, ({ one }) => ({
  material: one(learning_materials, { fields: [material_tag_relationships.material_id], references: [learning_materials.material_id] }),
  tag: one(material_tags, { fields: [material_tag_relationships.tag_id], references: [material_tags.tag_id] }),
}));

/**
 * Export all tables and enums for Drizzle-Kit
 */
export {
  // Tables
  marketplace_categories as marketplaceCategoriesTable,
  marketplace_listings as marketplaceListingsTable,
  orders as ordersTable,
  marketplace_reviews as marketplaceReviewsTable,
  learning_materials as learningMaterialsTable,
  material_access_logs as materialAccessLogsTable,
  material_categories as materialCategoriesTable,
  material_tags as materialTagsTable,
  material_tag_relationships as materialTagRelationshipsTable,
  
  // Enums
  listingStatusEnum as listing_status_enum,
  orderStatusEnum as order_status_enum,
  paymentStatusEnum as payment_status_enum,
  reviewStatusEnum as review_status_enum,
  categoryStatusEnum as category_status_enum,
  materialTypeEnum as material_type_enum,
  materialStatusEnum as material_status_enum,
  accessLevelEnum as access_level_enum,
};