export type ClientLicenseStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'INVALID' | 'UNLICENSED' | 'GRACE_PERIOD';

export interface IClientFeatureMap {
  posEnabled: boolean;
  invoicingEnabled: boolean;
  onlineStoreEnabled: boolean;
  inventoryManagement: boolean;
  pnlReporting: boolean;
  multiBranch: boolean;
  maxProducts: number;
  maxOrdersPerMonth: number;
}

export interface IClientLicenseState {
  isActivated: boolean;
  isValid: boolean;
  isLocked: boolean;
  isGracePeriod?: boolean;
  serverOnline?: boolean;
  status: ClientLicenseStatus;
  licenseKey: string;
  businessName: string;
  domain: string;
  planName: string;
  billingCycle: string;
  validUntil?: string;
  issuedAt?: string;
  daysRemaining: number;
  lastPingAt?: string;
  token?: string;
  message?: string;
  supportPhone?: string;
  supportEmail?: string;
}
