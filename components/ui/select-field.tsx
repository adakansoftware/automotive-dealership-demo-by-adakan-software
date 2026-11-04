'use client'

import { ChevronDown } from 'lucide-react'

export interface SelectFieldOption {
  value: string
  label: string
}

export function SelectField({ label, value, onChange, options, placeholder = 'Tümü' }: { label: string; value: string; onChange: (v: string) => void; options: SelectFieldOption[]; placeholder?: string }) { return <label className="filter-field"><span>{label}</span><div><select value={value} onChange={(e) => onChange(e.target.value)}><option value="">{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={15}/></div></label> }
