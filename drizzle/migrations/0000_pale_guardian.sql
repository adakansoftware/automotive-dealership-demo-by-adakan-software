CREATE TYPE "public"."admin_role" AS ENUM('owner', 'editor');--> statement-breakpoint
CREATE TYPE "public"."body_type" AS ENUM('Sedan', 'Coupe', 'SUV', 'Station Wagon', 'Hatchback');--> statement-breakpoint
CREATE TYPE "public"."fuel_type" AS ENUM('Benzin', 'Dizel', 'Hibrit', 'Elektrik');--> statement-breakpoint
CREATE TYPE "public"."inquiry_source" AS ENUM('form', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'contacted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."transmission_type" AS ENUM('Otomatik', 'Manuel');--> statement-breakpoint
CREATE TYPE "public"."vehicle_condition" AS ENUM('Sıfır', 'İkinci El');--> statement-breakpoint
CREATE TYPE "public"."vehicle_status" AS ENUM('Satışta', 'Rezerve', 'Satıldı');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"name" text DEFAULT '' NOT NULL,
	"role" "admin_role" DEFAULT 'editor' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"actor_id" bigint,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"diff" jsonb,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"vehicle_id" bigint,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"source" "inquiry_source" DEFAULT 'form' NOT NULL,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_config" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_images" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"vehicle_id" bigint NOT NULL,
	"url" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_key" boolean DEFAULT false NOT NULL,
	CONSTRAINT "vehicle_images_vehicle_sort_unique" UNIQUE("vehicle_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "vehicle_specs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"vehicle_id" bigint NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "vehicle_specs_vehicle_label_unique" UNIQUE("vehicle_id","label")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"trim" text DEFAULT '' NOT NULL,
	"year" integer NOT NULL,
	"price" bigint NOT NULL,
	"mileage" integer NOT NULL,
	"fuel" "fuel_type" NOT NULL,
	"transmission" "transmission_type" NOT NULL,
	"body" "body_type" NOT NULL,
	"color" text DEFAULT '' NOT NULL,
	"status" "vehicle_status" DEFAULT 'Satışta' NOT NULL,
	"condition" "vehicle_condition" DEFAULT 'İkinci El' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_admin_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."admin_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_images" ADD CONSTRAINT "vehicle_images_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_specs" ADD CONSTRAINT "vehicle_specs_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "vehicle_images_vehicle_idx" ON "vehicle_images" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "vehicle_specs_vehicle_idx" ON "vehicle_specs" USING btree ("vehicle_id");