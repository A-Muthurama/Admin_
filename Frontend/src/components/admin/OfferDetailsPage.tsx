
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, ShoppingBag, Store, X, MapPin, Calendar, Tag, PlayCircle, User, Phone, Trash2, ExternalLink, Mail } from "lucide-react";
import { AdminOfferDetails, approveOffer, getOfferDetails, rejectOffer, deleteOffer } from "../../api/api";
import "../../styles/offer-details.css";
import { toast } from "sonner";
import { ConfirmationModal } from "../common/ConfirmationModal";

interface OfferDetailsPageProps {
    offerId: string;
    onBack: () => void;
    onStatusChange: () => void;
}

const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
};

const formatDate = (dateString: any) => {
    if (!dateString) return null;
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) {
            // Check if it's already a formatted string or just the date part
            if (typeof dateString === 'string' && dateString.split('-').length === 3) {
                const parts = dateString.split('T')[0].split('-');
                if (parts.length === 3) {
                    const year = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const day = parseInt(parts[2]);
                    const d2 = new Date(year, month, day);
                    if (!isNaN(d2.getTime())) {
                        const day2 = d2.getDate();
                        const month2 = d2.toLocaleDateString('en-GB', { month: 'short' });
                        return `${day2}${getOrdinalSuffix(day2)} ${month2} ${d2.getFullYear()}`;
                    }
                }
            }
            return null;
        }
        const day = d.getDate();
        const month = d.toLocaleDateString('en-GB', { month: 'short' });
        return `${day}${getOrdinalSuffix(day)} ${month} ${d.getFullYear()}`;
    } catch {
        return null;
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
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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
            toast.success("Offer approved successfully.");
            onStatusChange();
            const data = await getOfferDetails(offerId);
            setDetails(data.data);
        } catch (err: any) {
            console.error("Failed to approve offer", err);
            const serverMessage = err.response?.data?.message || err.message || "Unknown error";
            toast.error(`Approval Failed: ${serverMessage}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) return;
        setActionLoading(true);
        try {
            await rejectOffer(offerId, rejectionReason);
            toast.success("Offer rejected successfully.");
            setIsRejecting(false);
            onStatusChange();
            onBack();
        } catch (err: any) {
            console.error("Failed to reject offer", err);
            const serverMessage = err.response?.data?.message || err.message || "Unknown error";
            toast.error(`Rejection Failed: ${serverMessage}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemove = async () => {
        setIsConfirmModalOpen(true);
    };

    const executeRemove = async () => {
        setIsConfirmModalOpen(false);
        setActionLoading(true);
        try {
            await deleteOffer(offerId);
            onBack();
            toast.success("Offer removed successfully.");
        } catch {
            toast.error("Failed to delete offer.");
        } finally {
            setActionLoading(false);
        }
    };

    const isPending = details?.status === 'PENDING';
    const isApproved = details?.status === 'APPROVED';
    const isRejected = details?.status === 'REJECTED';
    const activeMedia = details?.images[activeMediaIndex];
    const isVideo = activeMedia ? /\.(mp4|webm|ogg|mov)$/i.test(activeMedia.url) : false;

    const offerDate = details ? formatDate(details.createdAt || (details as any).created_at) : null;

    return (
        <div className="od-container">
            <div className="od-nav-bar" style={{ marginBottom: '24px', display: 'flex' }}>
                <button
                    onClick={() => {
                        console.log("Back button clicked");
                        onBack();
                    }}
                    className="od-back-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'var(--color-plum-soft)',
                        color: 'var(--color-plum)',
                        border: '1px solid var(--border-accent)',
                        padding: '10px 20px',
                        borderRadius: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        fontSize: '14px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                >
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
                </div>
            )}

            {!isLoading && details && (
                <>
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
                                        {offerDate && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-gray-500 font-medium">{offerDate}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
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
                    </div>

                    <div className="od-layout-grid">
                        <div className="od-info-section">
                            <div className="od-card">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                    <Tag size={18} style={{ color: 'var(--color-plum)' }} />
                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide m-0">About this Offer</h3>
                                </div>
                                <div className="mb-8">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</div>
                                    <p className="od-description text-gray-700 leading-relaxed text-base">
                                        {details.description || <span className="italic text-gray-400">No description provided.</span>}
                                    </p>
                                </div>
                                <div className="od-stat-grid">
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper"><ShoppingBag size={18} /></div>
                                        <div className="od-stat-label">Category</div>
                                        <div className="od-stat-value">{details.category || 'General'}</div>
                                    </div>
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper"><Calendar size={18} /></div>
                                        <div className="od-stat-label">Validity</div>
                                        <div className="od-stat-value">
                                            {formatDate(details.start_date || details.startDate) || 'Start Date N/A'}
                                            {(details.end_date || details.endDate) ? ` to ${formatDate(details.end_date || details.endDate)}` : ' (Ongoing)'}
                                        </div>
                                    </div>
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper"><MapPin size={18} /></div>
                                        <div className="od-stat-label">Location</div>
                                        <div className="od-stat-value text-sm">
                                            {details.shop_address || details.vendor.address || 'Address not available'}
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
                                    </div>
                                    {details.buy_link && (
                                        <div className="od-stat-card">
                                            <div className="od-stat-icon-wrapper">
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div className="od-stat-label">Buy Link</div>
                                            <div className="od-stat-value">Available Online</div>
                                            <a
                                                href={details.buy_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="od-stat-action-link"
                                                style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-plum)', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
                                            >
                                                <ExternalLink size={14} /> Visit Store
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="od-card">
                                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                                    <Store size={18} style={{ color: 'var(--color-plum)' }} />
                                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide m-0">Merchant Info</h3>
                                </div>
                                <div className="od-stat-grid">
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper"><Store size={18} /></div>
                                        <div className="od-stat-label">Shop</div>
                                        <div className="od-stat-value">{details.vendor.shopName}</div>
                                    </div>
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper"><User size={18} /></div>
                                        <div className="od-stat-label">Owner</div>
                                        <div className="od-stat-value">{details.vendor.ownerName}</div>
                                    </div>
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper"><Phone size={18} /></div>
                                        <div className="od-stat-label">Phone</div>
                                        <div className="od-stat-value">{details.vendor.phone || 'N/A'}</div>
                                    </div>
                                    <div className="od-stat-card">
                                        <div className="od-stat-icon-wrapper"><Mail size={18} /></div>
                                        <div className="od-stat-label">Email</div>
                                        <div className="od-stat-value" style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                                            {details.vendor.user?.email || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isPending && (
                                <div className="od-action-panel">
                                    <div className="od-action-title">Pending Action</div>
                                    {isRejecting ? (
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
                                    ) : (
                                        <div className="od-action-btn-group">
                                            <button onClick={handleApprove} disabled={actionLoading} className="od-btn od-btn-approve">
                                                <CheckCircle size={16} /> Approve Offer
                                            </button>
                                            <button onClick={() => setIsRejecting(true)} disabled={actionLoading} className="od-btn od-btn-reject">
                                                <XCircle size={16} /> Reject Offer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isRejected && (
                                <div className="od-action-panel">
                                    <div className="od-action-title" style={{ color: 'var(--color-error)' }}>Offer Rejected</div>
                                    {details.rejection_reason && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                                            <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Reason</div>
                                            <p className="text-sm text-red-700">{details.rejection_reason}</p>
                                        </div>
                                    )}
                                    <div className="od-action-btn-group">
                                        <button onClick={handleApprove} disabled={actionLoading} className="od-btn od-btn-approve" style={{ flex: 1 }}>
                                            <CheckCircle size={16} /> Re-Approve Offer
                                        </button>
                                        <button onClick={handleRemove} disabled={actionLoading} className="od-btn" style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', flex: 1 }}>
                                            <Trash2 size={16} /> Remove Permanently
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isApproved && (
                                <div className="od-action-panel">
                                    <div className="od-action-title" style={{ color: 'var(--color-error)' }}>Manage Offer</div>
                                    <div className="od-action-btn-group">
                                        <button onClick={handleRemove} disabled={actionLoading} className="od-btn" style={{ backgroundColor: 'var(--color-plum-soft)', color: 'var(--color-plum)', border: '1px solid var(--border-accent)', flex: 1 }}>
                                            <Trash2 size={16} /> Remove Offer
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="od-gallery-section">
                            <div className="od-main-media">
                                {details.images.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-gray-400 h-64 bg-slate-50 rounded-2xl w-full">
                                        <ShoppingBag size={48} className="mb-2 opacity-20" />
                                        <p>No images</p>
                                    </div>
                                ) : isVideo ? (
                                    <video src={activeMedia?.url} controls autoPlay className="w-full h-full object-contain" />
                                ) : (
                                    <img src={activeMedia?.url} alt="Offer" className="cursor-zoom-in" onClick={() => setPreviewImage(activeMedia?.url || null)} />
                                )}
                            </div>
                            {details.images.length > 1 && (
                                <div className="od-thumbnails">
                                    {details.images.map((img, idx) => (
                                        <div key={img.id} className={`od-thumb-item ${idx === activeMediaIndex ? 'active' : ''}`} onClick={() => setActiveMediaIndex(idx)}>
                                            {/\.(mp4|webm|ogg|mov)$/i.test(img.url) ? (
                                                <div className="w-full h-full bg-black flex items-center justify-center relative">
                                                    <PlayCircle size={16} className="text-white opacity-50" />
                                                </div>
                                            ) : (
                                                <img src={img.url} alt="Thumb" className="od-thumb-img" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {previewImage && (
                        <div className="vd-lightbox" onClick={() => setPreviewImage(null)}>
                            <button className="vd-lightbox-close" onClick={() => setPreviewImage(null)}><X size={32} /></button>
                            {/\.(mp4|webm|ogg|mov)$/i.test(previewImage) ? (
                                <video src={previewImage} controls autoPlay className="vd-lightbox-img" onClick={e => e.stopPropagation()} />
                            ) : (
                                <img src={previewImage} alt="Full view" className="vd-lightbox-img" onClick={e => e.stopPropagation()} />
                            )}
                        </div>
                    )}
                </>
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={executeRemove}
                title="Remove Offer?"
                message="Are you sure you want to remove this offer? This action cannot be undone."
                confirmText="Yes, Remove"
                cancelText="Cancel"
                type="danger"
                isLoading={actionLoading}
            />
        </div>
    );
}
