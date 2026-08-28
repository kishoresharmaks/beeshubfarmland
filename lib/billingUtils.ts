export function generateDocPrefix(docType: string): string {
  switch (docType) {
    case 'SALE_INVOICE':
      return 'BH-INV';
    case 'QUOTATION':
      return 'BH-EST';
    case 'PROFORMA':
      return 'BH-PRO';
    case 'SALE_ORDER':
      return 'BH-SO';
    case 'SALE_RETURN':
      return 'BH-CRN';
    case 'PURCHASE_BILL':
      return 'BH-PB';
    case 'PURCHASE_ORDER':
      return 'BH-PO';
    case 'PURCHASE_RETURN':
      return 'BH-DRN';
    case 'EXPENSE':
      return 'BH-EXP';
    default:
      return 'BH-DOC';
  }
}

export function formatDocNumber(prefix: string, count: number): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(count + 1).padStart(4, '0');
  return `${prefix}-${dateStr}-${seq}`;
}
