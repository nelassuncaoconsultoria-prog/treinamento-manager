CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeCode` varchar(50) NOT NULL,
	`storeName` varchar(255) NOT NULL,
	`city` varchar(255),
	`status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `stores_storeCode_unique` UNIQUE(`storeCode`)
);
--> statement-breakpoint
ALTER TABLE `employees` DROP INDEX `employees_email_unique`;--> statement-breakpoint
ALTER TABLE `course_assignments` ADD `storeId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `storeId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `employees` ADD `storeId` int NOT NULL;