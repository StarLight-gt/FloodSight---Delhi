CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`audience` enum('ops','public') NOT NULL,
	`message` text NOT NULL,
	`riskTier` enum('SAFE','MEDIUM','HIGH') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forecasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`zone` varchar(100) NOT NULL,
	`rainProb` float NOT NULL,
	`rainAmount` float,
	`riskScore` float NOT NULL DEFAULT 0,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `forecasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('drain','citizen') NOT NULL,
	`description` text NOT NULL,
	`zone` varchar(100) NOT NULL,
	`photoUrl` text,
	`locationName` varchar(200),
	`latitude` float,
	`longitude` float,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialIncidents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text` text NOT NULL,
	`user` varchar(100) NOT NULL,
	`zone` varchar(100) NOT NULL,
	`riskFlag` int NOT NULL DEFAULT 0,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `socialIncidents_id` PRIMARY KEY(`id`)
);
