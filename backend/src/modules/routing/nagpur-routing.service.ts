import { UserRole } from "@prisma/client";
import { prisma } from "../../prisma.js";

export interface GeoLocation {
  name: string;
  lat: number;
  lng: number;
  aliases: string[];
}

export interface RoutingPartner {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  hubName: string;
  distanceKm: number;
}

export interface RoutingResult {
  localityName: string;
  coordinates: { lat: number; lng: number };
  vendor: RoutingPartner;
  deliveryPartner: RoutingPartner;
  vendorDistanceKm: number;
  partnerDistanceKm: number;
  explanation: string;
}

/**
 * Standard known Nagpur Geographic Hubs & Coordinates
 */
export const NAGPUR_LOCALITIES: GeoLocation[] = [
  {
    name: "Civil Lines",
    lat: 21.1538,
    lng: 79.0669,
    aliases: ["civil lines", "high court", "vca", "ravi bhavan", "raj bhavan"],
  },
  {
    name: "Dharampeth",
    lat: 21.1418,
    lng: 79.0601,
    aliases: ["dharampeth", "gokulpeth", "shivaji nagar", "ravi nagar", "ram nagar", "traffic park"],
  },
  {
    name: "Sitabuldi",
    lat: 21.1458,
    lng: 79.0832,
    aliases: ["sitabuldi", "burdi", "railway station", "zero mile", "cotton market", "variety square"],
  },
  {
    name: "Ramdaspeth",
    lat: 21.1374,
    lng: 79.0722,
    aliases: ["ramdaspeth", "dhantoli", "lokmat square", "central bazaar", "kachipura"],
  },
  {
    name: "Pratap Nagar",
    lat: 21.1165,
    lng: 79.0573,
    aliases: ["pratap nagar", "khamla", "pande layout", "trimurti nagar", "orange city hospital"],
  },
  {
    name: "Manish Nagar",
    lat: 21.0934,
    lng: 79.0782,
    aliases: ["manish nagar", "besa", "beltarodi", "somji nagar", "railway crossing manish nagar"],
  },
  {
    name: "Bajaj Nagar",
    lat: 21.1275,
    lng: 79.0645,
    aliases: ["bajaj nagar", "laxmi nagar", "vnit", "shradhanand peth", "abhyankar nagar"],
  },
  {
    name: "Sadar",
    lat: 21.161,
    lng: 79.0805,
    aliases: ["sadar", "chhindwara road", "mankapur", "koradi road", "chaoni"],
  },
  {
    name: "Narendra Nagar",
    lat: 21.108,
    lng: 79.079,
    aliases: ["narendra nagar", "somalwada", "ujjwal nagar", "chhatrapati square"],
  },
  {
    name: "Wardha Road",
    lat: 21.08,
    lng: 79.06,
    aliases: ["wardha road", "airport", "sonegaon", "mihan", "khapri"],
  },
  {
    name: "Mahal & Itwari",
    lat: 21.148,
    lng: 79.112,
    aliases: ["mahal", "itwari", "gandhibagh", "badkas square", "resimbagh", "sakkardara"],
  },
];

/**
 * Known Operating Bases for Seeded Partners
 */
const VENDOR_HUBS: Record<string, { lat: number; lng: number; hubName: string }> = {
  "vendor1@rrcms.local": { lat: 21.1418, lng: 79.0601, hubName: "Apex MicroTech (Dharampeth)" },
  "vendor2@rrcms.local": { lat: 21.1458, lng: 79.0832, hubName: "Vidarbha Electronics Care (Sitabuldi)" },
};

const DELIVERY_HUBS: Record<string, { lat: number; lng: number; hubName: string }> = {
  "delivery1@rrcms.local": { lat: 21.1165, lng: 79.0573, hubName: "Nagpur FastLogistics (Pratap Nagar)" },
  "delivery2@rrcms.local": { lat: 21.1374, lng: 79.0722, hubName: "OrangeCity Express (Ramdaspeth)" },
};

