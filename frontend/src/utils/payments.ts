export const DEPOSIT_PERCENT = 50
export const CANCEL_WINDOW_HOURS = 4

export function depositFor(totalAmount: number): number {
  return Math.round((totalAmount * DEPOSIT_PERCENT) / 100)
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`
}
