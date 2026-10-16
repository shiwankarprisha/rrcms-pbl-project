-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'RECEPTIONIST', 'TECHNICIAN', 'DELIVERY_STAFF', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    `phone` VARCHAR(20) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepairRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requestNumber` VARCHAR(30) NOT NULL,
    `customerId` INTEGER NOT NULL,
    `deviceType` VARCHAR(100) NOT NULL,
    `deviceBrand` VARCHAR(100) NULL,
    `deviceModel` VARCHAR(100) NULL,
    `serialNumber` VARCHAR(100) NULL,
    `issueDescription` TEXT NOT NULL,
    `status` ENUM('SUBMITTED', 'UNDER_INSPECTION', 'AWAITING_APPROVAL', 'APPROVED', 'IN_REPAIR', 'REPAIR_COMPLETED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'SUBMITTED',
    `estimatedCost` DECIMAL(10, 2) NULL,
    `finalCost` DECIMAL(10, 2) NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `repairCompletedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RepairRequest_requestNumber_key`(`requestNumber`),
    INDEX `RepairRequest_customerId_idx`(`customerId`),
    INDEX `RepairRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TechnicianAssignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repairId` INTEGER NOT NULL,
    `technicianId` INTEGER NOT NULL,
    `status` ENUM('ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REASSIGNED') NOT NULL DEFAULT 'ASSIGNED',
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,

    INDEX `TechnicianAssignment_repairId_idx`(`repairId`),
    INDEX `TechnicianAssignment_technicianId_idx`(`technicianId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PickupDelivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repairId` INTEGER NOT NULL,
    `assignedStaffId` INTEGER NULL,
    `type` ENUM('PICKUP', 'DELIVERY') NOT NULL,
    `status` ENUM('SCHEDULED', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `scheduledAt` DATETIME(3) NOT NULL,
    `address` TEXT NOT NULL,
    `customerNotes` TEXT NULL,
    `completedAt` DATETIME(3) NULL,
    `customerConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `confirmedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PickupDelivery_repairId_idx`(`repairId`),
    INDEX `PickupDelivery_status_idx`(`status`),
    INDEX `PickupDelivery_scheduledAt_idx`(`scheduledAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RepairStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `repairId` INTEGER NOT NULL,
    `oldStatus` ENUM('SUBMITTED', 'UNDER_INSPECTION', 'AWAITING_APPROVAL', 'APPROVED', 'IN_REPAIR', 'REPAIR_COMPLETED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CLOSED', 'CANCELLED') NULL,
    `newStatus` ENUM('SUBMITTED', 'UNDER_INSPECTION', 'AWAITING_APPROVAL', 'APPROVED', 'IN_REPAIR', 'REPAIR_COMPLETED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CLOSED', 'CANCELLED') NOT NULL,
    `changedById` INTEGER NULL,
    `note` TEXT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RepairStatusHistory_repairId_changedAt_idx`(`repairId`, `changedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RepairRequest` ADD CONSTRAINT `RepairRequest_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TechnicianAssignment` ADD CONSTRAINT `TechnicianAssignment_repairId_fkey` FOREIGN KEY (`repairId`) REFERENCES `RepairRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TechnicianAssignment` ADD CONSTRAINT `TechnicianAssignment_technicianId_fkey` FOREIGN KEY (`technicianId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PickupDelivery` ADD CONSTRAINT `PickupDelivery_repairId_fkey` FOREIGN KEY (`repairId`) REFERENCES `RepairRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PickupDelivery` ADD CONSTRAINT `PickupDelivery_assignedStaffId_fkey` FOREIGN KEY (`assignedStaffId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepairStatusHistory` ADD CONSTRAINT `RepairStatusHistory_repairId_fkey` FOREIGN KEY (`repairId`) REFERENCES `RepairRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
