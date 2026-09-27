UPDATE "users" SET "email" = lower("email") WHERE "email" <> lower("email");--> statement-breakpoint
UPDATE "otp_codes" SET "email" = lower("email") WHERE "email" <> lower("email");--> statement-breakpoint
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_email_lowercase" CHECK ("otp_codes"."email" = lower("otp_codes"."email"));--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_lowercase" CHECK ("users"."email" = lower("users"."email"));
