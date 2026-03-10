import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, CheckCircle, XCircle, Mail, ExternalLink, Users, Maximize2, X, MapPin, Phone, Shield, FileText } from "lucide-react";
import { VendorKycResponse, approveVendor, getVendorKyc, rejectVendor, suspendVendor } from "../../api/api";
import API from "../../api/api";
import "../../styles/vendor-details.css";
import { toast } from "sonner";
import { ConfirmationModal } from "../common/ConfirmationModal";

/** Fetches a PDF via authenticated Axios and returns a local blob URL */
function usePdfBlobUrl(url: string | null) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const prevUrl = useRef<string | null>(null);

    useEffect(() => {
        if (!url) { setBlobUrl(null); return; }
        if (prevUrl.current === url && blobUrl) return;
        setLoading(true);
        API.get(url, { responseType: 'blob', baseURL: '' })
            .then((res: { data: BlobPart }) => {
                const blob = new Blob([res.data], { type: 'application/pdf' });
                const objUrl = URL.createObjectURL(blob);
                setBlobUrl(objUrl);
                prevUrl.current = url;
            })
            .catch(() => setBlobUrl(url)) // fallback: try direct URL
            .finally(() => setLoading(false));
        return () => {
            if (blobUrl && blobUrl.startsWith('blob:')) URL.revokeObjectURL(blobUrl);
        };
    }, [url]);

    return { blobUrl, loading };
}

/** Renders a PDF inside an iframe using an authenticated blob URL */
function PdfViewer({ url, className, style }: { url: string; className?: string; style?: React.CSSProperties }) {
    const { blobUrl, loading } = usePdfBlobUrl(url);
    if (loading) return (
        <div className="vd-pdf-loading">
            <Shield size={32} className="vd-pdf-spin-icon" />
            <span>Loading PDF...</span>
        </div>
    );
    if (!blobUrl) return null;
    return <iframe src={blobUrl} className={className} style={style} title="PDF Document" />;
}


interface VendorDetailsPageProps {
    vendorId: string;
    onBack: () => void;
    onStatusChange: () => void;
}

interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
}