/**
 * Calculates Haversine great-circle distance between two GPS coordinates in kilometers
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place (e.g. 2.1 km)
}

export class NagpurRoutingService {
  /**
   * Resolves a customer address to the closest known Nagpur locality
   */
  static resolveLocality(address: string): GeoLocation {
    const text = address.toLowerCase();

    for (const loc of NAGPUR_LOCALITIES) {
      if (loc.aliases.some((alias) => text.includes(alias))) {
        return loc;
      }
    }

    // Default to Zero Mile / Sitabuldi (Nagpur City Geographical Centre)
    return NAGPUR_LOCALITIES[2]; // Sitabuldi
  }

  /**
   * Finds the shortest distance Vendor and Delivery Partner for an address in Nagpur
   */
  static async findShortestDistancePartners(address: string): Promise<RoutingResult> {
    const locality = this.resolveLocality(address);

    // Fetch active vendors and delivery partners from database
    const [vendors, deliveryPartners] = await Promise.all([
      prisma.user.findMany({
        where: { role: UserRole.VENDOR, isActive: true },
        select: { id: true, name: true, email: true, phone: true },
      }),
      prisma.user.findMany({
        where: { role: UserRole.DELIVERY_PARTNER, isActive: true },
        select: { id: true, name: true, email: true, phone: true },
      }),
    ]);

    if (vendors.length === 0) {
      throw new Error("No active vendors found in Nagpur service network");
    }

    if (deliveryPartners.length === 0) {
      throw new Error("No active delivery partners found in Nagpur logistics network");
    }

    // Only route to known active Nagpur service centres and logistics hubs
    const eligibleVendors = vendors.filter((v) => VENDOR_HUBS[v.email] !== undefined);
    const eligiblePartners = deliveryPartners.filter((dp) => DELIVERY_HUBS[dp.email] !== undefined);

    const vendorPool = eligibleVendors.length > 0 ? eligibleVendors : vendors;
    const partnerPool = eligiblePartners.length > 0 ? eligiblePartners : deliveryPartners;

    // Calculate distance to each vendor
    const rankedVendors: RoutingPartner[] = vendorPool.map((v) => {
      const hub = VENDOR_HUBS[v.email] || {
        lat: 21.1458,
        lng: 79.0832,
        hubName: "Nagpur Central Service Centre",
      };
      const distanceKm = calculateHaversineDistanceKm(
        locality.lat,
        locality.lng,
        hub.lat,
        hub.lng
      );
      return {
        id: v.id,
        name: v.name,
        email: v.email,
        phone: v.phone,
        hubName: hub.hubName,
        distanceKm,
      };
    });

    rankedVendors.sort((a, b) => a.distanceKm - b.distanceKm);
    const closestVendor = rankedVendors[0];

    // Calculate distance to each delivery partner
    const rankedPartners: RoutingPartner[] = partnerPool.map((dp) => {
      const hub = DELIVERY_HUBS[dp.email] || {
        lat: 21.1458,
        lng: 79.0832,
        hubName: "Nagpur Central Logistics Hub",
      };
      const distanceKm = calculateHaversineDistanceKm(
        locality.lat,
        locality.lng,
        hub.lat,
        hub.lng
      );
      return {
        id: dp.id,
        name: dp.name,
        email: dp.email,
        phone: dp.phone,
        hubName: hub.hubName,
        distanceKm,
      };
    });

    rankedPartners.sort((a, b) => a.distanceKm - b.distanceKm);
    const closestDeliveryPartner = rankedPartners[0];

    return {
      localityName: locality.name,
      coordinates: { lat: locality.lat, lng: locality.lng },
      vendor: closestVendor,
      deliveryPartner: closestDeliveryPartner,
      vendorDistanceKm: closestVendor.distanceKm,
      partnerDistanceKm: closestDeliveryPartner.distanceKm,
      explanation: `Location resolved to '${locality.name}'. Shortest distance service center: ${closestVendor.hubName} (${closestVendor.distanceKm} km). Shortest distance logistics partner: ${closestDeliveryPartner.hubName} (${closestDeliveryPartner.distanceKm} km).`,
    };
  }
}
