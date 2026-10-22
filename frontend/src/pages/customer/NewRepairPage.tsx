import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";
import { Wrench, Upload, AlertCircle, ArrowLeft, Truck, MapPin, Compass } from "lucide-react";

const NAGPUR_AREAS = [
  {
    name: "Civil Lines",
    address: "Civil Lines, Near High Court, Nagpur 440001",
    vendor: "Apex MicroTech (Dharampeth)",
    vendorEmail: "vendor1@rrcms.local",
    vendorDist: "1.5 km",
    courier: "OrangeCity Express (Ramdaspeth)",
    courierEmail: "delivery2@rrcms.local",
    courierDist: "1.9 km",
  },
  {
    name: "Dharampeth",
    address: "West High Court Road, Dharampeth, Nagpur 440010",
    vendor: "Apex MicroTech (Dharampeth)",
    vendorEmail: "vendor1@rrcms.local",
    vendorDist: "0.0 km (Base Workshop)",
    courier: "OrangeCity Express (Ramdaspeth)",
    courierEmail: "delivery2@rrcms.local",
    courierDist: "1.3 km",
  },
  {
    name: "Sitabuldi",
    address: "Variety Square, Sitabuldi, Nagpur 440012",
    vendor: "Vidarbha Electronics Care (Sitabuldi)",
    vendorEmail: "vendor2@rrcms.local",
    vendorDist: "0.0 km (Base Workshop)",
    courier: "OrangeCity Express (Ramdaspeth)",
    courierEmail: "delivery2@rrcms.local",
    courierDist: "1.5 km",
  },
  {
    name: "Ramdaspeth",
    address: "Central Bazaar Road, Ramdaspeth, Nagpur 440010",
    vendor: "Apex MicroTech (Dharampeth)",
    vendorEmail: "vendor1@rrcms.local",
    vendorDist: "1.3 km",
    courier: "OrangeCity Express (Ramdaspeth)",
    courierEmail: "delivery2@rrcms.local",
    courierDist: "0.0 km (Base Hub)",
  },
  {
    name: "Pratap Nagar",
    address: "Ring Road, Pratap Nagar, Nagpur 440022",
    vendor: "Apex MicroTech (Dharampeth)",
    vendorEmail: "vendor1@rrcms.local",
    vendorDist: "2.8 km",
    courier: "Nagpur FastLogistics (Pratap Nagar)",
    courierEmail: "delivery1@rrcms.local",
    courierDist: "0.0 km (Base Hub)",
  },
  {
    name: "Manish Nagar",
    address: "Besa Road, Manish Nagar, Nagpur 440015",
    vendor: "Apex MicroTech (Dharampeth)",
    vendorEmail: "vendor1@rrcms.local",
    vendorDist: "5.7 km",
    courier: "Nagpur FastLogistics (Pratap Nagar)",
    courierEmail: "delivery1@rrcms.local",
    courierDist: "3.4 km",
  },
  {
    name: "Sadar",
    address: "Residency Road, Sadar, Nagpur 440001",
    vendor: "Vidarbha Electronics Care (Sitabuldi)",
    vendorEmail: "vendor2@rrcms.local",
    vendorDist: "1.7 km",
    courier: "OrangeCity Express (Ramdaspeth)",
    courierEmail: "delivery2@rrcms.local",
    courierDist: "2.8 km",
  },
  {
    name: "Bajaj Nagar / Laxmi Nagar",
    address: "Abhyankar Nagar, Bajaj Nagar, Nagpur 440010",
    vendor: "Apex MicroTech (Dharampeth)",
    vendorEmail: "vendor1@rrcms.local",
    vendorDist: "1.7 km",
    courier: "Nagpur FastLogistics (Pratap Nagar)",
    courierEmail: "delivery1@rrcms.local",
    courierDist: "1.4 km",
  },
  {
    name: "Wardha Road",
    address: "Airport Road, Wardha Road, Nagpur 440025",
    vendor: "Apex MicroTech (Dharampeth)",
    vendorEmail: "vendor1@rrcms.local",
    vendorDist: "6.9 km",
    courier: "Nagpur FastLogistics (Pratap Nagar)",
    courierEmail: "delivery1@rrcms.local",
    courierDist: "4.1 km",
  },
];