export function VendorDetailsPage({ vendorId, onBack, onStatusChange }: VendorDetailsPageProps) {
    const [kycDetails, setKycDetails] = useState<VendorKycResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<{ url: string, type: string } | null>(null);
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        type: 'info',
        onConfirm: () => { }
    });

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

    const executeApprove = async () => {
        setConfirmModal((prev: ConfirmModalState) => ({ ...prev, isOpen: false }));
        setActionLoading(true);
        try {
            await approveVendor(vendorId);
            onStatusChange();
            await fetchDetails();
            toast.success(kycDetails?.status === 'SUSPENDED' ? "Vendor reactivated successfully." : "Vendor approved successfully.");
        } catch (err: any) {
            console.error("Failed to approve vendor", err);
            const msg = err.response?.data?.message || err.message || "Unknown error";
            toast.error(`Action Failed: ${msg}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = () => {
        setConfirmModal({
            isOpen: true,
            title: kycDetails?.status === 'SUSPENDED' ? 'Reactivate Vendor?' : 'Approve Vendor?',
            message: kycDetails?.status === 'SUSPENDED'
                ? `Are you sure you want to reactivate ${kycDetails.shopName}? They will regain full access to the platform.`
                : `Are you sure you want to approve ${kycDetails?.shopName}? This will grant them access to start posting offers.`,
            confirmText: kycDetails?.status === 'SUSPENDED' ? 'Yes, Reactivate' : 'Yes, Approve',
            type: 'info',
            onConfirm: executeApprove
        });
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) return;
        setActionLoading(true);
        try {
            await rejectVendor(vendorId, rejectionReason);
            setIsRejecting(false);
            onStatusChange();
            await fetchDetails();
            toast.success("Vendor rejected successfully.");
        } catch (err: any) {
            console.error("Failed to reject vendor", err);
            const msg = err.response?.data?.message || err.message || "Unknown error";
            toast.error(`Rejection Failed: ${msg}`);
        } finally {
            setActionLoading(false);
        }
    };

    const executeSuspend = async () => {
        setConfirmModal((prev: ConfirmModalState) => ({ ...prev, isOpen: false }));
        setActionLoading(true);
        try {
            await suspendVendor(vendorId);
            onStatusChange();
            await fetchDetails();
            toast.success("Vendor suspended successfully.");
        } catch (err: any) {
            toast.error("Failed to suspend vendor.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSuspend = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Suspend Vendor?',
            message: `Are you sure you want to suspend ${kycDetails?.shopName}? They will be temporarily restricted from accessing the platform and their offers will be hidden.`,
            confirmText: 'Yes, Suspend Vendor',
            type: 'danger',
            onConfirm: executeSuspend
        });
    };



    if (isLoading) return <div className="py-20 text-center text-gray-500">Loading vendor details...</div>;
    if (error || !kycDetails) return <div className="py-20 text-center text-red-500">{error || "Vendor not found"}</div>;

    const isPending = kycDetails.status === 'PENDING';
    const isApproved = kycDetails.status === 'APPROVED';
    const isSuspended = kycDetails.status === 'SUSPENDED';

    return (
        <div className="vd-container">
            <div className="vd-back-nav">
                <button onClick={onBack} className="vd-back-btn-new">
                    <ArrowLeft size={18} />
                    <span>Back to Vendors</span>
                </button>
            </div>

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
                        kycDetails.status === 'PENDING' ? 'vd-status-pending' :
                            kycDetails.status === 'SUSPENDED' ? 'vd-status-suspended' : 'vd-status-rejected'
                        } `}>
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
                            {doc.url?.toLowerCase().match(/\.pdf($|\?|#)/i) ? (
                                <div className="vd-doc-pdf-placeholder">
                                    <FileText size={48} className="vd-pdf-icon" />
                                    <span className="vd-pdf-text">PDF Document</span>
                                    <span className="vd-pdf-subtext">Click to view</span>
                                </div>
                            ) : (
                                <img src={doc.url} alt={doc.type} className="vd-doc-img" />
                            )}
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

            {(isApproved || isSuspended) && (
                <div className="vd-action-panel" style={{
                    marginTop: '20px',
                    borderColor: isSuspended ? '#4f1b3bff' : '#d1d5db',
                    background: isSuspended ? '#4f1b3bff' : '#f9fafb'
                }}>
                    <div className="vd-action-header">
                        <div className="vd-action-icon-circle" style={{
                            background: isSuspended ? '#dcfce7' : '#f3f4f6',
                            color: isSuspended ? '#16a34a' : '#374151'
                        }}>
                            {isSuspended ? <CheckCircle size={24} /> : <Shield size={24} />}
                        </div>
                        <div>
                            <h3 className="vd-action-title" style={{ color: isSuspended ? '#16a34a' : '#374151' }}>
                                {isSuspended ? 'Reactivate Vendor' : 'Vendor Status Control'}
                            </h3>
                            <p className="vd-action-desc" style={{ color: isSuspended ? '#15803d' : '#4b5563' }}>
                                {isSuspended
                                    ? 'This vendor is currently suspended. You can reactivate them to restore their access.'
                                    : 'You can temporarily suspend this vendor to restrict their access to the platform.'}
                            </p>
                        </div>
                    </div>
                    <div className="vd-btn-group">
                        {isSuspended ? (
                            <button
                                onClick={handleApprove}
                                disabled={actionLoading}
                                className="vd-btn vd-btn-approve"
                            >
                                <CheckCircle size={18} /> Reactivate Vendor
                            </button>
                        ) : (
                            <button
                                onClick={handleSuspend}
                                disabled={actionLoading}
                                className="vd-btn vd-btn-secondary"
                            >
                                <XCircle size={18} /> Suspend Vendor
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {previewImage && (
                <div className="vd-lightbox" onClick={() => setPreviewImage(null)}>
                    <button className="vd-lightbox-close" onClick={() => setPreviewImage(null)}>
                        <X size={32} />
                    </button>
                    {previewImage.url?.toLowerCase().match(/\.pdf($|\?|#)/i) ? (
                        <div className="vd-lightbox-pdf-container" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                            <PdfViewer url={previewImage.url} className="vd-lightbox-iframe" />
                            <a
                                href={previewImage.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="vd-pdf-fallback-link"
                            >
                                Open PDF in new tab
                            </a>
                        </div>
                    ) : (
                        <img src={previewImage.url} alt="Full view" className="vd-lightbox-img" onClick={e => e.stopPropagation()} />
                    )}
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal((prev: ConfirmModalState) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                type={confirmModal.type}
                isLoading={actionLoading}
            />
        </div>
    );
}
