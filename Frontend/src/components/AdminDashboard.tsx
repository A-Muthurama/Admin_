
import { useState, useEffect } from "react";
import { LogOut, Diamond } from "lucide-react";
import { VendorManagement } from "./admin/VendorManagement";
import { OfferManagement } from "./admin/OfferManagement";
import { LocationManagement } from "./admin/LocationManagement";
import { PlanManagement } from "./admin/PlanManagement";
import { VendorDetailsPage } from "./admin/VendorDetailsPage";
import { OfferDetailsPage } from "./admin/OfferDetailsPage";
import { Footer } from "./Footer";
import icon from "../assets/icon.png";
import "../styles/top-nav-premium.css"; // The new premium styles

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminTab = "vendors" | "offers" | "locations" | "plans";

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("vendors");
  const [viewingVendorId, setViewingVendorId] = useState<string | null>(null);
  const [viewingOfferId, setViewingOfferId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Sync state with URL on Load and on Browser Back/Forward
  useEffect(() => {
    const handleLocationChange = () => {
      const fullPath = window.location.pathname.toLowerCase().replace(/\/$/, ""); // Normalize path

      if (fullPath.startsWith('/vendor/')) {
        const id = fullPath.replace('/vendor/', '');
        setViewingVendorId(id);
        setViewingOfferId(null);
        setActiveTab('vendors');
      } else if (fullPath.startsWith('/offer/')) {
        const id = fullPath.replace('/offer/', '');
        setViewingOfferId(id);
        setViewingVendorId(null);
        setActiveTab('offers');
      } else if (fullPath === '/offers' || fullPath === '/offer') {
        setActiveTab('offers');
        setViewingVendorId(null);
        setViewingOfferId(null);
      } else if (fullPath === '/locations' || fullPath === '/location') {
        setActiveTab('locations');
        setViewingVendorId(null);
        setViewingOfferId(null);
      } else if (fullPath === '/plans' || fullPath === '/plan') {
        setActiveTab('plans');
        setViewingVendorId(null);
        setViewingOfferId(null);
      } else {
        setActiveTab('vendors');
        setViewingVendorId(null);
        setViewingOfferId(null);
      }
    };

    // Initialize on mount
    handleLocationChange();

    // Listen for back/forward buttons
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const menuItems = [
    { id: "vendors" as AdminTab, label: "Vendors", path: '/vendors' },
    { id: "offers" as AdminTab, label: "Offers", path: '/offers' },
    { id: "plans" as AdminTab, label: "Plan", path: '/plans' },
    { id: "locations" as AdminTab, label: "Location", path: '/locations' },
  ];

  const handleTabChange = (item: { id: AdminTab, path: string }) => {
    setActiveTab(item.id);
    setViewingVendorId(null);
    setViewingOfferId(null);
    window.history.pushState({ tab: item.id }, '', item.path);
  };

  const handleViewVendor = (id: string) => {
    setViewingVendorId(id);
    window.history.pushState({ vendorId: id }, '', `/vendor/${id}`);
  };

  const handleViewOffer = (id: string) => {
    setViewingOfferId(id);
    window.history.pushState({ offerId: id }, '', `/offer/${id}`);
  };

  const handleStatusChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const isDetailView = !!viewingVendorId || !!viewingOfferId;

  return (
    <div className="w-full">
      {/* Dashboard Header - Always Visible */}
      <header className="pj-header-container">
        <div
          className="pj-brand"
          onClick={() => {
            setActiveTab('vendors');
            setViewingVendorId(null);
            setViewingOfferId(null);
            window.history.pushState({ tab: 'vendors' }, '', '/vendors');
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="pj-logo-wrapper">
            <img src={icon} alt="Jewellers Paradise" className="pj-logo-icon" />
          </div>
          <span className="pj-brand-name">JEWELLERS PARADISE</span>
        </div>

        <nav className="pj-nav-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item)}
              className={`pj-nav-link ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div>
          <button onClick={onLogout} className="pj-btn-action flex items-center gap-2">
            <LogOut size={16} color="white" />
            <span style={{ color: 'white' }}>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={isDetailView ? "p-10 pt-20 pb-32 animate-fade-in" : "pj-main-layout"}>
        <div className="fadeInPage">
          {viewingVendorId ? (
            <VendorDetailsPage
              vendorId={viewingVendorId}
              onBack={() => {
                setViewingVendorId(null);
                window.history.pushState({ tab: 'vendors' }, '', '/vendors');
              }}
              onStatusChange={handleStatusChange}
            />
          ) : viewingOfferId ? (
            <OfferDetailsPage
              offerId={viewingOfferId}
              onBack={() => {
                setViewingOfferId(null);
                window.history.pushState({ tab: 'offers' }, '', '/offers');
              }}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div key={refreshKey}>
              {activeTab === "vendors" && <VendorManagement onViewVendor={handleViewVendor} />}
              {activeTab === "offers" && <OfferManagement onViewOffer={handleViewOffer} />}
              {activeTab === "locations" && <LocationManagement />}
              {activeTab === "plans" && <PlanManagement />}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
