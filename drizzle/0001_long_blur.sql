CREATE TABLE `course_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`courseId` int NOT NULL,
	`status` enum('pendente','concluido') NOT NULL DEFAULT 'pendente',
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`certificateUrl` text,
	`certificateKey` varchar(512),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_folders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`area` enum('vendas','pos_vendas') NOT NULL,
	`folderId` varchar(255) NOT NULL,
	`folderPath` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_folders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`area` enum('vendas','pos_vendas') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`function` varchar(255) NOT NULL,
	`area` enum('vendas','pos_vendas') NOT NULL,
	`status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`),
	CONSTRAINT `employees_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `google_drive_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`expiresAt` timestamp,
	`rootFolderId` varchar(255),
	`vendaFolderId` varchar(255),
	`posVendaFolderId` varchar(255),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `google_drive_config_id` PRIMARY KEY(`id`)
);
