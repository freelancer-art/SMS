import { Society, EnabledModules } from '../types';

export const DEFAULT_ENABLED_MODULES: EnabledModules = {
  gatekeeper: true,
  billing: true,
  helpdesk: true,
  voting: false,
  facility_booking: false,
  water_meters: true,
  tenants: true,
  document_vault: true
};

/**
 * Checks whether a specific module is enabled for the active society based on tenant discretion.
 */
export function isModuleEnabled(
  moduleKey: keyof EnabledModules,
  society?: Society | null
): boolean {
  if (!society) return true;

  // Check new tenant discretion EnabledModules
  if (society.EnabledModules && typeof society.EnabledModules[moduleKey] === 'boolean') {
    return society.EnabledModules[moduleKey];
  }

  // Fallback to legacy FeaturesEnabled mapping if available
  if (society.FeaturesEnabled) {
    if (moduleKey === 'gatekeeper') return society.FeaturesEnabled.gatekeeper;
    if (moduleKey === 'water_meters') return society.FeaturesEnabled.waterMeters;
    if (moduleKey === 'tenants') return society.FeaturesEnabled.tenantRegister;
    if (moduleKey === 'facility_booking') return society.FeaturesEnabled.amenities;
    if (moduleKey === 'document_vault') return society.FeaturesEnabled.documentVault;
  }

  // Default module enablement state
  return DEFAULT_ENABLED_MODULES[moduleKey] ?? true;
}

/**
 * Custom React Hook for module enablement checks inside components.
 */
export function useFeatureToggle(society?: Society | null) {
  const getEnabledModules = (): EnabledModules => {
    if (!society || !society.EnabledModules) {
      return DEFAULT_ENABLED_MODULES;
    }
    return {
      ...DEFAULT_ENABLED_MODULES,
      ...society.EnabledModules
    };
  };

  const isEnabled = (moduleKey: keyof EnabledModules): boolean => {
    return isModuleEnabled(moduleKey, society);
  };

  return {
    isModuleEnabled: isEnabled,
    enabledModules: getEnabledModules()
  };
}
