// Shared helpers for vendors and customers ("parties").

// The fields vendors and customers share; pages map them to their own API shape.
export interface PartyValues {
  name: string;
  gstin: string;
  tax_id: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  payment_term_id: number;
  credit_limit: string;
  active: boolean;
}

export const emptyParty: PartyValues = {
  name: '',
  gstin: '',
  tax_id: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  pincode: '',
  payment_term_id: 0,
  credit_limit: '',
  active: true,
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
  'Lakshadweep', 'Puducherry',
];

// 15-character GSTIN: 2-digit state, 10-char PAN, entity, 'Z', check digit.
export const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PINCODE_PATTERN = /^\d{6}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_PATTERN = /^[+\d][\d\s-]{6,}$/;

export function formatAddress(p: { address_line1?: string | null; address_line2?: string | null; city?: string | null; state?: string | null; pincode?: string | null }): string {
  const cityLine = [p.city, p.state].filter(Boolean).join(', ') + (p.pincode ? ` ${p.pincode}` : '');
  return [p.address_line1, p.address_line2, cityLine.trim()].filter(Boolean).join('\n');
}

export const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  PAID: { label: 'Paid', color: '#15936a' },
  PARTIALLY_PAID: { label: 'Part paid', color: '#c98500' },
  UNPAID: { label: 'Unpaid', color: '#d03b3b' },
};

export const paymentStatusInfo = (s: string) => PAYMENT_STATUS[s] ?? { label: s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' '), color: '#64748b' };

interface PartyRecord {
  gstin: string | null;
  tax_id: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  payment_term_id: number | null;
  credit_limit: string | null;
  status: string;
}

// Vendor/customer record -> form values.
export function toPartyValues(name: string, r: PartyRecord): PartyValues {
  return {
    name,
    gstin: r.gstin ?? '',
    tax_id: r.tax_id ?? '',
    address_line1: r.address_line1 ?? '',
    address_line2: r.address_line2 ?? '',
    city: r.city ?? '',
    state: r.state ?? '',
    pincode: r.pincode ?? '',
    payment_term_id: r.payment_term_id ?? 0,
    credit_limit: r.credit_limit ?? '',
    active: r.status !== 'INACTIVE',
  };
}

// Form values -> the fields both APIs accept (blank optional fields are left out, as before).
export function partyPayload(v: PartyValues) {
  const optional = {
    gstin: v.gstin.trim(),
    tax_id: v.tax_id.trim(),
    address_line1: v.address_line1.trim(),
    address_line2: v.address_line2.trim(),
    city: v.city.trim(),
    state: v.state.trim(),
    pincode: v.pincode.trim(),
  };
  return {
    ...Object.fromEntries(Object.entries(optional).filter(([, value]) => value)),
    ...(v.payment_term_id ? { payment_term_id: v.payment_term_id } : {}),
    ...(v.credit_limit !== '' ? { credit_limit: Number(v.credit_limit) } : {}),
    status: v.active ? 'ACTIVE' : 'INACTIVE',
  };
}
