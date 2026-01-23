import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class VendorSyncService {
  private readonly logger = new Logger(VendorSyncService.name);
  private readonly vendorApi = process.env.VENDOR_BACKEND_URL;
  private readonly internalKey = process.env.INTERNAL_SYNC_KEY;

  async approveVendor(externalVendorId: number | null) {
    if (!externalVendorId) {
      this.logger.warn("Skipping vendor sync: externalVendorId is null");
      return;
    }

    await axios.patch(
      `${this.vendorApi}/internal/vendors/${externalVendorId}/approve`,
      {},
      { headers: { "x-internal-key": this.internalKey } }
    );
  }

  async rejectVendor(externalVendorId: number | null, reason?: string) {
    if (!externalVendorId) {
      this.logger.warn("Skipping vendor sync: externalVendorId is null");
      return;
    }

    await axios.patch(
      `${this.vendorApi}/internal/vendors/${externalVendorId}/reject`,
      { reason },
      { headers: { "x-internal-key": this.internalKey } }
    );
  }

  async approveOffer(externalOfferId: number | null) {
    if (!externalOfferId) {
      this.logger.warn("Skipping offer sync: externalOfferId is null");
      return;
    }

    await axios.patch(
      `${this.vendorApi}/internal/offers/${externalOfferId}/approve`,
      {},
      { headers: { "x-internal-key": this.internalKey } }
    );
  }

  async rejectOffer(externalOfferId: number | null, reason?: string) {
    if (!externalOfferId) {
      this.logger.warn("Skipping offer sync: externalOfferId is null");
      return;
    }

    await axios.patch(
      `${this.vendorApi}/internal/offers/${externalOfferId}/reject`,
      { reason },
      { headers: { "x-internal-key": this.internalKey } }
    );
  }
}
