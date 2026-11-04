const priceFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('tr-TR')

export function formatPrice(price: number): string {
  return priceFormatter.format(price)
}

export function formatMileage(mileage: number): string {
  return `${numberFormatter.format(mileage)} km`
}
