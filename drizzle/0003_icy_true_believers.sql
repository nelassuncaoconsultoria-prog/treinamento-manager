ALTER TABLE `courses` ADD `brand` enum('FORD','GWM','AMBOS') DEFAULT 'AMBOS' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `autoAssign` boolean DEFAULT true NOT NULL;