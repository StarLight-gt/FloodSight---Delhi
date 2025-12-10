CREATE TABLE `riskAssessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`overallRiskScore` float NOT NULL,
	`riskTier` enum('SAFE','MEDIUM','HIGH') NOT NULL,
	`highRiskZones` text,
	`keyFactors` text,
	`confidence` float NOT NULL,
	`reasoning` text,
	`correlationId` varchar(100),
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `riskAssessments_id` PRIMARY KEY(`id`)
);
