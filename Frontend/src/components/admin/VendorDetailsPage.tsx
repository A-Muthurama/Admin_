import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Mail, Calendar, Shield, ExternalLink, Users, Briefcase, Maximize2, X, MapPin, Phone } from "lucide-react";
import { VendorKycResponse, approveVendor, getVendorKyc, rejectVendor } from "../../api/api";
import "../../styles/vendor-details.css"; // Import the new CSS

interface VendorDetailsPageProps {
    vendorId: string;
    onBack: () => void;
    onStatusChange: () => void;
}

export function VendorDetailsPage({ vendorId, onBack, onStatusChange }: VendorDetailsPageProps) {
    const [kycDetails, setKycDetails] = useState<VendorKycResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ url: string, type: string } | null>(null);

    const fetchDetails = async () => {
        setIsLoading(true);
        try {
            const kycRes = await getVendorKyc(vendorId);
            setKycDetails(kycRes.data);
        } catch (err) {
            setError("Failed to load vendor details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [vendorId]);

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await approveVendor(vendorId);
            onStatusChange();
            await fetchDetails();
        } catch {
            alert("Failed to approve vendor.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) return;
        setActionLoading(true);
        try {
            await rejectVendor(vendorId, rejectionReason);
            setIsRejecting(false);
            onStatusChange();
            await fetchDetails();
        } catch {
            alert("Failed to reject vendor.");
        } finally {
            setActionLoading(false);
        }
    };

    if (isLoading) return <div className="py-20 text-center text-gray-500">Loading vendor details...</div>;
    if (error || !kycDetails) return <div className="py-20 text-center text-red-500">{error || "Vendor not found"}</div>;

    const isPending = kycDetails.status === 'PENDING';

    return (
        <div className="vd-container">
            <button onClick={onBack} className="vd-back-btn">
                <ArrowLeft size={16} /> Back to Vendors
            </button>

            {/* Header */}
            <div className="vd-header-card">
                <div>
                    <h1 className="vd-shop-title">{kycDetails.shopName}</h1>
                    <div className="vd-meta-info">
                        <span className="vd-meta-item"><Users size={16} className="vd-meta-icon" /> {kycDetails.ownerName}</span>
                        <span className="vd-meta-divider"></span>
                        <span className="vd-meta-item"><Mail size={16} className="vd-meta-icon" /> {kycDetails.user.email}</span>
                        {(kycDetails.phone || kycDetails.city) && (
                            <>
                                <span className="vd-meta-divider"></span>
                                {kycDetails.phone && (
                                    <span className="vd-meta-item">
                                        <Phone size={16} className="vd-meta-icon" /> {kycDetails.phone}
                                    </span>
                                )}
                                {kycDetails.city && (
                                    <span className="vd-meta-item">
                                        <MapPin size={16} className="vd-meta-icon" /> {kycDetails.city}, {kycDetails.state}
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="vd-status-wrapper">
                    <span className={`vd-status-badge ${kycDetails.status === 'APPROVED' ? 'vd-status-approved' :
                        kycDetails.status === 'PENDING' ? 'vd-status-pending' : 'vd-status-rejected'
                        }`}>
                        {kycDetails.status}
                    </span>
                    <div className="vd-id-tag">ID: {vendorId ? vendorId.slice(0, 8) : 'N/A'}</div>
                </div>
            </div>

            {/* Documents Grid */}
            <div className="vd-section-header">
                <Shield className="vd-section-icon" size={20} />
                <h3 className="vd-section-title">KYC Documents</h3>
            </div>

            <div className="vd-doc-grid">
                {kycDetails.kycDocs.map((doc, idx) => (
                    <div key={idx} className="vd-doc-card" onClick={() => setPreviewImage({ url: doc.url, type: doc.type })}>
                        <div className="vd-doc-preview">
                            <img src={doc.url} alt={doc.type} className="vd-doc-img" />
                            <div className="vd-doc-overlay">
                                <Maximize2 className="vd-doc-zoom-icon" size={24} />
                            </div>
                        </div>
                        <div className="vd-doc-info">
                            <span className="vd-doc-name">{doc.type.replace(/_/g, ' ')}</span>
                            <ExternalLink size={14} className="vd-doc-action-icon" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Area */}
            {isPending && (
                <div className="vd-action-panel">
                    <div className="vd-action-header">
                        <div className="vd-action-icon-circle">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="vd-action-title">Review Application</h3>
                            <p className="vd-action-desc">Please verify all KYC documents and details before taking action. This action cannot be undone.</p>
                        </div>
                    </div>


                    {!isRejecting ? (
                        <div className="vd-btn-group">
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className="vd-btn vd-btn-approve"
                            >
                                <CheckCircle size={18} /> Approve Vendor
                            </button>
                            <button
                                onClick={() => setIsRejecting(true)}
                                disabled={actionLoading}
                                className="vd-btn vd-btn-reject"
                            >
                                <XCircle size={18} /> Reject Application
                            </button>
                        </div>
                    ) : (
                        <div className="vd-rejection-form">
                            <h4 className="vd-action-title" style={{ fontSize: '15px', marginBottom: '12px' }}>Reason for Rejection</h4>
                            <textarea
                                className="vd-textarea"
                                rows={3}
                                placeholder="Please provide a detailed reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <div className="flex gap-4 justify-end">
                                <button
                                    onClick={() => setIsRejecting(false)}
                                    className="vd-btn vd-btn-cancel"
                                    style={{ minWidth: 'auto' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                    className="vd-btn vd-btn-confirm-reject"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Lightbox */}
            {previewImage && (
                <div className="vd-lightbox" onClick={() => setPreviewImage(null)}>
                    <button className="vd-lightbox-close" onClick={() => setPreviewImage(null)}>
                        <X size={32} />
                    </button>
                    <img src={previewImage.url} alt="Full view" className="vd-lightbox-img" onClick={e => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}
