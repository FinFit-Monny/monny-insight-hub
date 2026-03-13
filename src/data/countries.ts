export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  enabled: boolean;
}

export const countries: Country[] = [
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '\u{1F1F3}\u{1F1F1}', enabled: true },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '\u{1F1E6}\u{1F1F9}', enabled: true },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '\u{1F1E7}\u{1F1EA}', enabled: true },
  { code: 'BG', name: 'Bulgaria', dialCode: '+359', flag: '\u{1F1E7}\u{1F1EC}', enabled: true },
  { code: 'HR', name: 'Croatia', dialCode: '+385', flag: '\u{1F1ED}\u{1F1F7}', enabled: true },
  { code: 'CY', name: 'Cyprus', dialCode: '+357', flag: '\u{1F1E8}\u{1F1FE}', enabled: true },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '\u{1F1E8}\u{1F1FF}', enabled: true },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '\u{1F1E9}\u{1F1F0}', enabled: true },
  { code: 'EE', name: 'Estonia', dialCode: '+372', flag: '\u{1F1EA}\u{1F1EA}', enabled: true },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '\u{1F1EB}\u{1F1EE}', enabled: true },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '\u{1F1EB}\u{1F1F7}', enabled: true },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '\u{1F1E9}\u{1F1EA}', enabled: true },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '\u{1F1EC}\u{1F1F7}', enabled: true },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '\u{1F1ED}\u{1F1FA}', enabled: true },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '\u{1F1EE}\u{1F1EA}', enabled: true },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '\u{1F1EE}\u{1F1F9}', enabled: true },
  { code: 'LV', name: 'Latvia', dialCode: '+371', flag: '\u{1F1F1}\u{1F1FB}', enabled: true },
  { code: 'LT', name: 'Lithuania', dialCode: '+370', flag: '\u{1F1F1}\u{1F1F9}', enabled: true },
  { code: 'LU', name: 'Luxembourg', dialCode: '+352', flag: '\u{1F1F1}\u{1F1FA}', enabled: true },
  { code: 'MT', name: 'Malta', dialCode: '+356', flag: '\u{1F1F2}\u{1F1F9}', enabled: true },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '\u{1F1F5}\u{1F1F1}', enabled: true },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '\u{1F1F5}\u{1F1F9}', enabled: true },
  { code: 'RO', name: 'Romania', dialCode: '+40', flag: '\u{1F1F7}\u{1F1F4}', enabled: true },
  { code: 'SK', name: 'Slovakia', dialCode: '+421', flag: '\u{1F1F8}\u{1F1F0}', enabled: true },
  { code: 'SI', name: 'Slovenia', dialCode: '+386', flag: '\u{1F1F8}\u{1F1EE}', enabled: true },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '\u{1F1EA}\u{1F1F8}', enabled: true },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '\u{1F1F8}\u{1F1EA}', enabled: true },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '\u{1F1E8}\u{1F1ED}', enabled: true },
  { code: 'UA', name: 'Ukraine', dialCode: '+380', flag: '\u{1F1FA}\u{1F1E6}', enabled: true },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '\u{1F1EC}\u{1F1E7}', enabled: true },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '\u{1F1FA}\u{1F1F8}', enabled: true },
];

export function getEnabledCountries(): Country[] {
  const nl = countries.find((c) => c.code === 'NL')!;
  const others = countries
    .filter((c) => c.enabled && c.code !== 'NL')
    .sort((a, b) => a.name.localeCompare(b.name));
  return [nl, ...others];
}

export const DEFAULT_COUNTRY = countries.find((c) => c.code === 'NL')!;
