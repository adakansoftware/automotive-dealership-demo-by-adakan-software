export interface InquiryFormValues {
  name: string
  phone: string
  email: string
  message: string
}

export interface InquiryFormState {
  status: 'idle' | 'success' | 'error' | 'rate-limited'
  errors: Partial<Record<keyof InquiryFormValues, string>>
  values: InquiryFormValues
}

const EMPTY_VALUES: InquiryFormValues = { name: '', phone: '', email: '', message: '' }

export const initialInquiryState: InquiryFormState = {
  status: 'idle',
  errors: {},
  values: EMPTY_VALUES,
}
