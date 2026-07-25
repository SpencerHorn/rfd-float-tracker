CREATE TABLE `personnel_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`personnel_id` integer NOT NULL,
	`station_id` integer,
	`shift_id` integer,
	`assignment_type` text DEFAULT 'regular' NOT NULL,
	`position` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`is_primary` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`personnel_id`) REFERENCES `personnel`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`station_id`) REFERENCES `stations`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON UPDATE cascade ON DELETE restrict,
	CONSTRAINT "personnel_assignments_date_order" CHECK("personnel_assignments"."end_date" is null or "personnel_assignments"."end_date" >= "personnel_assignments"."start_date"),
	CONSTRAINT "personnel_assignments_type_valid" CHECK("personnel_assignments"."assignment_type" in (?, ?, ?, ?, ?))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `personnel_assignments_public_id_unique` ON `personnel_assignments` (`public_id`);--> statement-breakpoint
CREATE INDEX `personnel_assignments_personnel_idx` ON `personnel_assignments` (`personnel_id`);--> statement-breakpoint
CREATE INDEX `personnel_assignments_station_shift_idx` ON `personnel_assignments` (`station_id`,`shift_id`);--> statement-breakpoint
CREATE INDEX `personnel_assignments_active_idx` ON `personnel_assignments` (`personnel_id`,`end_date`);--> statement-breakpoint
CREATE TABLE `departments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`name` text NOT NULL,
	`abbreviation` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `departments_public_id_unique` ON `departments` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `departments_name_unique` ON `departments` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `departments_abbreviation_unique` ON `departments` (`abbreviation`);--> statement-breakpoint
CREATE TABLE `float_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`personnel_id` integer NOT NULL,
	`shift_id` integer NOT NULL,
	`source_station_id` integer NOT NULL,
	`destination_station_id` integer NOT NULL,
	`float_date` text NOT NULL,
	`reason` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`voided_at` integer,
	FOREIGN KEY (`personnel_id`) REFERENCES `personnel`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`shift_id`) REFERENCES `shifts`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`source_station_id`) REFERENCES `stations`(`id`) ON UPDATE cascade ON DELETE restrict,
	FOREIGN KEY (`destination_station_id`) REFERENCES `stations`(`id`) ON UPDATE cascade ON DELETE restrict,
	CONSTRAINT "float_events_different_stations" CHECK("float_events"."source_station_id" <> "float_events"."destination_station_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `float_events_public_id_unique` ON `float_events` (`public_id`);--> statement-breakpoint
CREATE INDEX `float_events_personnel_date_idx` ON `float_events` (`personnel_id`,`float_date`);--> statement-breakpoint
CREATE INDEX `float_events_source_date_idx` ON `float_events` (`source_station_id`,`float_date`);--> statement-breakpoint
CREATE INDEX `float_events_destination_date_idx` ON `float_events` (`destination_station_id`,`float_date`);--> statement-breakpoint
CREATE INDEX `float_events_shift_date_idx` ON `float_events` (`shift_id`,`float_date`);--> statement-breakpoint
CREATE TABLE `personnel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`department_id` integer NOT NULL,
	`employee_number` text,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`display_name` text,
	`rank` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `personnel_public_id_unique` ON `personnel` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `personnel_department_employee_number_unique` ON `personnel` (`department_id`,`employee_number`);--> statement-breakpoint
CREATE INDEX `personnel_department_idx` ON `personnel` (`department_id`);--> statement-breakpoint
CREATE INDEX `personnel_name_idx` ON `personnel` (`last_name`,`first_name`);--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`department_id` integer NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shifts_public_id_unique` ON `shifts` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `shifts_department_code_unique` ON `shifts` (`department_id`,`code`);--> statement-breakpoint
CREATE INDEX `shifts_department_idx` ON `shifts` (`department_id`);--> statement-breakpoint
CREATE TABLE `stations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_id` text NOT NULL,
	`department_id` integer NOT NULL,
	`station_number` integer NOT NULL,
	`name` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE cascade ON DELETE restrict,
	CONSTRAINT "stations_number_positive" CHECK("stations"."station_number" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stations_public_id_unique` ON `stations` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `stations_department_number_unique` ON `stations` (`department_id`,`station_number`);--> statement-breakpoint
CREATE INDEX `stations_department_idx` ON `stations` (`department_id`);