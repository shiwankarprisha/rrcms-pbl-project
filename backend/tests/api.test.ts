import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/prisma.js";

describe("RRCMS Comprehensive API Test Suite (Success + Failure + Edge Cases)", () => {
  let customer1Token: string;
  let customer2Token: string;
  let customer1Id: number;
  let customer2Id: number;
  let adminToken: string;
  let vendorToken: string;
  let tech1Token: string;
  let tech2Token: string;
  let tech1Id: number;
  let tech2Id: number;
  let delivery1Token: string;
  let delivery2Token: string;
  let deliveryPartner1Id: number;

  let successRepairId: number;
  let rejectRepairId: number;
  let failDeliveryRepairId: number;
  let testDeliveryId: number;
  let failedDeliveryId: number;

  beforeAll(async () => {
    // 1. Log in with Nagpur seeded roles
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@rrcms.local", password: "Password@123" });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;

    const vendorRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "vendor1@rrcms.local", password: "Password@123" });
    expect(vendorRes.status).toBe(200);
    vendorToken = vendorRes.body.data.token;

    const tech1Res = await request(app)
      .post("/api/auth/login")
      .send({ email: "tech1@rrcms.local", password: "Password@123" });
    expect(tech1Res.status).toBe(200);
    tech1Token = tech1Res.body.data.token;
    tech1Id = tech1Res.body.data.user.id;

    const tech2Res = await request(app)
      .post("/api/auth/login")
      .send({ email: "tech2@rrcms.local", password: "Password@123" });
    expect(tech2Res.status).toBe(200);
    tech2Token = tech2Res.body.data.token;
    tech2Id = tech2Res.body.data.user.id;

    const delivery1Res = await request(app)
      .post("/api/auth/login")
      .send({ email: "delivery1@rrcms.local", password: "Password@123" });
    expect(delivery1Res.status).toBe(200);
    delivery1Token = delivery1Res.body.data.token;
    deliveryPartner1Id = delivery1Res.body.data.user.id;

    const delivery2Res = await request(app)
      .post("/api/auth/login")
      .send({ email: "delivery2@rrcms.local", password: "Password@123" });
    expect(delivery2Res.status).toBe(200);
    delivery2Token = delivery2Res.body.data.token;

    const cust1Res = await request(app)
      .post("/api/auth/login")
      .send({ email: "customer1@rrcms.local", password: "Password@123" });
    expect(cust1Res.status).toBe(200);
    customer1Token = cust1Res.body.data.token;
    customer1Id = cust1Res.body.data.user.id;

    const cust2Res = await request(app)
      .post("/api/auth/login")
      .send({ email: "customer2@rrcms.local", password: "Password@123" });
    expect(cust2Res.status).toBe(200);
    customer2Token = cust2Res.body.data.token;
    customer2Id = cust2Res.body.data.user.id;
  });

  it("returns only the authenticated customer's repair requests", async () => {
    const createdRes = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        deviceType: "Smartphone",
        deviceBrand: "Samsung",
        deviceModel: "Galaxy Test",
        issueDescription: "Screen flickers during normal use.",
      });

    expect(createdRes.status).toBe(201);
    const createdRepair = createdRes.body.data;

    const customer1Res = await request(app)
      .get("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`);

    expect(customer1Res.status).toBe(200);
    expect(customer1Res.body.success).toBe(true);
    expect(Array.isArray(customer1Res.body.data)).toBe(true);
    expect(
      customer1Res.body.data.some(
        (repair: { id: number }) => repair.id === createdRepair.id,
      ),
    ).toBe(true);

    for (const repair of customer1Res.body.data) {
      expect(repair.customerId).toBe(customer1Id);
      expect(repair.requestNumber).toBeTruthy();
      expect(repair).toHaveProperty("status");
      expect(repair).toHaveProperty("deviceType");
    }

    const customer2Res = await request(app)
      .get("/api/repairs")
      .set("Authorization", `Bearer ${customer2Token}`);

    expect(customer2Res.status).toBe(200);
    expect(customer2Res.body.success).toBe(true);
    expect(
      customer2Res.body.data.some(
        (repair: { id: number }) => repair.id === createdRepair.id,
      ),
    ).toBe(false);

    for (const repair of customer2Res.body.data) {
      expect(repair.customerId).toBe(customer2Id);
    }
  });

  it("returns consistent status history and restricts access to the repair owner", async () => {
    const createdRes = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        deviceType: "Smartphone",
        deviceBrand: "Samsung",
        deviceModel: "History Test",
        issueDescription: "Verify initial repair status history.",
      });

    expect(createdRes.status).toBe(201);
    const repairId = createdRes.body.data.id;
    expect(createdRes.body.data.status).toBe("SUBMITTED");

    const detailsRes = await request(app)
      .get(`/api/repairs/${repairId}`)
      .set("Authorization", `Bearer ${customer1Token}`);

    expect(detailsRes.status).toBe(200);
    expect(detailsRes.body.data.status).toBe("SUBMITTED");

    const history = detailsRes.body.data.statusHistory;
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBeGreaterThan(0);

    const initialEntry = history[0];
    expect(initialEntry.newStatus).toBe(detailsRes.body.data.status);
    expect(initialEntry.oldStatus).toBeNull();
    expect(initialEntry.changedAt).toBeTruthy();
    expect(Number.isNaN(Date.parse(initialEntry.changedAt))).toBe(false);

    const forbiddenRes = await request(app)
      .get(`/api/repairs/${repairId}`)
      .set("Authorization", `Bearer ${customer2Token}`);

    expect(forbiddenRes.status).toBe(403);
  });

  it("rejects repair submission by a non-customer role", async () => {
    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        deviceType: "Smartphone",
        issueDescription: "Screen flickers during normal use.",
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // --- 1. Health Checks ---
  it("GET /api/health should return ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /api/health/db should verify MySQL connection", async () => {
    const res = await request(app).get("/api/health/db");
    expect(res.status).toBe(200);
    expect(res.body.database).toBe("connected");
  });

  // --- 2. Auth & RBAC Security Edge Cases ---
  it("POST /api/auth/register blocks privilege escalation to ADMIN", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Malicious User",
        email: `hacker_${Date.now()}@example.com`,
        password: "Password@123",
        role: "ADMIN",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe("CUSTOMER");
  });

  it("Customer 2 cannot view or access Customer 1's repair details (Ownership Check)", async () => {
    // Submit request as Customer 1
    const createRes = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        deviceType: "Smartphone",
        deviceBrand: "OnePlus",
        deviceModel: "11R",
        issueDescription: "Camera lens cracked after drop near Sitabuldi.",
      });
    expect(createRes.status).toBe(201);
    const c1RepairId = createRes.body.data.id;

    // Customer 2 tries to read it
    const forbiddenRes = await request(app)
      .get(`/api/repairs/${c1RepairId}`)
      .set("Authorization", `Bearer ${customer2Token}`);

    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.error).toContain(
      "Access denied: You do not own this repair request",
    );
  });

  it("rejects a repair request when device type is missing", async () => {
    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        deviceBrand: "Samsung",
        deviceModel: "Galaxy S25",
        issueDescription: "Screen flickers during normal use.",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Validation failed");
  });

  it("rejects a repair request with a short issue description", async () => {
    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        deviceType: "Smartphone",
        issueDescription: "Bad",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Validation failed");
  });

  it("rejects a repair request with a whitespace-only device type", async () => {
    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        deviceType: "   ",
        issueDescription: "Screen flickers during normal use.",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Validation failed");
  });

  it("rejects a whitespace-only issue description", async () => {
    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        deviceType: "Smartphone",
        issueDescription: "     ",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Validation failed");
  });

  it("rejects a device type exceeding 100 characters", async () => {
    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        deviceType: "A".repeat(101),
        issueDescription: "Screen flickers during normal use.",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Validation failed");
  });

  it("creates a repair request with the expected response fields", async () => {
    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        deviceType: "Smartphone",
        deviceBrand: "Samsung",
        deviceModel: "Galaxy S25",
        issueDescription: "Screen flickers during normal use.",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.requestNumber).toMatch(/^RRCMS-\d{8}-\d{4}$/);
    expect(res.body.data.customerId).toBe(customer1Id);
    expect(res.body.data.deviceType).toBe("Smartphone");
    expect(res.body.data.deviceBrand).toBe("Samsung");
    expect(res.body.data.deviceModel).toBe("Galaxy S25");
    expect(res.body.data.issueDescription).toBe(
      "Screen flickers during normal use.",
    );
    expect(res.body.data.status).toBe("SUBMITTED");
    expect(res.body.data.imageUrl).toBeNull();
  });

  it("creates a repair request with an uploaded device image", async () => {
    const imageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/2ioAAAAASUVORK5CYII=",
      "base64",
    );

    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .field("deviceType", "Smartphone")
      .field("deviceBrand", "Samsung")
      .field("deviceModel", "Galaxy S25")
      .field("issueDescription", "Screen flickers during normal use.")
      .attach("image", imageBuffer, {
        filename: "device.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.imageUrl).toMatch(/^\/uploads\/device-.+\.png$/);
  });

  it("rejects an unsupported file type for a repair image", async () => {
    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .field("deviceType", "Smartphone")
      .field("issueDescription", "Screen flickers during normal use.")
      .attach("image", Buffer.from("not an image"), {
        filename: "notes.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain(
      "Only JPEG, PNG, and WebP images are allowed",
    );
  });

  it("rejects an image larger than 5 MB", async () => {
    const oversizedImage = Buffer.alloc(5 * 1024 * 1024 + 1, 0);

    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .field("deviceType", "Smartphone")
      .field("issueDescription", "Screen flickers during normal use.")
      .attach("image", oversizedImage, {
        filename: "oversized.png",
        contentType: "image/png",
      });

    expect(res.status).toBe(413);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Image must be 5 MB or smaller");
  });

  // --- 3. Doorstep Pickup Scheduling on Submission ---
  it("Customer submits repair with Doorstep Pickup requested in Nagpur", async () => {
    const res = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        deviceType: "Laptop",
        deviceBrand: "Lenovo",
        deviceModel: "ThinkPad E14",
        issueDescription: "Keyboard keys sticking and battery swollen.",
        pickupRequested: true,
        pickupAddress: "Flat 202, Gokul Enclave, Dharampeth, Nagpur",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.pickupRequested).toBe(true);
    successRepairId = res.body.data.id;

    // Verify initial PICKUP record was created and automatically assigned by proximity
    const repairDetails = await request(app)
      .get(`/api/repairs/${successRepairId}`)
      .set("Authorization", `Bearer ${customer1Token}`);

    expect(repairDetails.body.data.deliveries.length).toBe(1);
    expect(repairDetails.body.data.deliveries[0].type).toBe("PICKUP");
    expect(repairDetails.body.data.deliveries[0].status).toBe("ASSIGNED");
    expect(
      repairDetails.body.data.deliveries[0].assignedPartnerId,
    ).toBeDefined();
    expect(repairDetails.body.data.vendorId).toBeDefined();
  });

  // --- 4. Failure Path 1: Request Rejection during Vendor Verification ---
  it("Vendor rejects a repair request with explanatory note", async () => {
    const subRes = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer2Token}`)
      .send({
        deviceType: "Smartwatch",
        deviceBrand: "Generic",
        deviceModel: "FakeWatch X",
        issueDescription: "Completely burnt board and fake serial number.",
      });
    expect(subRes.status).toBe(201);
    rejectRepairId = subRes.body.data.id;

    const rejectRes = await request(app)
      .patch(`/api/repairs/${rejectRepairId}/verify`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        decision: "REJECT",
        notes:
          "Device is unbranded and heavily corroded with no replacement components available.",
      });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.data.status).toBe("REJECTED");
  });

  // --- 5. Failure Path 2: Customer Estimate Rejection ---
  it("Customer rejects estimate -> status transitions to CANCELLED", async () => {
    const subRes = await request(app)
      .post("/api/repairs")
      .set("Authorization", `Bearer ${customer2Token}`)
      .send({
        deviceType: "Tablet",
        deviceBrand: "Samsung",
        deviceModel: "Galaxy Tab A",
        issueDescription: "Cracked display glass.",
      });
    expect(subRes.status).toBe(201);
    const estRepairId = subRes.body.data.id;

    // Vendor accepts
    await request(app)
      .patch(`/api/repairs/${estRepairId}/verify`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ decision: "ACCEPT", notes: "Accepted" });

    // Vendor generates estimate
    const createEstimateRes = await request(app)
      .post(`/api/repairs/${estRepairId}/estimate`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        estimatedCost: 12000,
        estimatedDays: 5,
        estimateNotes: "OEM display",
      });

    expect(createEstimateRes.status).toBe(200);

    const savedEstimateRes = await request(app)
      .get(`/api/repairs/${estRepairId}`)
      .set("Authorization", `Bearer ${customer2Token}`);

    expect(savedEstimateRes.status).toBe(200);
    expect(Number(savedEstimateRes.body.data.estimatedCost)).toBe(12000);
    expect(savedEstimateRes.body.data.estimatedDays).toBe(5);
    expect(savedEstimateRes.body.data.estimateStatus).toBe("PENDING");

    // Customer rejects
    const rejectEstRes = await request(app)
      .patch(`/api/repairs/${estRepairId}/estimate`)
      .set("Authorization", `Bearer ${customer2Token}`)
      .send({
        action: "REJECT",
        notes: "Cost exceeds market value of tablet.",
      });

    expect(rejectEstRes.status).toBe(200);
    expect(rejectEstRes.body.data.status).toBe("CANCELLED");
    expect(rejectEstRes.body.data.estimateStatus).toBe("REJECTED");

    const trackingRes = await request(app)
      .get(`/api/repairs/${estRepairId}`)
      .set("Authorization", `Bearer ${customer2Token}`);

    expect(trackingRes.status).toBe(200);
    expect(trackingRes.body.data.status).toBe("CANCELLED");

    const history = trackingRes.body.data.statusHistory;
    expect(Array.isArray(history)).toBe(true);
    expect(
      history.some(
        (entry: { oldStatus: string | null; newStatus: string }) =>
          entry.oldStatus === "AWAITING_APPROVAL" &&
          entry.newStatus === "CANCELLED",
      ),
    ).toBe(true);
  });

  it("rejects assignment to a nonexistent technician", async () => {
    await request(app)
      .patch(`/api/repairs/${successRepairId}/verify`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ decision: "ACCEPT", notes: "Approved for assignment test" });

    await request(app)
      .post(`/api/repairs/${successRepairId}/estimate`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        estimatedCost: 4500,
        estimatedDays: 3,
        estimateNotes: "Assignment validation test",
      });

    await request(app)
      .patch(`/api/repairs/${successRepairId}/estimate`)
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ action: "APPROVE" });

    const res = await request(app)
      .post(`/api/repairs/${successRepairId}/assign`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ technicianId: 999999999, notes: "Invalid technician test" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("technicians only see repairs assigned to them", async () => {
    // Prepare an approved repair for technician assignment
    await request(app)
      .patch(`/api/repairs/${successRepairId}/verify`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ decision: "ACCEPT", notes: "Ready for repair" });

    await request(app)
      .post(`/api/repairs/${successRepairId}/estimate`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        estimatedCost: 4500,
        estimatedDays: 3,
        estimateNotes: "Keyboard replacement",
      });

    await request(app)
      .patch(`/api/repairs/${successRepairId}/estimate`)
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ action: "APPROVE" });

    const assignRes = await request(app)
      .post(`/api/repairs/${successRepairId}/assign`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ technicianId: tech1Id, notes: "Assigned for access test" });

    expect(assignRes.status).toBe(200);

    const tech1RepairsRes = await request(app)
      .get("/api/repairs")
      .set("Authorization", `Bearer ${tech1Token}`);

    const tech2RepairsRes = await request(app)
      .get("/api/repairs")
      .set("Authorization", `Bearer ${tech2Token}`);

    expect(tech1RepairsRes.status).toBe(200);
    expect(tech2RepairsRes.status).toBe(200);

    expect(
      tech1RepairsRes.body.data.some(
        (repair: { id: number }) => repair.id === successRepairId,
      ),
    ).toBe(true);

    expect(
      tech2RepairsRes.body.data.some(
        (repair: { id: number }) => repair.id === successRepairId,
      ),
    ).toBe(false);
  });

  // --- 6. Failure Path 3: Unauthorized Technician Progress Update ---
  it("Technician 2 is blocked from updating a repair assigned to Technician 1", async () => {
    // Vendor accepts successRepairId
    await request(app)
      .patch(`/api/repairs/${successRepairId}/verify`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ decision: "ACCEPT", notes: "Ready for repair" });

    // Vendor creates estimate
    await request(app)
      .post(`/api/repairs/${successRepairId}/estimate`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        estimatedCost: 4500,
        estimatedDays: 3,
        estimateNotes: "Keyboard replacement",
      });

    // Customer approves
    await request(app)
      .patch(`/api/repairs/${successRepairId}/estimate`)
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ action: "APPROVE" });

    // Assign Tech 1 and verify assignment
    const assignRes = await request(app)
      .post(`/api/repairs/${successRepairId}/assign`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ technicianId: tech1Id, notes: "Assigned to Lead Tech" });

    expect(assignRes.status).toBe(200);
    expect(assignRes.body.data.repair.status).toBe("IN_REPAIR");
    expect(assignRes.body.data.assignment.technicianId).toBe(tech1Id);
    expect(assignRes.body.data.assignment.status).toBe("ASSIGNED");

    // Tech 2 tries to update notes -> must be 403 Forbidden
    const unauthTechRes = await request(app)
      .patch(`/api/repairs/${successRepairId}/progress`)
      .set("Authorization", `Bearer ${tech2Token}`)
      .send({ diagnosisNotes: "Sneha trying to modify Amitabh's task." });

    expect(unauthTechRes.status).toBe(403);
    expect(unauthTechRes.body.error).toContain(
      "You are not assigned to this repair",
    );
  });

  it("Technician 1 can record diagnosis and repair progress", async () => {
    const progressRes = await request(app)
      .patch(`/api/repairs/${successRepairId}/progress`)
      .set("Authorization", `Bearer ${tech1Token}`)
      .send({
        diagnosisNotes: "Keyboard fault identified",
        repairNotes: "Keyboard replacement in progress",
      });

    expect(progressRes.status).toBe(200);

    const detailsRes = await request(app)
      .get(`/api/repairs/${successRepairId}`)
      .set("Authorization", `Bearer ${tech1Token}`);

    expect(detailsRes.status).toBe(200);
    expect(detailsRes.body.data.diagnosisNotes).toBe(
      "Keyboard fault identified",
    );
    expect(detailsRes.body.data.repairNotes).toBe(
      "Keyboard replacement in progress",
    );
  });

  // --- 7. Successful Repair Completion by Assigned Tech 1 ---
  it("Technician 1 completes the repair successfully", async () => {
    const completeRes = await request(app)
      .patch(`/api/repairs/${successRepairId}/complete`)
      .set("Authorization", `Bearer ${tech1Token}`)
      .send({
        finalCost: 4500,
        notes: "Keyboard and thermal paste replaced. Stress test passed.",
      });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe("REPAIR_COMPLETED");

    const completedDetailsRes = await request(app)
      .get(`/api/repairs/${successRepairId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(completedDetailsRes.status).toBe(200);
    expect(completedDetailsRes.body.data.status).toBe("REPAIR_COMPLETED");
    expect(Number(completedDetailsRes.body.data.finalCost)).toBe(4500);
  });

  it("rejects pickup scheduling with an invalid date", async () => {
    const response = await request(app)
      .post("/api/delivery/schedule")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        repairId: successRepairId,
        type: "PICKUP",
        scheduledAt: "not-a-date",
        address: "Dharampeth, Nagpur",
        assignedPartnerId: deliveryPartner1Id,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Validation failed");
  });

  it("rejects delivery scheduling with an invalid repair ID", async () => {
    const response = await request(app)
      .post("/api/delivery/schedule")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        repairId: -1,
        type: "DELIVERY",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        address: "Dharampeth, Nagpur",
        assignedPartnerId: deliveryPartner1Id,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Validation failed");
  });

  it("rejects delivery partner assignment with an invalid partner ID", async () => {
    const response = await request(app)
      .post(`/api/delivery/${testDeliveryId}/assign`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ assignedPartnerId: -1 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Validation failed");
  });

  it("rejects delivery scheduling with an invalid delivery type", async () => {
    const response = await request(app)
      .post("/api/delivery/schedule")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        repairId: successRepairId,
        type: "INVALID",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        address: "Flat 202, Gokul Enclave, Nagpur",
        assignedPartnerId: deliveryPartner1Id,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "type" })]),
    );
  });

  // --- 8. Failure Path 4 & Solution: Delivery Attempt Fails & Reverts Status for Reschedule ---
  it("Delivery failure reverts repair status to READY_FOR_PICKUP and enables Rescheduling", async () => {
    // Admin schedules first return delivery
    const schedRes = await request(app)
      .post("/api/delivery/schedule")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        repairId: successRepairId,
        type: "DELIVERY",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        address: "Flat 202, Gokul Enclave, Dharampeth, Nagpur",
        assignedPartnerId: deliveryPartner1Id,
      });

    expect(schedRes.status).toBe(201);
    failedDeliveryId = schedRes.body.data.id;

    // Delivery Partner 1 marks IN_TRANSIT
    await request(app)
      .patch(`/api/delivery/${failedDeliveryId}/status`)
      .set("Authorization", `Bearer ${delivery1Token}`)
      .send({ status: "IN_TRANSIT", deliveryNotes: "En route to Dharampeth." });

    // Verify status was OUT_FOR_DELIVERY
    let check = await request(app)
      .get(`/api/repairs/${successRepairId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(check.body.data.status).toBe("OUT_FOR_DELIVERY");

    // Delivery Partner 1 marks FAILED (e.g. customer door locked)
    const failRes = await request(app)
      .patch(`/api/delivery/${failedDeliveryId}/status`)
      .set("Authorization", `Bearer ${delivery1Token}`)
      .send({
        status: "FAILED",
        deliveryNotes: "Door locked, customer phone switched off.",
      });

    expect(failRes.status).toBe(200);
    expect(failRes.body.data.status).toBe("FAILED");

    // VERIFY SOLUTION: Repair status is NOT stuck in OUT_FOR_DELIVERY!
    // It reverts to READY_FOR_PICKUP so a reschedule is immediately allowed!
    check = await request(app)
      .get(`/api/repairs/${successRepairId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(check.body.data.status).toBe("READY_FOR_PICKUP");

    // RESCHEDULE DELIVERY: Attempting a new schedule for this repair succeeds!
    const rescheduleRes = await request(app)
      .post("/api/delivery/schedule")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        repairId: successRepairId,
        type: "DELIVERY",
        scheduledAt: new Date(Date.now() + 172800000).toISOString(), // 2 days later
        address: "Flat 202, Gokul Enclave, Dharampeth, Nagpur (Second attempt)",
        assignedPartnerId: deliveryPartner1Id,
      });

    expect(rescheduleRes.status).toBe(201);
    expect(rescheduleRes.body.data.status).toBe("ASSIGNED");
    testDeliveryId = rescheduleRes.body.data.id;
  });

  // --- 9. Premature Confirmation Check ---
  it("Customer cannot confirm receipt before delivery is in transit or completed", async () => {
    // testDeliveryId is currently ASSIGNED, not delivered
    const prematureRes = await request(app)
      .patch(`/api/delivery/${testDeliveryId}/confirm-receipt`)
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ notes: "Trying to confirm prematurely" });

    expect(prematureRes.status).toBe(400);
    expect(prematureRes.body.error).toContain("Device must be delivered first");
  });

  // --- 10. Successful Delivery Completion & Final Request Closure ---
  it("Successful doorstep delivery and customer receipt confirmation closes repair", async () => {
    // 1. Move to IN_TRANSIT
    await request(app)
      .patch(`/api/delivery/${testDeliveryId}/status`)
      .set("Authorization", `Bearer ${delivery1Token}`)
      .send({
        status: "IN_TRANSIT",
        deliveryNotes: "Second attempt, customer confirmed present.",
      });

    // 2. Move to COMPLETED
    await request(app)
      .patch(`/api/delivery/${testDeliveryId}/status`)
      .set("Authorization", `Bearer ${delivery1Token}`)
      .send({
        status: "COMPLETED",
        deliveryNotes: "Handed over to Ananya Sharma at doorstep.",
      });

    // 3. Customer confirms receipt -> Closes request!
    const confirmRes = await request(app)
      .patch(`/api/delivery/${testDeliveryId}/confirm-receipt`)
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        notes:
          "Received ThinkPad, keyboard working perfectly. Highly satisfied!",
      });

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.delivery.customerConfirmed).toBe(true);
    expect(confirmRes.body.data.repair.status).toBe("CLOSED");
    expect(confirmRes.body.data.repair.closedAt).toBeDefined();
    expect(confirmRes.body.data.delivery.status).toBe("COMPLETED");
    expect(confirmRes.body.data.delivery.confirmedAt).toBeDefined();

    // Verify persisted final repair status
    const closedRepair = await prisma.repairRequest.findUnique({
      where: { id: successRepairId },
    });
    expect(closedRepair?.status).toBe("CLOSED");
    expect(closedRepair?.closedAt).toBeDefined();
  });

  // --- Profile Retrieval Tests (SCRUM-123) ---

  it("GET /api/auth/me returns the authenticated user's safe profile", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${customer1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(customer1Id);
    expect(res.body.data.name).toBeTruthy();
    expect(res.body.data.email).toBe("customer1@rrcms.local");
    expect(res.body.data.role).toBe("CUSTOMER");
    expect(res.body.data).toHaveProperty("phone");
    expect(res.body.data).toHaveProperty("createdAt");
    expect(res.body.data).not.toHaveProperty("passwordHash");
  });

  it("GET /api/auth/me rejects requests without an authentication token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });

  // --- Profile Update Tests (SCRUM-124) ---

  it("PATCH /api/users/profile updates the authenticated user's name", async () => {
    const updatedName = `Profile Test ${Date.now()}`;

    const res = await request(app)
      .patch("/api/users/profile")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ name: updatedName });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(customer1Id);
    expect(res.body.data.name).toBe(updatedName);
    expect(res.body.data.email).toBe("customer1@rrcms.local");
    expect(res.body.data.role).toBe("CUSTOMER");
    expect(res.body.data).not.toHaveProperty("passwordHash");
  });

  it("PATCH /api/users/profile updates the authenticated user's phone", async () => {
    const phone = "9876543210";

    const res = await request(app)
      .patch("/api/users/profile")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ phone });

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(customer1Id);
    expect(res.body.data.phone).toBe(phone);
  });

  it("PATCH /api/users/profile does not allow changing protected fields", async () => {
    const res = await request(app)
      .patch("/api/users/profile")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({
        name: "Protected Field Test",
        email: "changed@example.com",
        role: "ADMIN",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Protected Field Test");
    expect(res.body.data.email).toBe("customer1@rrcms.local");
    expect(res.body.data.role).toBe("CUSTOMER");
  });

  it("PATCH /api/users/profile rejects unauthenticated requests", async () => {
    const res = await request(app)
      .patch("/api/users/profile")
      .send({ name: "Unauthenticated Update" });

    expect(res.status).toBe(401);
  });

  it("retrieves the updated profile after a profile change", async () => {
    const updatedName = `Profile Round Trip ${Date.now()}`;

    const updateRes = await request(app)
      .patch("/api/users/profile")
      .set("Authorization", `Bearer ${customer1Token}`)
      .send({ name: updatedName });

    expect(updateRes.status).toBe(200);

    const profileRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${customer1Token}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.data.id).toBe(customer1Id);
    expect(profileRes.body.data.name).toBe(updatedName);
    expect(profileRes.body.data).not.toHaveProperty("passwordHash");
  });

  // --- 11. In-App Notifications Verification ---
  it("Customer receives in-app notifications throughout the lifecycle", async () => {
    const notifRes = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${customer1Token}`);

    expect(notifRes.status).toBe(200);
    expect(Array.isArray(notifRes.body.data)).toBe(true);
    expect(notifRes.body.data.length).toBeGreaterThan(0);

    const firstNotifId = notifRes.body.data[0].id;

    // Mark single as read
    const readRes = await request(app)
      .patch(`/api/notifications/${firstNotifId}/read`)
      .set("Authorization", `Bearer ${customer1Token}`);
    expect(readRes.status).toBe(200);

    // Mark all as read
    const readAllRes = await request(app)
      .patch("/api/notifications/read-all")
      .set("Authorization", `Bearer ${customer1Token}`);
    expect(readAllRes.status).toBe(200);
  });

  // --- User Registration Tests (SCRUM-112) ---

  it("registers a new customer and allows subsequent login", async () => {
    const email = `registration_${Date.now()}@example.com`;
    const password = "SecurePass@123";

    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Registration Test",
      email,
      password,
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.success).toBe(true);
    expect(registerRes.body.message).toBe("Registration successful");
    expect(registerRes.body.data.user.email).toBe(email);
    expect(registerRes.body.data.user.role).toBe("CUSTOMER");
    expect(registerRes.body.data.user).not.toHaveProperty("passwordHash");

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.email).toBe(email);
  });

  it("rejects duplicate registration using the same email", async () => {
    const email = `duplicate_${Date.now()}@example.com`;
    const user = {
      name: "Duplicate Test",
      email,
      password: "SecurePass@123",
    };

    const first = await request(app).post("/api/auth/register").send(user);

    expect(first.status).toBe(201);

    const second = await request(app).post("/api/auth/register").send(user);

    expect(second.status).toBe(409);
  });

  it.each([
    {
      name: "missing name",
      payload: { email: "missingname@example.com", password: "SecurePass@123" },
    },
    {
      name: "invalid email",
      payload: {
        name: "Invalid Email",
        email: "not-an-email",
        password: "SecurePass@123",
      },
    },
    {
      name: "short password",
      payload: {
        name: "Short Password",
        email: "shortpass@example.com",
        password: "123",
      },
    },
  ])("rejects registration with $name", async ({ payload }) => {
    const res = await request(app).post("/api/auth/register").send(payload);

    expect(res.status).toBe(400);
  });
});

// --- User Login Tests (SCRUM-116) ---

it("logs in with valid credentials and returns a safe user object", async () => {
  const res = await request(app).post("/api/auth/login").send({
    email: "customer1@rrcms.local",
    password: "Password@123",
  });

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Login successful");
  expect(res.body.data.token).toBeTruthy();
  expect(res.body.data.user.email).toBe("customer1@rrcms.local");
  expect(res.body.data.user).not.toHaveProperty("passwordHash");
});

it("rejects login with an incorrect password", async () => {
  const res = await request(app).post("/api/auth/login").send({
    email: "customer1@rrcms.local",
    password: "WrongPassword123",
  });

  expect(res.status).toBe(401);
});

it("rejects login for an unknown email", async () => {
  const res = await request(app).post("/api/auth/login").send({
    email: "unknown_login_user@example.com",
    password: "Password@123",
  });

  expect(res.status).toBe(401);
});

it.each([
  {
    name: "invalid email",
    payload: { email: "not-an-email", password: "Password@123" },
  },
  {
    name: "missing password",
    payload: { email: "customer1@rrcms.local", password: "" },
  },
])("rejects login with $name", async ({ payload }) => {
  const res = await request(app).post("/api/auth/login").send(payload);

  expect(res.status).toBe(400);
});
