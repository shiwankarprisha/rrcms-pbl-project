-- DropForeignKey
ALTER TABLE `pickupdelivery` DROP FOREIGN KEY `PickupDelivery_assignedStaffId_fkey`;

-- DropIndex
DROP INDEX `PickupDelivery_assignedStaffId_fkey` ON `pickupdelivery`;

-- AlterTable
ALTER TABLE `pickupdelivery` DROP COLUMN `assignedStaffId`,
    ADD COLUMN `assignedPartnerId` INTEGER NULL,
    ADD COLUMN `deliveryNotes` TEXT NULL;

-- AlterTable
ALTER TABLE `repairrequest` ADD COLUMN `diagnosisNotes` TEXT NULL,
    ADD COLUMN `estimateNotes` TEXT NULL,
    ADD COLUMN `estimateStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NULL,
    ADD COLUMN `estimatedDays` INTEGER NULL,
    ADD COLUMN `imageUrl` VARCHAR(255) NULL,
    ADD COLUMN `repairNotes` TEXT NULL,
    ADD COLUMN `vendorId` INTEGER NULL,
    MODIFY `status` ENUM('SUBMITTED', 'UNDER_INSPECTION', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_REPAIR', 'REPAIR_COMPLETED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE `repairstatushistory` MODIFY `oldStatus` ENUM('SUBMITTED', 'UNDER_INSPECTION', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_REPAIR', 'REPAIR_COMPLETED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CLOSED', 'CANCELLED') NULL,
    MODIFY `newStatus` ENUM('SUBMITTED', 'UNDER_INSPECTION', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'IN_REPAIR', 'REPAIR_COMPLETED', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CLOSED', 'CANCELLED') NOT NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'CUSTOMER', 'VENDOR', 'TECHNICIAN', 'DELIVERY_PARTNER') NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE `DeliveryStatusHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `deliveryId` INTEGER NOT NULL,
    `oldStatus` ENUM('SCHEDULED', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED', 'FAILED', 'CANCELLED') NULL,
    `newStatus` ENUM('SCHEDULED', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL,
    `changedById` INTEGER NULL,
    `note` TEXT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `DeliveryStatusHistory_deliveryId_changedAt_idx`(`deliveryId`, `changedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `PickupDelivery_assignedPartnerId_idx` ON `PickupDelivery`(`assignedPartnerId`);

-- CreateIndex
CREATE INDEX `RepairRequest_vendorId_idx` ON `RepairRequest`(`vendorId`);

-- AddForeignKey
ALTER TABLE `RepairRequest` ADD CONSTRAINT `RepairRequest_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PickupDelivery` ADD CONSTRAINT `PickupDelivery_assignedPartnerId_fkey` FOREIGN KEY (`assignedPartnerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeliveryStatusHistory` ADD CONSTRAINT `DeliveryStatusHistory_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `PickupDelivery`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
