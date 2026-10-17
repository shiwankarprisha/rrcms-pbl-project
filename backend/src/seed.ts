import bcrypt from "bcryptjs";
import { UserRole, RepairStatus, DeliveryType, DeliveryStatus } from "@prisma/client";
import { prisma } from "./prisma.js";

async function main() {
  console.log("Seeding RRCMS database with verified Nagpur operations accounts...");

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Password@123", salt);

  const users = [
    // 1 Admin
    {
      email: "admin@rrcms.local",
      name: "Vikramaditya Sharma (Chief Operations Admin)",
      role: UserRole.ADMIN,
      phone: "+91 98230 11001",
      passwordHash,
    },

    // 2 Vendors (Nagpur Authorised Service Centres)
    {
      email: "vendor1@rrcms.local",
      name: "Priya Deshmukh — Apex MicroTech (Dharampeth, Nagpur)",
      role: UserRole.VENDOR,
      phone: "+91 98230 22001",
      passwordHash,
    },
    {
      email: "vendor2@rrcms.local",
      name: "Ramesh Kulkarni — Vidarbha Electronics Care (Sitabuldi, Nagpur)",
      role: UserRole.VENDOR,
      phone: "+91 98230 22002",
      passwordHash,
    },

    // 2 Technicians
    {
      email: "tech1@rrcms.local",
      name: "Amitabh Joshi (Chip-Level Lead Tech)",
      role: UserRole.TECHNICIAN,
      phone: "+91 98230 33001",
      passwordHash,
    },
    {
      email: "tech2@rrcms.local",
      name: "Sneha Patil (Micro-Soldering & Display Specialist)",
      role: UserRole.TECHNICIAN,
      phone: "+91 98230 33002",
      passwordHash,
    },

    // 2 Delivery Partners (Nagpur Logistics)
    {
      email: "delivery1@rrcms.local",
      name: "Tushar Raut — Nagpur FastLogistics (Pratap Nagar)",
      role: UserRole.DELIVERY_PARTNER,
      phone: "+91 98230 44001",
      passwordHash,
    },
    {
      email: "delivery2@rrcms.local",
      name: "Kunal Wankhede — OrangeCity Express (Ramdaspeth)",
      role: UserRole.DELIVERY_PARTNER,
      phone: "+91 98230 44002",
      passwordHash,
    },

    // 2 Customers (Nagpur Residents)
    {
      email: "customer1@rrcms.local",
      name: "Ananya Sharma (Civil Lines, Nagpur)",
      role: UserRole.CUSTOMER,
      phone: "+91 98230 55001",
      passwordHash,
    },
    {
      email: "customer2@rrcms.local",
      name: "Rahul Bhave (Manish Nagar, Nagpur)",
      role: UserRole.CUSTOMER,
      phone: "+91 98230 55002",
      passwordHash,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        phone: u.phone,
        passwordHash: u.passwordHash,
        isActive: true,
      },
      create: u,
    });
    console.log(`✓ Upserted: ${u.email} [${u.role}] - ${u.name}`);
  }

  // Find users for sample Nagpur repair requests
  const customer1 = await prisma.user.findUnique({ where: { email: "customer1@rrcms.local" } });
  const vendor2 = await prisma.user.findUnique({ where: { email: "vendor2@rrcms.local" } });
  const delivery2 = await prisma.user.findUnique({ where: { email: "delivery2@rrcms.local" } });

  if (customer1 && vendor2 && delivery2) {
    const existingDemo = await prisma.repairRequest.findFirst({
      where: { requestNumber: "RRCMS-NGP-001" },
    });

    if (!existingDemo) {
      const demoRepair = await prisma.repairRequest.create({
        data: {
          requestNumber: "RRCMS-NGP-001",
          customerId: customer1.id,
          vendorId: vendor2.id, // Vidarbha Electronics Care (Sitabuldi - closest to Civil Lines)
          deviceType: "Laptop",
          deviceBrand: "Dell",
          deviceModel: "XPS 15 (9500)",
          serialNumber: "DL-NGP-984723",
          issueDescription: "Screen flickers continuously after boot and battery drain is rapid.",
          status: RepairStatus.SUBMITTED,
          pickupRequested: true,
          pickupAddress: "Plot 42, Palm Greens, Near High Court, Civil Lines, Nagpur 440001",
        },
      });

      await prisma.repairStatusHistory.create({
        data: {
          repairId: demoRepair.id,
          oldStatus: null,
          newStatus: RepairStatus.SUBMITTED,
          changedById: customer1.id,
          note: "Repair request created. Routed to closest service centre: Vidarbha Electronics (Sitabuldi - 1.8 km).",
        },
      });

      // Initial pickup dispatch automatically assigned to closest courier
      const pickupDate = new Date();
      pickupDate.setDate(pickupDate.getDate() + 1);

      await prisma.pickupDelivery.create({
        data: {
          repairId: demoRepair.id,
          type: DeliveryType.PICKUP,
          status: DeliveryStatus.ASSIGNED,
          assignedPartnerId: delivery2.id, // OrangeCity Express (Ramdaspeth - closest to Civil Lines)
          scheduledAt: pickupDate,
          address: "Plot 42, Palm Greens, Near High Court, Civil Lines, Nagpur 440001",
          customerNotes: "Doorstep pickup assigned to nearest courier Kunal Wankhede (Ramdaspeth, 2.1 km away).",
        },
      });

      console.log(`✓ Created demo Nagpur repair request: ${demoRepair.requestNumber}`);
    }
  }

  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
