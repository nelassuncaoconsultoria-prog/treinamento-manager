CREATE TABLE `course_required_functions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`function` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `course_required_functions_id` PRIMARY KEY(`id`)
);
