import { useEffect, useMemo, useState } from "react";
import {
  AdminVendorProfile,
  BackendVendorStatus,
  VendorKycResponse,
  approveVendor,
  getAllVendors,
  getVendorKyc,
  rejectVendor,
} from "../../api/api";
import { CheckCircle, XCircle, Search, Eye } from "lucide-react";

export function VendorManagement() {
  const [vendors, setVendors] = useState<AdminVendorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<BackendVendorStatus | "all">(
    "all",
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] =
    useState<AdminVendorProfile | null>(null);

  const [kycDetails, setKycDetails] = useState<VendorKycResponse | null>(null);
  const [isKycLoading, setIsKycLoading] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAllVendors();
      setVendors(res.data);
    } catch (err) {
      setError("Failed to load vendors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!selectedVendor) {
      setKycDetails(null);
      setKycError(null);
      setIsKycLoading(false);
      return;
    }

    const run = async () => {
      setIsKycLoading(true);
      setKycError(null);
      try {
        const res = await getVendorKyc(selectedVendor.id);
        setKycDetails(res.data);
      } catch (err) {
        setKycError("Failed to load KYC details");
      } finally {
        setIsKycLoading(false);
      }
    };

    run();
  }, [selectedVendor]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesStatus =
        filterStatus === "all" || vendor.status === filterStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        vendor.ownerName.toLowerCase().includes(q) ||
        vendor.shopName.toLowerCase().includes(q) ||
        vendor.user.email.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [vendors, filterStatus, searchQuery]);

  const handleApprove = async (userId: string) => {
    setActionMessage(null);
    try {
      const res = await approveVendor(userId);
      setActionMessage(res.data.message);
      setSelectedVendor(null);
      await refresh();
    } catch (err) {
      setActionMessage("Failed to approve vendor");
    }
  };

  const handleReject = async (userId: string) => {
    setActionMessage(null);
    try {
      const res = await rejectVendor(userId);
      setActionMessage(res.data.message);
      setSelectedVendor(null);
      await refresh();
    } catch (err) {
      setActionMessage("Failed to reject vendor");
    }
  };

  const getStatusBadge = (status: BackendVendorStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
            Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
            Rejected
          </span>
        );
    }
  };

  const statusOptions: (BackendVendorStatus | "all")[] = [
    "all",
    "PENDING",
    "APPROVED",
    "REJECTED",
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-gray-900">Vendor Management</h3>
      <p className="text-gray-600 mb-6">Manage vendor details and statuses</p>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      {actionMessage && (
        <div className="mb-4 text-sm text-gray-700">{actionMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search Vendors */}
        <div>
          <label className="block text-sm mb-2 text-gray-600">
            Search Vendors
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, business, or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300"
            />
          </div>
        </div>

        {/* Filter by Status */}
        <div>
          <label className="block text-sm mb-2 text-gray-600">
            Filter by Status
          </label>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 flex items-center justify-between"
            >
              {filterStatus === "all" ? "All Statuses" : filterStatus}
              <span>▾</span>
            </button>

            {isFilterOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 w-full rounded-lg shadow-lg border bg-white">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setFilterStatus(status);
                      setIsFilterOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {status === "all" ? "All Statuses" : status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-3 px-4 text-gray-600">Vendor</th>
              <th className="text-left py-3 px-4 text-gray-600">Shop</th>
              <th className="text-left py-3 px-4 text-gray-600">Email</th>
              <th className="text-left py-3 px-4 text-gray-600">Role</th>
              <th className="text-left py-3 px-4 text-gray-600">Status</th>
              <th className="text-left py-3 px-4 text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-6 px-4 text-gray-500">
                  Loading vendors...
                </td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-gray-300">
                  <td className="py-3 px-4">
                    <p className="text-gray-900 font-medium">
                      {vendor.ownerName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Vendor ID: {vendor.id}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{vendor.shopName}</td>
                  <td className="py-3 px-4 text-gray-900">
                    {vendor.user.email}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {vendor.user.role}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(vendor.status)}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedVendor(vendor)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!isLoading && filteredVendors.length === 0 && (
          <div className="text-center py-8 text-gray-500">No vendors found</div>
        )}
      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/30">
          <div className="rounded-2xl shadow-xl border w-full max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 p-6 flex items-center justify-between border-b border-gray-300 bg-white">
              <h2 className="text-lg font-medium text-gray-900">
                Vendor Details
              </h2>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle className="w-6 h-6 text-gray-900" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-gray-50 border-gray-300">
                <span className="text-gray-600">Current Status</span>
                {getStatusBadge(selectedVendor.status)}
              </div>

              {/* Vendor Information */}
              <div>
                <h3 className="text-amber-400 mb-3">Vendor Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Owner Name</p>
                    <p className="text-foreground">
                      {selectedVendor.ownerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground">
                      {selectedVendor.user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">User Role</p>
                    <p className="text-foreground">
                      {selectedVendor.user.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Registered On
                    </p>
                    <p className="text-foreground">
                      {new Date(selectedVendor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">User ID</p>
                    <p className="text-foreground">{selectedVendor.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      External Vendor ID
                    </p>
                    <p className="text-foreground">
                      {selectedVendor.externalVendorId ?? "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shop Information */}
              <div>
                <h3 className="text-amber-400 mb-3">Shop Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Shop Name</p>
                    <p className="text-foreground">{selectedVendor.shopName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">KYC Status</p>
                    <p className="text-foreground">{selectedVendor.status}</p>
                  </div>
                </div>
              </div>

              {/* KYC Documents */}
              <div>
                <h3 className="text-amber-400 mb-3">KYC</h3>
                <div className="space-y-3">
                  {isKycLoading && (
                    <div className="text-sm text-gray-500">Loading KYC...</div>
                  )}
                  {kycError && (
                    <div className="text-sm text-red-600">{kycError}</div>
                  )}

                  {!isKycLoading && !kycError && kycDetails && (
                    <div className="rounded-lg border bg-gray-50 border-gray-200 p-4 space-y-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Vendor Email
                        </p>
                        <p className="text-foreground">
                          {kycDetails.user.email}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Shop Name
                          </p>
                          <p className="text-foreground">
                            {kycDetails.shopName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Owner Name
                          </p>
                          <p className="text-foreground">
                            {kycDetails.ownerName}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          KYC Docs
                        </p>
                        <p className="text-foreground break-words">
                          {kycDetails.kycDocs}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedVendor.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleApprove(selectedVendor.user.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Vendor
                    </button>
                    <button
                      onClick={() => handleReject(selectedVendor.user.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject Vendor
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
