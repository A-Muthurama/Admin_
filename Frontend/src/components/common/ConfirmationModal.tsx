import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import '../../styles/modal.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = 'danger',
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="pj-modal-overlay" onClick={onClose}>
            <div className="pj-modal-container animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="pj-modal-header">
                    <div className={`pj-modal-icon-circle ${type}`}>
                        <AlertTriangle size={24} />
                    </div>
                    <button className="pj-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="pj-modal-content">
                    <h3 className="pj-modal-title">{title}</h3>
                    <p className="pj-modal-message">{message}</p>
                </div>

                <div className="pj-modal-footer">
                    <button
                        className="pj-modal-btn-cancel"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`pj-modal-btn-confirm ${type}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
