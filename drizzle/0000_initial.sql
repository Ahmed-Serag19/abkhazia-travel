CREATE TYPE "public"."booking_kind" AS ENUM('stay-unit', 'stay-room', 'rental', 'excursion', 'provision-order');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('new', 'confirmed', 'declined', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."property_kind" AS ENUM('compound', 'hosted');--> statement-breakpoint
CREATE TYPE "public"."provision_category" AS ENUM('dairy', 'eggs', 'honey', 'produce', 'bakery', 'preserves');--> statement-breakpoint
CREATE TYPE "public"."rental_category" AS ENUM('car', 'water', 'beach', 'camping', 'bike');--> statement-breakpoint
CREATE TABLE "booking_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "booking_kind" NOT NULL,
	"subject_slug" text NOT NULL,
	"ref_id" text,
	"start_date" text,
	"end_date" text,
	"guests" integer,
	"quantity" integer,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"message" text,
	"locale" text DEFAULT 'ru' NOT NULL,
	"status" "booking_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "excursions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"summary" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"duration_hours" real NOT NULL,
	"price_per_person" jsonb NOT NULL,
	"group_max" integer NOT NULL,
	"schedule" jsonb NOT NULL,
	"meeting_point" jsonb NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"includes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"highlights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "excursions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"photo" jsonb,
	"since" integer NOT NULL,
	"about" jsonb NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"response_time_hours" integer DEFAULT 24 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"kind" "property_kind" NOT NULL,
	"name" jsonb NOT NULL,
	"tagline" jsonb NOT NULL,
	"story" jsonb NOT NULL,
	"region" jsonb NOT NULL,
	"area" jsonb NOT NULL,
	"lat" real,
	"lng" real,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"amenities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"highlights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"check_in" text DEFAULT '14:00' NOT NULL,
	"check_out" text DEFAULT '11:00' NOT NULL,
	"house_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cancellation_free_until_days" integer DEFAULT 7 NOT NULL,
	"cancellation_note" jsonb NOT NULL,
	"rating" real,
	"review_count" integer,
	"host_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "provisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"seller_id" uuid NOT NULL,
	"category" "provision_category" NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"unit_label" jsonb NOT NULL,
	"price" jsonb NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"delivery_note" jsonb NOT NULL,
	CONSTRAINT "provisions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rentals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"category" "rental_category" NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"price_per_day" jsonb NOT NULL,
	"deposit" jsonb NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"delivery" boolean DEFAULT false NOT NULL,
	"pickup_point" jsonb NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	CONSTRAINT "rentals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_slug" text NOT NULL,
	"author" text NOT NULL,
	"date" text NOT NULL,
	"rating" real NOT NULL,
	"text" jsonb NOT NULL,
	"booked" jsonb,
	"reply" jsonb,
	"published" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"guests_per_room" integer NOT NULL,
	"price_per_person" jsonb NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"amenities" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sellers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"about" jsonb NOT NULL,
	"region" jsonb NOT NULL,
	"area" jsonb NOT NULL,
	"photo" jsonb,
	CONSTRAINT "sellers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"name" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"guests" integer NOT NULL,
	"bedrooms" integer NOT NULL,
	"beds" integer NOT NULL,
	"baths" integer NOT NULL,
	"size_sqm" integer,
	"price_per_night" jsonb NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"amenities" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_host_id_hosts_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."hosts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "provisions" ADD CONSTRAINT "provisions_seller_id_sellers_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."sellers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_requests_created_idx" ON "booking_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "booking_requests_status_idx" ON "booking_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "provisions_seller_idx" ON "provisions" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "provisions_category_idx" ON "provisions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "rentals_category_idx" ON "rentals" USING btree ("category");--> statement-breakpoint
CREATE INDEX "reviews_subject_idx" ON "reviews" USING btree ("subject_slug");--> statement-breakpoint
CREATE INDEX "rooms_property_idx" ON "rooms" USING btree ("property_id");--> statement-breakpoint
CREATE INDEX "units_property_idx" ON "units" USING btree ("property_id");