export const NewRepairPage: React.FC = () => {
  const navigate = useNavigate();

  const [deviceType, setDeviceType] = useState("Smartphone");
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [pickupRequested, setPickupRequested] = useState(true);

  const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
  const [pickupAddress, setPickupAddress] = useState(NAGPUR_AREAS[0].address);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAreaChange = (idx: number) => {
    setSelectedAreaIndex(idx);
    setPickupAddress(NAGPUR_AREAS[idx].address);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pickupRequested && !pickupAddress.trim()) {
      setError("Please provide a pickup address in Nagpur for doorstep collection.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("deviceType", deviceType);
      formData.append("deviceBrand", deviceBrand);
      formData.append("deviceModel", deviceModel);
      formData.append("serialNumber", serialNumber);
      formData.append("issueDescription", issueDescription);
      formData.append("pickupRequested", pickupRequested ? "true" : "false");
      if (pickupRequested && pickupAddress) {
        formData.append("pickupAddress", pickupAddress);
      }
      if (image) {
        formData.append("image", image);
      }

      await api.createRepair(formData);
      navigate("/customer/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to submit repair request");
    } finally {
      setLoading(false);
    }
  };

  const activeArea = NAGPUR_AREAS[selectedAreaIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Link
        to="/customer/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Submit Device Repair Request
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Shortest-distance routing automatically connects your request to the nearest Nagpur service centre and courier partner
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Device Category *
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Smartphone">Smartphone</option>
                <option value="Laptop">Laptop / Notebook</option>
                <option value="Tablet">Tablet / iPad</option>
                <option value="Smartwatch">Smartwatch / Wearable</option>
                <option value="Audio Equipment">Headphones / Audio</option>
                <option value="Gaming Console">Gaming Console</option>
                <option value="Other">Other Electronic Device</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brand / Maker
              </label>
              <input
                type="text"
                value={deviceBrand}
                onChange={(e) => setDeviceBrand(e.target.value)}
                placeholder="e.g. Apple, Samsung, Dell"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Model Name / Number
              </label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="e.g. Galaxy S24 Ultra, MacBook Air"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Serial Number (Optional)
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Serial or IMEI number"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Issue Description & Symptoms *
            </label>
            <textarea
              required
              rows={3}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Describe what is malfunctioning (e.g. screen flickers, battery drain, liquid damage)..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Nagpur Location & Doorstep Pickup Routing Section */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pickupRequested}
                  onChange={(e) => setPickupRequested(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Request Doorstep Pickup in Nagpur
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    A delivery partner will collect your device from your doorstep tomorrow.
                  </p>
                </div>
              </label>
            </div>

            {/* Nagpur Area Selector */}
            <div className="pt-1 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Select Nagpur Locality (For Shortest Distance Routing)
                </label>
                <select
                  value={selectedAreaIndex}
                  onChange={(e) => handleAreaChange(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {NAGPUR_AREAS.map((a, i) => (
                    <option key={a.name} value={i}>
                      {a.name} (Nearest: {a.vendor} · {a.vendorDist})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Specific Doorstep Pickup Address *
                </label>
                <input
                  type="text"
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="House/Flat No., Landmark, Area, Nagpur"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Live Distance Routing Preview Card */}
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1.5 shadow-2xs">
                <span className="font-bold text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Shortest-Distance Auto-Assignment Preview:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 space-y-0.5">
                    <span className="font-semibold block text-amber-900 dark:text-amber-200">Nearest Service Centre:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{activeArea.vendor}</span>
                    <p className="text-amber-700 dark:text-amber-400 font-bold">Distance: {activeArea.vendorDist}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                      Demo Login: <code className="font-mono font-semibold text-amber-700 dark:text-amber-300">{activeArea.vendorEmail}</code>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 space-y-0.5">
                    <span className="font-semibold block text-emerald-900 dark:text-emerald-200">Assigned Logistics Partner:</span>
                    <span className="font-medium text-slate-900 dark:text-white">{activeArea.courier}</span>
                    <p className="text-emerald-700 dark:text-emerald-400 font-bold">Distance: {activeArea.courierDist}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                      Demo Login: <code className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">{activeArea.courierEmail}</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Optional Device Photo (Damage Verification)
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {preview && (
                <div className="flex items-center gap-2">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Image attached</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Routing & Submitting..." : "Submit Repair Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
