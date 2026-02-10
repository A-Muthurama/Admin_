
import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, ShoppingBag, Store, ChevronRight, Maximize2, X, MapPin, Calendar, Tag, PlayCircle, User, Phone, Hash, ExternalLink, Trash2 } from "lucide-react";
import { AdminOfferDetails, approveOffer, getOfferDetails, rejectOffer, deleteOffer } from "../../api/api";
import "../../styles/offer-details.css";

interface OfferDetailsPageProps {
    offerId: string;
    onBack: () => void;
    onStatusChange: () => void;
}

const formatDate = (dateString: any) => {
    if (!dateString) return '—';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) {
            // If it's a string like "2024-01-28", try to slice it or return as is
            if (typeof dateString === 'string' && dateString.length > 5) {
                return dateString.split('T')[0];
            }
            return '—';
        }
        return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return '—';
    }
};

export function OfferDetailsPage({ offerId, onBack, onStatusChange }: OfferDetailsPageProps) {
    const [details, setDetails] = useState<AdminOfferDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                const data = await getOfferDetails(offerId);
                setDetails(data.data);
            } catch (err) {
                console.error("Failed to fetch offer details", err);
                setError("Failed to load offer.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [offerId]);

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await approveOffer(offerId);
            onStatusChange();
            // Refresh details
            const data = await getOfferDetails(offerId);
            setDetails(data.data);
            alert("Offer approved successfully.");
        } catch (err: any) {
            console.error("Failed to approve offer", err);
            const serverMessage = err.response?.data?.message || err.message || "Unknown error";
            alert(`Failed to approve offer: ${serverMessage}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) return;
        setActionLoading(true);
        try {
            console.log("Attempting to reject offer:", offerId, "with reason:", rejectionReason);
            const response = await rejectOffer(offerId, rejectionReason);
            console.log("Rejection response:", response.data);

            setIsRejecting(false);
            onStatusChange();
            onBack();
            alert("Offer rejected and deleted successfully.");
        } catch (err: any) {
            console.error("Critical: Failed to reject offer", err);
            const serverMessage = err.response?.data?.message || err.message || "Unknown error";
            alert(`Failed to reject offer: ${serverMessage}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemove = async () => {
        if (!window.confirm("Are you sure you want to remove this offer? This action cannot be undone.")) return;
        setActionLoading(true);
        try {
            await deleteOffer(offerId);
            onBack(); // Go back to list after deletion
        } catch {
            alert("Failed to delete offer.");
        } finally {
            setActionLoading(false);
        }
    };

    const isPending = details?.status === 'PENDING';
    const isApproved = details?.status === 'APPROVED';
    const activeMedia = details?.images[activeMediaIndex];
    const isVideo = activeMedia ? /\.(mp4|webm|ogg|mov)$/i.test(activeMedia.url) : false;

    return (
        <div className="od-container">
            <div className="od-nav-bar">
                <button onClick={onBack} className="od-back-btn">
                    <ArrowLeft size={18} />
                    <span>Back to Offers</span>
                </button>
            </div>

            {isLoading && (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
                    <p className="text-gray-500 font-medium tracking-wide">Fetching offer details...</p>
                </div>
            )}

            {(error || (!isLoading && !details)) && (
                <div className="py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4">
                        <XCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
                    <p className="text-red-500 font-medium">{error || "Offer not found"}</p>
                    <p className="text-gray-400 text-sm mt-4">This might be due to a server or database connection issue.</p>
                </div>
            )}

            {!isLoading && details && (
                <>

                    {/* Header Card */}
                    <div className="od-header-card">
                        <div className="od-header-main">
                            <div className="od-icon-box">
                                <ShoppingBag size={32} />
                            </div>
                            <div className="wrapper-title-badges" style={{ flex: 1 }}>
                                <div className="od-title-group">
                                    <h1 className="od-title">{details.title}</h1>
                                    <div className="od-meta-row">
                                        <div className="od-meta-item">
                                            <Store size={14} className="text-gray-400" />
                                            <span className="font-semibold text-gray-700">{details.vendor.shopName}</span>
                                        </div>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-gray-500 font-medium">{formatDate(details.createdAt || (details as any).created_at)}</span>
                                    </div>
                                </div>

                                {/* Badges moved here as per screenshot */}
                                <div className="od-header-badges-row">
                                    <div className={`od-status-pill ${details.status.toLowerCase()}`}>
                                        <div className="od-pill-dot" />
                                        {details.status}
                                    </div>
                                    {(details.discount_label || (details.discountPercentage && details.discountPercentage > 0)) && (
                                        <div className="od-status-pill discount">
                                            <Tag size={12} />
                                            {details.discount_label || `${details.discountPercentage}% OFF`}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Far right badges removed as per 'remove' request in screenshot */}
                    </div>

                    {/* E-commerce Grid Layout */}
                    <div className="od-layout-grid">

                        {/* LEFT: Info Section (Moved to Left per User Request) */}
                        <div className="od-info-section">

                            {/* Main Info Card */}
                            <div className="od-card">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                    <Tag size={18} className="text-purple-700" />
                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide m-0">About this Offer</h3>
                                </div>

                                {/* Description Text */}
                                <div className="mb-8">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</div>
                                    <p className="od-description text-gray-700 leading-relaxed text-base">
                                        {details.description || <span className="italic text-gray-400">No description provided.</span>}
                                    </p>
                                </div>

                                {/* Stat Grid */}
                                <div className="od-stat-grid">

                                    {/* Category Card */}
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper">
                                            <ShoppingBag size={18} />
                                        </div>
                                        <div className="od-stat-label">Category</div>
                                        <div className="od-stat-value">{details.category || 'General'}</div>
                                    </div>

                                    {/* Discount Card */}
                                    {(details.discount_label || details.discountPercentage) && (
                                        <div className="od-stat-card is-discount">
                                            <div className="od-stat-icon-wrapper">
                                                <Tag size={18} />
                                            </div>
                                            <div className="od-stat-label">Discount</div>
                                            <div className="od-stat-value">
                                                {details.discount_label || `${details.discountPercentage}% OFF`}
                                            </div>
                                            {details.discount_type && (
                                                <div className="od-stat-sub">{details.discount_type}</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Validity Card */}
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="od-stat-label">Validity</div>
                                        <div className="od-stat-value">
                                            {(details.start_date || details.startDate) ? (
                                                <span>{formatDate(details.start_date || details.startDate!)}</span>
                                            ) : 'Not specified'}
                                        </div>
                                        <div className="od-stat-sub">
                                            To: {(details.end_date || details.endDate) ? formatDate(details.end_date || details.endDate!) : 'Ongoing'}
                                        </div>
                                    </div>

                                    {/* Shop Address Card */}
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper">
                                            <MapPin size={18} />
                                        </div>
                                        <div className="od-stat-label">Shop Address</div>
                                        <div className="od-stat-value" style={{ fontSize: '14px' }}>
                                            {(details.shop_address || (details.vendor as any).shop_address || details.vendor.address) ? (
                                                <span>{details.shop_address || (details.vendor as any).shop_address || details.vendor.address}</span>
                                            ) : (details.city || details.area || 'Address not available')}
                                        </div>

                                        {details.map_link && (
                                            <a
                                                href={details.map_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="od-stat-action-link"
                                                style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-plum)', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
                                            >
                                                <ExternalLink size={14} /> View on Map
                                            </a>
                                        )}

                                        {(details.vendor.city || details.vendor.state || details.vendor.pincode) && !details.shop_address && (
                                            <div className="od-stat-sub">
                                                {[details.vendor.city, details.vendor.state, details.vendor.pincode].filter(Boolean).join(', ')}
                                            </div>
                                        )}
                                    </div>

                                    {/* Buy Link Card (New) */}
                                    {details.buy_link && (
                                        <div className="od-stat-card">
                                            <div className="od-stat-icon-wrapper" style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div className="od-stat-label">Purchase</div>
                                            <div className="od-stat-value">Store Product Link</div>
                                            <a
                                                href={details.buy_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="od-stat-action-link"
                                                style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}
                                            >
                                                <ExternalLink size={14} /> Buy Now / View Item
                                            </a>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* Merchant Info */}
                            <div className="od-card">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                    <Store size={18} className="text-purple-700" />
                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide m-0">Merchant Info</h3>
                                </div>

                                <div className="od-stat-grid">
                                    {/* Shop Name */}
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper">
                                            <Store size={18} />
                                        </div>
                                        <div className="od-stat-label">Shop Name</div>
                                        <div className="od-stat-value">{details.vendor.shopName}</div>
                                    </div>

                                    {/* Owner Name */}
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper">
                                            <User size={18} />
                                        </div>
                                        <div className="od-stat-label">Owner</div>
                                        <div className="od-stat-value">{details.vendor.ownerName}</div>
                                    </div>

                                    {/* Phone */}
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper">
                                            <Phone size={18} />
                                        </div>
                                        <div className="od-stat-label">Phone</div>
                                        <div className="od-stat-value">{details.vendor.phone || <span className="text-gray-400 italic">N/A</span>}</div>
                                    </div>

                                    {/* Vendor ID */}
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper">
                                            <Hash size={18} />
                                        </div>
                                        <div className="od-stat-label">Vendor ID</div>
                                        <div className="od-stat-value text-xs font-mono bg-gray-100 p-1 rounded inline-block">
                                            {details.vendorId ? details.vendorId.slice(0, 8) : 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Panel */}
                            {isPending && (
                                <div className="od-action-panel">
                                    <div className="od-action-title">
                                        Pending Action
                                    </div>

                                    {!isRejecting ? (
                                        <div className="od-action-btn-group">
                                            <button onClick={handleApprove} disabled={actionLoading} className="od-btn od-btn-approve">
                                                <CheckCircle size={16} /> Approve Offer
                                            </button>
                                            <button onClick={() => setIsRejecting(true)} disabled={actionLoading} className="od-btn od-btn-reject">
                                                <XCircle size={16} /> Reject Offer
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="od-rejection-area">
                                            <h4 className="od-reject-title">Reason for Rejection</h4>
                                            <textarea
                                                className="od-textarea"
                                                rows={3}
                                                value={rejectionReason}
                                                onChange={e => setRejectionReason(e.target.value)}
                                                placeholder="Enter reason..."
                                            />
                                            <div className="od-confirm-row">
                                                <button onClick={handleReject} className="od-btn-confirm">Confirm</button>
                                                <button onClick={() => setIsRejecting(false)} className="od-btn-cancel">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {isApproved && (
                                <div className="od-action-panel">
                                    <div className="od-action-title" style={{ color: '#ef4444' }}>
                                        Manage Offer
                                    </div>
                                    <div className="od-action-btn-group">
                                        <button
                                            onClick={handleRemove}
                                            disabled={actionLoading}
                                            className="od-btn"
                                            style={{
                                                backgroundColor: '#fee2e2',
                                                color: '#ef4444',
                                                border: '1px solid #fecaca',
                                                flex: 1
                                            }}
                                        >
                                            <Trash2 size={16} /> Remove Offer
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 text-center">
                                        Removing this offer will permanently delete it from the system.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Media Gallery (Moved to Right per User Request) */}
                        <div className="od-gallery-section">
                            <div className="od-main-media">
                                {details.images.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-gray-400 h-64 bg-slate-50 rounded-2xl w-full">
                                        <ShoppingBag size={48} className="mb-2 opacity-20" />
                                        <p>No images provided</p>
                                    </div>
                                ) : isVideo ? (
                                    <video
                                        src={activeMedia?.url}
                                        controls
                                        autoPlay
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <img
                                        src={activeMedia?.url}
                                        alt="Offer View"
                                        className="cursor-zoom-in"
                                        onClick={() => setPreviewImage(activeMedia?.url || null)}
                                    />
                                )}
                            </div>

                            {/* Thumbnails */}
                            {details.images.length > 1 && (
                                <div className="od-thumbnails" style={{ justifyContent: 'flex-start', paddingLeft: '10px' }}>
                                    {details.images.map((img, idx) => {
                                        const isThumbVideo = /\.(mp4|webm|ogg|mov)$/i.test(img.url);
                                        return (
                                            <div
                                                key={img.id}
                                                className={`od-thumb-item ${idx === activeMediaIndex ? 'active' : ''}`}
                                                onClick={() => setActiveMediaIndex(idx)}
                                            >
                                                {isThumbVideo ? (
                                                    <div className="w-full h-full bg-black flex items-center justify-center relative">
                                                        <video src={img.url} className="od-thumb-img opacity-60" />
                                                        <div className="od-video-badge"><PlayCircle size={10} /></div>
                                                    </div>
                                                ) : (
                                                    <img src={img.url} alt="Thumb" className="od-thumb-img" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Lightbox for Zoom */}
                    {previewImage && (
                        <div className="vd-lightbox" onClick={() => setPreviewImage(null)}>
                            <button className="vd-lightbox-close" onClick={() => setPreviewImage(null)}>
                                <X size={32} />
                            </button>
                            {/\.(mp4|webm|ogg|mov)$/i.test(previewImage) ? (
                                <video src={previewImage} controls autoPlay className="vd-lightbox-img" onClick={e => e.stopPropagation()} />
                            ) : (
                                <img src={previewImage} alt="Full view" className="vd-lightbox-img" style={{ background: 'white' }} onClick={e => e.stopPropagation()} />
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
