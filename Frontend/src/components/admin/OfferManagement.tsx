import { useEffect, useMemo, useState } from "react";
import {
  PendingAdminOffer,
  BackendOfferStatus,
  getPendingOffers,
  getAllOffers,
} from "../../api/api";
import { Search, Loader2, ShoppingBag, Store, Phone, Tag, ChevronRight } from "lucide-react";
import "../../styles/offer-management.css";

interface OfferManagementProps {
  onViewOffer: (offerId: string) => void;
}

export function OfferManagement({ onViewOffer }: OfferManagementProps) {
  const [offers, setOffers] = useState<PendingAdminOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<BackendOfferStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await getAllOffers();
      setOffers(res.data);
    } catch (err) {
      console.error("Failed to load offers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const matchesStatus = filterStatus === "all" || offer.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const vendorText = `${offer.vendor.shopName} ${offer.vendor.ownerName}`.toLowerCase();
      return matchesStatus && (q === "" || offer.title.toLowerCase().includes(q) || vendorText.includes(q));
    });
  }, [offers, filterStatus, searchQuery]);

  return (
    <div className="om-container">
      {/* Controls */}
      <div className="om-card om-controls">
        <div className="om-controls-inner">
          <div className="om-filters">
            {(["all", "PENDING", "APPROVED", "REJECTED"] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`om-filter-btn ${filterStatus === status ? 'active' : ''}`}
              >
                {status === 'all' ? 'All Offers' : status}
              </button>
            ))}
          </div>

          <div className="om-search-wrapper">
            <Search className="om-search-icon" />
            <input
              type="text"
              placeholder="Search offers..."
              className="om-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Offers List (Horizontal Layout) */}
      <div className="om-list">
        {isLoading ? (
          <div className="om-state-container">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" /> Loading inventory...
            </div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="om-state-container">
            No offers found matching your criteria.
          </div>
        ) : (
          <div className="om-row-container">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="om-row-card" onClick={() => onViewOffer(offer.id)}>
                {/* Left: Poster */}
                <div className="om-row-img-wrapper">
                  {offer.poster_url ? (
                    <img src={offer.poster_url} alt={offer.title} className="om-row-img" />
                  ) : (
                    <div className="om-row-fallback">
                      <ShoppingBag size={20} />
                    </div>
                  )}
                  <span className={`om-status-dot ${offer.status.toLowerCase()}`}></span>
                </div>

                {/* Middle: Info */}
                <div className="om-row-info">
                  <div className="om-row-title-group">
                    <h3 className="om-row-title">{offer.title}</h3>
                    <div className="om-row-subtitle">
                      <Store size={14} /> {offer.vendor.shopName}
                      <span className="om-sep">•</span>
                      <Tag size={12} /> {offer.category || 'General'}
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Discount */}
                <div className="om-row-actions">
                  <div className="om-row-discount">
                    <span className="om-discount-label">
                      {offer.discount_label || (offer.discountPercentage ? `${offer.discountPercentage}% OFF` : '-')}
                    </span>
                  </div>
                  <div className={`om-row-status ${offer.status.toLowerCase()}`}>
                    {offer.status}
                  </div>
                  <ChevronRight size={20} className="om-row-arrow" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
