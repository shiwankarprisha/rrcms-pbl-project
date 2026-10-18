import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";

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

    // Vendor estimates ₹12,000 (too high)
    await request(app)
      .post(`/api/repairs/${estRepairId}/estimate`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({
        estimatedCost: 12000,
        estimatedDays: 5,
        estimateNotes: "OEM display",
      });

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

    // Assign Tech 1
    await request(app)
      .post(`/api/repairs/${successRepairId}/assign`)
      .set("Authorization", `Bearer ${vendorToken}`)
      .send({ technicianId: tech1Id, notes: "Assigned to Lead Tech" });

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
    const res = await request(app)
      .post("/api/auth/login")
      .send({
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
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "customer1@rrcms.local",
        password: "WrongPassword123",
      });

    expect(res.status).toBe(401);
  });

  it("rejects login for an unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
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
    const res = await request(app)
      .post("/api/auth/login")
      .send(payload);

    expect(res.status).toBe(400);
  });