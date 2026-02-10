// src/api/api.ts
// Central API file for Admin Panel → Backend communication

import axios from "axios";

declare global {
  interface ImportMetaEnv {
    readonly VITE_ADMIN_API_BASE_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

/* ======================================================
   Shared Types (backend response shapes)
   ====================================================== */

export type BackendRole = "ADMIN" | "VENDOR_PENDING" | "VENDOR_APPROVED";
export type BackendOfferStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BackendMediaStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BackendVendorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type BackendPlanStatus = "ACTIVE" | "INACTIVE";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  posts: number;
  months: number;
}

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
  phone: string;  // Added phone
  city: string;   // Added city
  state: string;  // Added state
  kycDocs: string[];
  status: BackendVendorStatus;
  createdAt: string;
  user: AdminVendorUser;
}

export interface VendorKycDoc {
  type: string;
  url: string;
}

export interface VendorKycResponse {
  shopName: string;
  ownerName: string;
  status: string;
  phone: string; // Added phone
  city: string;  // Added city
  state: string; // Added state
  address: string; // Added address
  pincode: string; // Added pincode
  kycDocs: VendorKycDoc[];
  user: {
    email: string;
  };
}

export interface AdminOfferVendorInfo {
  shopName: string;
  ownerName: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
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
  poster_url?: string;

  // Database Fields (from screenshot)
  category?: string;
  discount_type?: string;     // e.g. "Flat Discount"
  discount_label?: string;    // e.g. "50% OFF"
  start_date?: string;
  end_date?: string;
  shop_address?: string;
  map_link?: string;
  buy_link?: string; // Adding for future/completeness if requested

  // Keep these for backward/camelCase compatibility if backend converts them
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
  area?: string;
  city?: string;

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

export interface ForgotPasswordRequestResponse {
  message: string;
  cooldownSeconds?: number;
}

export interface ForgotPasswordVerifyResponse {
  reset_token: string;
}

/**
 * AXIOS INSTANCE
 * All admin API calls go through this instance
 */
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_ADMIN_API_BASE_URL ||
    "https://admin-api.jewellersparadise.com",
});

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches Admin JWT to every request
 */
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("adminToken");
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

/**
 * Admin Forgot Password - Request OTP
 */
export const adminForgotPasswordRequest = (data: { email: string }) =>
  API.post<ForgotPasswordRequestResponse>(
    "/auth/admin/forgot-password/request",
    data,
  );

/**
 * Admin Forgot Password - Verify OTP
 * Returns a short-lived reset token
 */
export const adminForgotPasswordVerify = (data: {
  email: string;
  otp: string;
}) =>
  API.post<ForgotPasswordVerifyResponse>(
    "/auth/admin/forgot-password/verify",
    data,
  );

/**
 * Admin Forgot Password - Reset Password
 */
export const adminForgotPasswordReset = (data: {
  reset_token: string;
  password: string;
}) => API.post<MessageResponse>("/auth/admin/forgot-password/reset", data);

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
export const rejectVendor = (userId: string, reason: string) =>
  API.patch<MessageResponse>(`/admin/vendors/${userId}/reject`, { reason });

/**
 * Suspend a vendor
 */
export const suspendVendor = (userId: string) =>
  API.patch<MessageResponse>(`/admin/vendors/${userId}/suspend`);

/**
 * Get vendor KYC documents
 * - Used by admin to verify vendor identity
 */
export const getVendorKyc = (vendorId: string) =>
  API.get<VendorKycResponse>(`/admin/vendors/${vendorId}/kyc`);

/**
 * Vendor Application form
 */
export const vendorApply = (data: {
  email: string;
  password?: string;
  shopName: string;
  ownerName?: string;
}) => API.post<MessageResponse>("/vendor/apply", data);

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
 * Get all offers (all statuses)
 */
export const getAllOffers = () =>
  API.get<PendingAdminOffer[]>("/admin/offers");

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
export const rejectOffer = (offerId: string, reason: string) =>
  API.patch<MessageResponse>(`/admin/offers/${offerId}/reject`, { reason });

/* ======================================================
   PLAN MANAGEMENT APIs
   ====================================================== */

/**
 * Get all subscription plans
 */
export const getAllPlans = () =>
  API.get<{ success: boolean; data: SubscriptionPlan[] }>("/plans");

/**
 * Create a new plan
 */
export const createPlan = (data: Omit<SubscriptionPlan, "id">) =>
  API.post<{ success: boolean; data: SubscriptionPlan }>("/plans", data);

/**
 * Update an existing plan
 */
export const updatePlan = (id: string, data: Partial<SubscriptionPlan>) =>
  API.patch<{ success: boolean; data: SubscriptionPlan }>(`/plans/${id}`, data);

/**
 * Delete a plan
 */
export const deletePlan = (id: string) =>
  API.delete<{ success: boolean }>(`/plans/${id}`);

/**
 * Delete a vendor
 */
export const deleteVendor = (userId: string) =>
  API.delete<MessageResponse>(`/admin/vendors/${userId}`);

/**
 * Delete an offer
 */
export const deleteOffer = (offerId: string) =>
  API.delete<MessageResponse>(`/admin/offers/${offerId}`);

/* ======================================================
   EXPORT AXIOS INSTANCE (optional)
   ====================================================== */

export default API;
