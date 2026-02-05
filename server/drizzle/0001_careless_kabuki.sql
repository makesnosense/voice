CREATE TYPE "public"."platform" AS ENUM('web', 'ios', 'android');--> statement-breakpoint
CREATE TABLE "devices" (
	"jti" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "platform" NOT NULL,
	"device_name" varchar(100),
	"fcm_token" varchar(255),
	"voip_push_token" varchar(255),
	"last_seen" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_jti_refresh_tokens_jti_fk" FOREIGN KEY ("jti") REFERENCES "public"."refresh_tokens"("jti") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;