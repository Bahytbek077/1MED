import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('patient'),
  avatar: text("avatar"),
  specialization: text("specialization"),
  experience: integer("experience"),
  phone: text("phone"),
  bio: text("bio"),
  doctorId: varchar("doctor_id", { length: 36 }),
});

export const services = pgTable("services", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
});

export const plans = pgTable("plans", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  description: text("description").notNull(),
  features: text("features").array().notNull().default(sql`ARRAY[]::text[]`),
  allowedServiceIds: text("allowed_service_ids").array().notNull().default(sql`ARRAY[]::text[]`),
  isTrial: integer("is_trial").notNull().default(0),
  trialDays: integer("trial_days"),
  isAvailable: integer("is_available").notNull().default(1),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: varchar("plan_id", { length: 36 }).notNull().references(() => plans.id),
  status: text("status").notNull().default('active'),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  doctorNotes: text("doctor_notes"),
});

export const steps = pgTable("steps", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id", { length: 36 }).notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default('pending'),
  date: timestamp("date"),
  type: text("type").notNull(),
  serviceId: varchar("service_id", { length: 36 }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const messages = pgTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  fromId: varchar("from_id", { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  toId: varchar("to_id", { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  isAgent: integer("is_agent").notNull().default(0),
  severity: text("severity"),
});

export const alerts = pgTable("alerts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  doctorId: varchar("doctor_id", { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  text: text("text").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default('pending'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, startDate: true }).extend({
  endDate: z.date().optional(),
});
export const insertStepSchema = createInsertSchema(steps).omit({ id: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertStep = z.infer<typeof insertStepSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type User = typeof users.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Step = typeof steps.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Alert = typeof alerts.$inferSelect;

export type SubscriptionWithSteps = Subscription & { route: Step[] };
