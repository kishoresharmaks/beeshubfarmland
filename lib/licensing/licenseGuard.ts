import { computeClientLicenseState, getConfiguredLicenseKey } from './licenseClient';
import { IClientLicenseState } from './licenseTypes';

/**
 * Server-side helper to assert that the license is valid and not locked
 */
export function getActiveLicenseStatus(): IClientLicenseState {
  const licenseKey = getConfiguredLicenseKey();
  
  // You can customize default development/local validity here
  return computeClientLicenseState({
    licenseKey,
    businessName: 'BeesHub Farmland',
    planName: 'Pro POS & E-Commerce Subscription',
    billingCycle: 'YEARLY',
  });
}

/**
 * Middleware check helper
 */
export function isAccessPermitted(licenseState: IClientLicenseState): boolean {
  return !licenseState.isLocked;
}
