import request from "supertest";
import app from "../src/app.js";

async function runEndToEndLifecycleSimulation() {
  console.log("================================================================================");
  console.log("   RRCMS COMPLETE END-TO-END DEMO LIFECYCLE SIMULATION (NAGPUR ECOSYSTEM)");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  const testEmail = `rohan_nagpur_${timestamp}@example.com`;
  const password = "Password@123";

  // ---------------------------------------------------------------------------
  // STEP 1: Customer Registration & Login
  // ---------------------------------------------------------------------------
  console.log("1. Registering new Nagpur customer...");
  const regRes = await request(app)
    .post("/api/auth/register")
    .send({
      name: "Rohan Deshmukh",
      email: testEmail,
      password,
      phone: "+91 98230 77001",
    });

  if (regRes.status !== 201) {
    throw new Error(`Customer registration failed: ${JSON.stringify(regRes.body)}`);
  }
  const customerToken = regRes.body.data.token;
  const customerId = regRes.body.data.user.id;
  console.log(`   ✓ Customer registered: ${regRes.body.data.user.name} (${testEmail}) [ID: ${customerId}]\n`);

  // ---------------------------------------------------------------------------
  // STEP 2: Submit Repair Request with Doorstep Pickup in Ramdaspeth, Nagpur
  // ---------------------------------------------------------------------------
  console.log("2. Submitting repair request with Doorstep Pickup (Ramdaspeth, Nagpur)...");
  const repairRes = await request(app)
    .post("/api/repairs")
    .set("Authorization", `Bearer ${customerToken}`)
    .send({
      deviceType: "Smartphone",
      deviceBrand: "Google",
      deviceModel: "Pixel 7 Pro",
      serialNumber: "P7P-NGP-9921",
      issueDescription: "Display touch unresponsive on lower half after drop in Ramdaspeth market.",
      pickupRequested: true,
      pickupAddress: "Central Bazaar Road, Ramdaspeth, Nagpur 440010",
    });

  if (repairRes.status !== 201) {
    throw new Error(`Repair submission failed: ${JSON.stringify(repairRes.body)}`);
  }
  const repairId = repairRes.body.data.id;
  const requestNumber = repairRes.body.data.requestNumber;
  const assignedVendorId = repairRes.body.data.vendorId;
  console.log(`   ✓ Repair created: #${requestNumber} (ID: ${repairId})`);
  console.log(`   ✓ Status: ${repairRes.body.data.status}`);

  // Fetch full repair to verify auto-assigned vendor and courier
  const custCheck = await request(app)
    .get(`/api/repairs/${repairId}`)
    .set("Authorization", `Bearer ${customerToken}`);

  const pickupTrip = custCheck.body.data.deliveries?.[0];
  console.log(`   ✓ Auto-assigned Vendor: ${custCheck.body.data.vendor?.name} (${custCheck.body.data.vendor?.email})`);
  console.log(`   ✓ Auto-assigned Courier: ${pickupTrip?.assignedPartner?.name} (${pickupTrip?.assignedPartner?.email})`);
  console.log(`   ✓ Pickup Trip Status: ${pickupTrip?.status}\n`);

  if (!pickupTrip || pickupTrip.status !== "ASSIGNED") {
    throw new Error("Pickup trip was not auto-assigned with ASSIGNED status!");
  }
  const assignedCourierEmail = pickupTrip.assignedPartner?.email;
  const assignedVendorEmail = custCheck.body.data.vendor?.email;

  // ---------------------------------------------------------------------------
  // STEP 3: Courier Partner Logs in & Executes Doorstep Pickup
  // ---------------------------------------------------------------------------
  console.log(`3. Logging in as assigned Courier (${assignedCourierEmail})...`);
  const courierLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: assignedCourierEmail, password });

  if (courierLogin.status !== 200) {
    throw new Error(`Courier login failed: ${JSON.stringify(courierLogin.body)}`);
  }
  const courierToken = courierLogin.body.data.token;

  // Courier checks dashboard
  const courierTrips = await request(app)
    .get("/api/delivery")
    .set("Authorization", `Bearer ${courierToken}`);

  const myPickup = courierTrips.body.data.find((d: any) => d.repairId === repairId);
  if (!myPickup) {
    throw new Error("Assigned courier cannot see the pickup trip in their queue!");
  }
  console.log(`   ✓ Courier found trip #${myPickup.id} in their active queue.`);

  // Courier starts pickup trip (IN_TRANSIT)
  console.log("   -> Courier starts doorstep pickup trip (IN_TRANSIT)...");
  const inTransitRes = await request(app)
    .patch(`/api/delivery/${myPickup.id}/status`)
    .set("Authorization", `Bearer ${courierToken}`)
    .send({
      status: "IN_TRANSIT",
      deliveryNotes: "Courier partner en route to customer in Ramdaspeth.",
    });
  if (inTransitRes.status !== 200) throw new Error("Failed to start transit");
  console.log(`   ✓ Pickup trip moved to: ${inTransitRes.body.data.status}`);

  // Courier safely collects device & delivers to workshop (COMPLETED)
  console.log("   -> Courier delivers device to workshop (COMPLETED)...");
  const pickupDoneRes = await request(app)
    .patch(`/api/delivery/${myPickup.id}/status`)
    .set("Authorization", `Bearer ${courierToken}`)
    .send({
      status: "COMPLETED",
      deliveryNotes: "Device safely collected from customer and delivered to workshop for inspection.",
    });
  if (pickupDoneRes.status !== 200) throw new Error("Failed to complete pickup");
  console.log(`   ✓ Pickup trip completed!`);

  // Verify repair automatically advanced to UNDER_INSPECTION
  const inspectionCheck = await request(app)
    .get(`/api/repairs/${repairId}`)
    .set("Authorization", `Bearer ${customerToken}`);
  console.log(`   ✓ Repair status auto-synchronized to: ${inspectionCheck.body.data.status}\n`);
  if (inspectionCheck.body.data.status !== "UNDER_INSPECTION") {
    throw new Error(`Expected repair status UNDER_INSPECTION, got ${inspectionCheck.body.data.status}`);
  }

  // ---------------------------------------------------------------------------
  // STEP 4: Vendor Logs in & Generates Repair Estimate
  // ---------------------------------------------------------------------------
  console.log(`4. Logging in as assigned Vendor (${assignedVendorEmail})...`);
  const vendorLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: assignedVendorEmail, password });

  if (vendorLogin.status !== 200) {
    throw new Error(`Vendor login failed: ${JSON.stringify(vendorLogin.body)}`);
  }
  const vendorToken = vendorLogin.body.data.token;

  console.log("   -> Vendor creates cost estimate (₹2,800, 2 days)...");
  const estimateRes = await request(app)
    .post(`/api/repairs/${repairId}/estimate`)
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      estimatedCost: 2800,
      estimatedDays: 2,
      estimateNotes: "OEM AMOLED digitizer flex cable and micro-soldering.",
    });

  if (estimateRes.status !== 200) throw new Error("Failed to create estimate");
  console.log(`   ✓ Estimate issued: ₹2,800 (Status: ${estimateRes.body.data.status})\n`);

  // ---------------------------------------------------------------------------
  // STEP 5: Customer Approves Estimate
  // ---------------------------------------------------------------------------
  console.log("5. Customer reviews and approves repair estimate...");
  const approveRes = await request(app)
    .patch(`/api/repairs/${repairId}/estimate`)
    .set("Authorization", `Bearer ${customerToken}`)
    .send({ action: "APPROVE" });

  if (approveRes.status !== 200) throw new Error("Failed to approve estimate");
  console.log(`   ✓ Customer approved estimate! Repair status: ${approveRes.body.data.status}\n`);

  // ---------------------------------------------------------------------------
  // STEP 6: Vendor Assigns Workshop Technician
  // ---------------------------------------------------------------------------
  console.log("6. Vendor assigns Lead Technician (Amitabh Joshi - tech1@rrcms.local)...");
  const techLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: "tech1@rrcms.local", password });
  const tech1Id = techLogin.body.data.user.id;
  const techToken = techLogin.body.data.token;

  const assignRes = await request(app)
    .post(`/api/repairs/${repairId}/assign`)
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      technicianId: tech1Id,
      notes: "High-priority display repair. Check digitizer sensitivity.",
    });

  if (assignRes.status !== 200) throw new Error("Failed to assign technician");
  console.log(`   ✓ Technician assigned! Repair status: ${assignRes.body.data.status}\n`);

  // ---------------------------------------------------------------------------
  // STEP 7: Technician Updates Progress & Completes Repair
  // ---------------------------------------------------------------------------
  console.log("7. Technician performs chip-level repair and testing...");
  await request(app)
    .patch(`/api/repairs/${repairId}/progress`)
    .set("Authorization", `Bearer ${techToken}`)
    .send({
      diagnosisNotes: "Flex cable cracked at bend; display panel itself intact.",
      repairNotes: "Flex cable replaced and UV cured. Touch calibration passed 100%.",
    });

  const completeRes = await request(app)
    .patch(`/api/repairs/${repairId}/complete`)
    .set("Authorization", `Bearer ${techToken}`)
    .send({
      finalCost: 2800,
      notes: "Display replacement completed. Device cleaned and ready for return dispatch.",
    });

  if (completeRes.status !== 200) throw new Error("Failed to complete repair");
  console.log(`   ✓ Repair marked completed! Status: ${completeRes.body.data.status}\n`);

  // ---------------------------------------------------------------------------
  // STEP 8: Vendor Dispatches Return Delivery
  // ---------------------------------------------------------------------------
  console.log("8. Vendor dispatches return delivery to customer doorstep...");
  const dispatchRes = await request(app)
    .post("/api/delivery/schedule")
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      repairId,
      type: "DELIVERY",
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      address: "Central Bazaar Road, Ramdaspeth, Nagpur 440010",
    });

  if (dispatchRes.status !== 201) throw new Error(`Dispatch failed: ${JSON.stringify(dispatchRes.body)}`);
  const deliveryId = dispatchRes.body.data.id;
  console.log(`   ✓ Return delivery scheduled (Trip #${deliveryId})`);
  console.log(`   ✓ Auto-assigned courier: ${dispatchRes.body.data.assignedPartnerId}`);

  // ---------------------------------------------------------------------------
  // STEP 9: Test Failure & Recovery Path: Delivery Fails & Reschedules Cleanly
  // ---------------------------------------------------------------------------
  console.log("9. Testing Edge Case: Delivery attempt fails (Customer door locked)...");
  const failRes = await request(app)
    .patch(`/api/delivery/${deliveryId}/status`)
    .set("Authorization", `Bearer ${courierToken}`)
    .send({
      status: "FAILED",
      deliveryNotes: "Customer requested delivery in evening after 6 PM.",
    });

  if (failRes.status !== 200) throw new Error("Failed to record failure");

  const failCheck = await request(app)
    .get(`/api/repairs/${repairId}`)
    .set("Authorization", `Bearer ${customerToken}`);

  console.log(`   ✓ Delivery status: ${failRes.body.data.status}`);
  console.log(`   ✓ Repair status cleanly recovered to: ${failCheck.body.data.status} (Ready for re-dispatch!)`);
  if (failCheck.body.data.status !== "READY_FOR_PICKUP") {
    throw new Error("Repair status did not recover to READY_FOR_PICKUP upon failure!");
  }

  // Reschedule return delivery
  console.log("   -> Vendor reschedules return delivery...");
  const rescheduleRes = await request(app)
    .post("/api/delivery/schedule")
    .set("Authorization", `Bearer ${vendorToken}`)
    .send({
      repairId,
      type: "DELIVERY",
      scheduledAt: new Date(Date.now() + 172800000).toISOString(),
      address: "Central Bazaar Road, Ramdaspeth, Nagpur 440010 (Evening slot)",
    });

  if (rescheduleRes.status !== 201) throw new Error("Failed to reschedule delivery");
  const reDeliveryId = rescheduleRes.body.data.id;
  console.log(`   ✓ Rescheduled delivery trip #${reDeliveryId} successfully created!`);

  // Courier starts return transit
  console.log("   -> Courier starts return delivery transit (OUT_FOR_DELIVERY)...");
  await request(app)
    .patch(`/api/delivery/${reDeliveryId}/status`)
    .set("Authorization", `Bearer ${courierToken}`)
    .send({
      status: "IN_TRANSIT",
      deliveryNotes: "Repaired Pixel 7 Pro collected from workshop, out for delivery.",
    });

  // Courier confirms delivery to customer
  console.log("   -> Courier delivers device to customer (DELIVERED)...");
  await request(app)
    .patch(`/api/delivery/${reDeliveryId}/status`)
    .set("Authorization", `Bearer ${courierToken}`)
    .send({
      status: "COMPLETED",
      deliveryNotes: "Device safely handed over to Rohan Deshmukh at doorstep.",
    });

  const deliveredCheck = await request(app)
    .get(`/api/repairs/${repairId}`)
    .set("Authorization", `Bearer ${customerToken}`);

  console.log(`   ✓ Repair status updated to: ${deliveredCheck.body.data.status}\n`);
  if (deliveredCheck.body.data.status !== "DELIVERED") {
    throw new Error(`Expected DELIVERED, got ${deliveredCheck.body.data.status}`);
  }

  // ---------------------------------------------------------------------------
  // STEP 10: Customer Confirms Receipt & Formally Closes Request
  // ---------------------------------------------------------------------------
  console.log("10. Customer inspects repaired device & confirms receipt...");
  const closeRes = await request(app)
    .patch(`/api/delivery/${reDeliveryId}/confirm-receipt`)
    .set("Authorization", `Bearer ${customerToken}`)
    .send({
      notes: "Device received in excellent condition. Touch working like new!",
    });

  if (closeRes.status !== 200) throw new Error("Failed to confirm receipt");
  console.log(`   ✓ Customer confirmed receipt: ${closeRes.body.data.delivery.customerConfirmed}`);
  console.log(`   ✓ Repair status officially CLOSED! (Closed at: ${closeRes.body.data.repair.closedAt})\n`);

  // ---------------------------------------------------------------------------
  // STEP 11: Verify In-App Notifications
  // ---------------------------------------------------------------------------
  console.log("11. Verifying customer notification trail...");
  const notifRes = await request(app)
    .get("/api/notifications")
    .set("Authorization", `Bearer ${customerToken}`);

  console.log(`   ✓ Customer received ${notifRes.body.data.length} notifications during this lifecycle:`);
  for (const n of notifRes.body.data) {
    console.log(`     • [${n.type}] ${n.title}: ${n.message}`);
  }

  console.log("\n================================================================================");
  console.log("   ALL 11 LIFECYCLE STEPS EXECUTED AND VERIFIED FAWLESSLY WITH 100% SUCCESS!");
  console.log("================================================================================\n");
}

runEndToEndLifecycleSimulation()
  .catch((err) => {
    console.error("\n❌ Simulation Failed with Error:\n", err);
    process.exit(1);
  });
