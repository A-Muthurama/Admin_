import { useEffect, useMemo, useState } from "react";
import {
  AdminVendorProfile,
  BackendVendorStatus,
  getAllVendors,
} from "../../api/api";
import { Search, Loader2, Mail, Phone, MapPin, Building2, User } from "lucide-react";
import "../../styles/vendor-management.css"; // Import the new CSS

interface VendorManagementProps {
  onViewVendor: (vendorId: string) => void;
}

export function VendorManagement({ onViewVendor }: VendorManagementProps) {
  const [vendors, setVendors] = useState<AdminVendorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<BackendVendorStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await getAllVendors();
      setVendors(res.data);
    } catch (err) {
      console.error("Failed to load vendors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchesStatus = filterStatus === "ALL" || v.status === filterStatus;
      const q = searchQuery.toLowerCase();
      return matchesStatus && (q === "" || v.ownerName.toLowerCase().includes(q) || v.shopName.toLowerCase().includes(q) || v.user.email.toLowerCase().includes(q));
    });
  }, [vendors, filterStatus, searchQuery]);

  return (
    <div className="vm-container">
      <div className="vm-card">
        {/* Controls Header */}
        <div className="vm-controls">
          <div className="vm-controls-wrapper">
            <div className="vm-search-wrapper">
              <Search className="vm-search-icon" />
              <input
                type="text"
                placeholder="Search vendors..."
                className="vm-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="vm-filters">
              {(["ALL", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`vm-filter-btn ${filterStatus === status ? 'active' : ''}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="vm-table-container">
          <table className="vm-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="vm-loading">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={16} /> Loading vendors...
                    </div>
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="vm-empty">No vendors found matching your criteria.</td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>
                      <div className="vm-vendor-cell">
                        <div className="vm-avatar">
                          {vendor.ownerName.charAt(0)}
                        </div>
                        <div>
                          <div className="vm-shop-name">{vendor.shopName}</div>
                          <div className="vm-shop-id">ID: {vendor.id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="vm-contact-stack">
                        <div className="vm-contact-item">
                          <User size={14} className="vm-contact-icon" />
                          <span className="vm-owner-name">{vendor.ownerName}</span>
                        </div>
                        <div className="vm-contact-item">
                          <Mail size={14} className="vm-contact-icon" />
                          <span className="vm-contact-email">{vendor.user.email}</span>
                        </div>
                        <div className="vm-contact-item">
                          <Phone size={14} className="vm-contact-icon" />
                          <span className="vm-contact-phone">
                            {vendor.phone ? vendor.phone : <span className="text-gray-400 italic">No phone</span>}
                          </span>
                        </div>
                        {(vendor.city || vendor.state) && (
                          <div className="vm-contact-item">
                            <MapPin size={14} className="vm-contact-icon" />
                            <span className="vm-contact-location">
                              {vendor.city}{vendor.city && vendor.state ? ', ' : ''}{vendor.state}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="vm-badge vm-badge-role">
                        {vendor.user.role.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <span className={`vm-badge ${vendor.status === 'APPROVED' ? 'vm-badge-status-approved' :
                        vendor.status === 'PENDING' ? 'vm-badge-status-pending' :
                          vendor.status === 'SUSPENDED' ? 'vm-badge-status-suspended' : 'vm-badge-status-rejected'
                        }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => onViewVendor(vendor.id)}
                        className="vm-btn-view"
                      >
                        View <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  )
}
