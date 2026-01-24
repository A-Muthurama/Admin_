// src/api/api.ts
// Central API file for Admin Panel → Backend communication

import axios from "axios";

/* ======================================================
   Shared Types (backend response shapes)
   ====================================================== */

export type BackendRole = "ADMIN" | "VENDOR_PENDING" | "VENDOR_APPROVED";
export type BackendOfferStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BackendMediaStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BackendVendorStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
}

export interface AdminVendorUser {
  id: string;
  email: string;
  role: BackendRole;
  createdAt?: string;
}

export interface AdminVendorProfile {
  id: string;
  externalVendorId: number | null;
  userId: string;
  shopName: string;
  ownerName: string;
  kycDocs: string;
  status: BackendVendorStatus;
  createdAt: string;
  user: AdminVendorUser;
}

export interface VendorKycResponse {
  shopName: string;
  ownerName: string;
  kycDocs: string;
  user: {
    email: string;
  };
}

export interface AdminOfferVendorInfo {
  shopName: string;
  ownerName: string;
  user: {
    email: string;
  };
}

export interface PendingAdminOffer {
  id: string;
  externalOfferId: number | null;
  title: string;
  description: string;
  price: number;
  storeLat: number;
  storeLng: number;
  status: BackendOfferStatus;
  isActive: boolean;
  createdAt: string;
  vendorId: string;
  vendor: AdminOfferVendorInfo;
}

export interface OfferImage {
  id: string;
  url: string;
  publicId: string;
  status: BackendMediaStatus;
  createdAt: string;
  offerId: string;
}

export interface AdminOfferDetails extends Omit<PendingAdminOffer, "vendor"> {
  vendor: AdminOfferVendorInfo;
  images: OfferImage[];
}

export interface MessageResponse {
  message: string;
}

/**
 * AXIOS INSTANCE
 * All admin API calls go through this instance
 */
const API = axios.create({
  baseURL: "https://project-j-64ia.onrender.com",
});

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches Admin JWT to every request
 */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ======================================================
   AUTH APIs
   ====================================================== */

/**
 * Admin Login
 * - Verifies admin credentials
 * - Returns JWT token
 */
export const adminLogin = (data: { email: string; password: string }) =>
  API.post<AdminLoginResponse>("/auth/admin/login", data);

/* ======================================================
   VENDOR MANAGEMENT APIs
   ====================================================== */

/**
 * Get all pending vendor applications
 * - Used in Admin → Pending Vendors screen
 */
export const getPendingVendors = () =>
  API.get<AdminVendorProfile[]>("/admin/vendors/pending");

/**
 * Get all vendors (all statuses)
 */
export const getAllVendors = () =>
  API.get<AdminVendorProfile[]>("/admin/vendors");

/**
 * Approve a vendor
 * - Changes vendor status to APPROVED
 * - Enables vendor login
 */
export const approveVendor = (userId: string) =>
  API.patch<MessageResponse>(`/admin/vendors/${userId}/approve`);

/**
 * Reject a vendor
 * - Marks vendor as REJECTED
 */
export const rejectVendor = (userId: string) =>
  API.patch<MessageResponse>(`/admin/vendors/${userId}/reject`);

/**
 * Get vendor KYC documents
 * - Used by admin to verify vendor identity
 */
export const getVendorKyc = (vendorId: string) =>
  API.get<VendorKycResponse>(`/admin/vendors/${vendorId}/kyc`);

/* ======================================================
   OFFER MANAGEMENT APIs
   ====================================================== */

/**
 * Get all pending offers
 * - Used in Admin → Pending Offers list
 */
export const getPendingOffers = () =>
  API.get<PendingAdminOffer[]>("/admin/offers/pending");

/**
 * Get full offer details
 * - Includes offer info, images, vendor info
 * - Used when admin clicks an offer
 */
export const getOfferDetails = (offerId: string) =>
  API.get<AdminOfferDetails>(`/admin/offers/${offerId}`);

/**
 * Approve an offer and its images
 * - Makes offer publicly visible
 */
export const approveOffer = (offerId: string) =>
  API.patch<MessageResponse>(`/admin/offers/${offerId}/approve`);

/**
 * Reject an offer and its images
 * - Keeps offer hidden from users
 */
export const rejectOffer = (offerId: string) =>
  API.patch<MessageResponse>(`/admin/offers/${offerId}/reject`);

/* ======================================================
   EXPORT AXIOS INSTANCE (optional)
   ====================================================== */

export default API;
