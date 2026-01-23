import { useEffect, useMemo, useState } from "react";
import {
  AdminOfferDetails,
  BackendOfferStatus,
  PendingAdminOffer,
  approveOffer,
  getOfferDetails,
  getPendingOffers,
  rejectOffer,
} from "../../api/api";
import { CheckCircle, XCircle, Search, Eye } from "lucide-react";

export function OfferManagement() {
  const [offers, setOffers] = useState<PendingAdminOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<BackendOfferStatus | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<PendingAdminOffer | null>(
    null,
  );
  const [selectedOfferDetails, setSelectedOfferDetails] =
    useState<AdminOfferDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPendingOffers();
      setOffers(res.data);
    } catch (err) {
      setError("Failed to load offers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  useEffect(() => {
    if (!selectedOffer) {
      setSelectedOfferDetails(null);
      setDetailsError(null);
      setIsDetailsLoading(false);
      return;
    }

    const run = async () => {
      setIsDetailsLoading(true);
      setDetailsError(null);
      try {
        const res = await getOfferDetails(selectedOffer.id);
        setSelectedOfferDetails(res.data);
      } catch (err) {
        setDetailsError("Failed to load offer details");
      } finally {
        setIsDetailsLoading(false);
      }
    };

    run();
  }, [selectedOffer]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesStatus =
        filterStatus === "all" || offer.status === filterStatus;
      const q = searchQuery.trim().toLowerCase();
      const vendorText =
        `${offer.vendor.shopName} ${offer.vendor.ownerName} ${offer.vendor.user.email}`.toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        offer.title.toLowerCase().includes(q) ||
        vendorText.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [offers, filterStatus, searchQuery]);

  const handleApprove = async (offerId: string) => {
    setActionMessage(null);
    try {
      const res = await approveOffer(offerId);
      setActionMessage(res.data.message);
      setSelectedOffer(null);
      await refresh();
    } catch (err) {
      setActionMessage("Failed to approve offer");
    }
  };

  const handleReject = async (offerId: string) => {
    setActionMessage(null);
    try {
      const res = await rejectOffer(offerId);
      setActionMessage(res.data.message);
      setSelectedOffer(null);
      await refresh();
    } catch (err) {
      setActionMessage("Failed to reject offer");
    }
  };

  const getStatusBadge = (status: BackendOfferStatus) => {
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

  const statusOptions: (BackendOfferStatus | "all")[] = [
    "all",
    "PENDING",
    "APPROVED",
    "REJECTED",
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-gray-900">Offer Management</h3>

        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        {actionMessage && (
          <div className="mt-2 text-sm text-gray-700">{actionMessage}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-gray-600 mb-3">Search Offers</h4>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or vendor..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          <div>
            <h4 className="text-gray-600 mb-3">Filter by Status</h4>
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 flex items-center justify-between"
              >
                {filterStatus === "all" ? "All Statuses" : filterStatus}
                <span>▾</span>
              </button>

              {isFilterOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-full rounded-lg shadow-lg border border-gray-300 bg-white">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                        setIsFilterOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 transition-all border-l-4 border-transparent hover:border-gray-300"
                    >
                      {status === "all" ? "All Statuses" : status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Loading offers...
          </div>
        ) : (
          filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-gray-50"
            >
              <div className="relative h-40 bg-gray-200">
                <div className="absolute top-2 right-2">
                  {getStatusBadge(offer.status)}
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-gray-700 bg-white/80 px-2 py-1 rounded">
                  ID: {offer.id}
                </div>
              </div>
              <div className="p-4">
                <h4 className="mb-1 text-gray-900">{offer.title}</h4>
                <p className="text-sm mb-2 text-gray-600">
                  {offer.vendor.shopName} — {offer.vendor.ownerName}
                </p>
                <div className="flex items-center justify-between text-xs mb-3 text-gray-500">
                  <span>₹{offer.price}</span>
                  <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => setSelectedOffer(offer)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!isLoading && filteredOffers.length === 0 && (
        <div className="text-center py-8 text-gray-500">No offers found</div>
      )}

      {/* Offer Details Modal */}
      {selectedOffer && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div
            className="rounded-2xl shadow-xl border w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            <div
              className="sticky top-0 p-6 flex items-center justify-between border-b"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-color)",
              }}
            >
              <h2
                className="text-lg font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Offer Details
              </h2>
              <button
                onClick={() => setSelectedOffer(null)}
                className="p-2 rounded-lg"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <XCircle
                  className="w-6 h-6"
                  style={{ color: "var(--text-primary)" }}
                />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {isDetailsLoading && (
                <div className="text-sm text-gray-500">Loading details...</div>
              )}
              {detailsError && (
                <div className="text-sm text-red-600">{detailsError}</div>
              )}

              {!isDetailsLoading && !detailsError && selectedOfferDetails && (
                <>
                  <div
                    className="flex items-center justify-between p-4 rounded-xl border"
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>
                      Current Status
                    </span>
                    {getStatusBadge(selectedOfferDetails.status)}
                  </div>

                  <div>
                    <h3 className="text-foreground mb-3">Offer Information</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Offer ID
                          </p>
                          <p className="text-foreground">
                            {selectedOfferDetails.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            External Offer ID
                          </p>
                          <p className="text-foreground">
                            {selectedOfferDetails.externalOfferId ?? "—"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Title</p>
                        <p className="text-foreground">
                          {selectedOfferDetails.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Description
                        </p>
                        <p className="text-foreground">
                          {selectedOfferDetails.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="text-foreground">
                            ₹{selectedOfferDetails.price}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Is Active
                          </p>
                          <p className="text-foreground">
                            {selectedOfferDetails.isActive ? "Yes" : "No"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Created At
                          </p>
                          <p className="text-foreground">
                            {new Date(
                              selectedOfferDetails.createdAt,
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Vendor ID
                          </p>
                          <p className="text-foreground">
                            {selectedOfferDetails.vendorId}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Store Latitude
                          </p>
                          <p className="text-foreground">
                            {selectedOfferDetails.storeLat}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Store Longitude
                          </p>
                          <p className="text-foreground">
                            {selectedOfferDetails.storeLng}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-foreground mb-3">Vendor</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Shop Name
                        </p>
                        <p className="text-foreground">
                          {selectedOfferDetails.vendor.shopName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Owner Name
                        </p>
                        <p className="text-foreground">
                          {selectedOfferDetails.vendor.ownerName}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-foreground">
                          {selectedOfferDetails.vendor.user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-foreground mb-3">Images</h3>
                    {selectedOfferDetails.images.length === 0 ? (
                      <div className="text-sm text-gray-500">No images</div>
                    ) : (
                      <div className="space-y-3">
                        {selectedOfferDetails.images.map((img) => (
                          <div
                            key={img.id}
                            className="flex gap-4 p-3 rounded-lg border"
                            style={{
                              backgroundColor: "var(--bg-tertiary)",
                              borderColor: "var(--border-color)",
                            }}
                          >
                            <img
                              src={img.url}
                              alt={img.id}
                              className="w-20 h-20 rounded object-cover bg-white"
                            />
                            <div className="flex-1">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Image ID
                                  </p>
                                  <p className="text-sm text-foreground break-words">
                                    {img.id}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Status
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {img.status}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-xs text-muted-foreground">
                                    Public ID
                                  </p>
                                  <p className="text-sm text-foreground break-words">
                                    {img.publicId}
                                  </p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-xs text-muted-foreground">
                                    URL
                                  </p>
                                  <p className="text-sm text-foreground break-words">
                                    {img.url}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Offer ID
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {img.offerId}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Created At
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {new Date(img.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedOfferDetails.status === "PENDING" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(selectedOfferDetails.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Approve Offer
                      </button>
                      <button
                        onClick={() => handleReject(selectedOfferDetails.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Offer
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
