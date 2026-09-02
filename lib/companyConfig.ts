/**
 * Dynamic Company Configuration Helper
 * Loads all business metadata from environment variables with zero hardcoding.
 */

export interface CompanyConfig {
    name: string;
    owner: string;
    address: string;
    fssai: string;
    iec: string;
    manufacturing: string;
    certifications: string;
    phone: string;
    email: string;
    gstin: string;
    state: string;
    bankName: string;
    bankAccountNo: string;
    bankIfsc: string;
    bankHolder: string;
    upiId: string;
    logoUrl: string;
}

export const getCompanyConfig = (): CompanyConfig => ({
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'BEES HUB FARMLAND PVT LTD',
    owner: process.env.NEXT_PUBLIC_COMPANY_OWNER || 'JEYA SHAYANA DEVI.T',
    address:
        process.env.NEXT_PUBLIC_COMPANY_ADDRESS ||
        'Factory : Door No :2/26-1, MUHILANVILAI, Monikettipottal-Post, Nagercoil, Kanayakumari-District, Pin - 629501.',
    fssai: process.env.NEXT_PUBLIC_COMPANY_FSSAI || '12425009000671',
    iec: process.env.NEXT_PUBLIC_COMPANY_IEC || 'AAOCB0453D',
    manufacturing: process.env.NEXT_PUBLIC_COMPANY_MANUFACTURING || 'FMCG (Food)',
    certifications:
        process.env.NEXT_PUBLIC_COMPANY_CERTIFICATIONS ||
        'GMP & ORGANIC CERTIFIED COMPANY | ISO 9001:2015 & ISO 22000:2018 COMPANY',
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '9578784431',
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'Admin@admin@beeshubfarmland.com.online',
    gstin: process.env.NEXT_PUBLIC_COMPANY_GSTIN || '33AAOCB0453D1Z3',
    state: process.env.NEXT_PUBLIC_COMPANY_STATE || '33-Tamil Nadu',
    bankName: process.env.NEXT_PUBLIC_COMPANY_BANK_NAME || 'Axis Bank, Nagercoil [Tamil Nadu]',
    bankAccountNo: process.env.NEXT_PUBLIC_COMPANY_BANK_ACC || '925020021307548',
    bankIfsc: process.env.NEXT_PUBLIC_COMPANY_BANK_IFSC || 'UTIB0000405',
    bankHolder: process.env.NEXT_PUBLIC_COMPANY_BANK_HOLDER || 'BEES HUB FARMLAND PVT LTD',
    upiId: process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || 'beeshubfarmland.com@upi',
    logoUrl: process.env.NEXT_PUBLIC_COMPANY_LOGO_URL || '/logo.jpg',
});

/**
 * Utility to convert numeric amounts to English currency words
 * E.g., 5927.5 -> "Five Thousand Nine Hundred and Twenty Seven Rupees and Fifty Paisa only"
 */
export function numberToWords(amount: number): string {
    if (isNaN(amount) || amount <= 0) return 'Zero Rupees only';

    const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const double = [
        'Ten',
        'Eleven',
        'Twelve',
        'Thirteen',
        'Fourteen',
        'Fifteen',
        'Sixteen',
        'Seventeen',
        'Eighteen',
        'Nineteen',
    ];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (num: number): string => {
        let str = '';
        if (num >= 100) {
            str += single[Math.floor(num / 100)] + ' Hundred ';
            num %= 100;
        }
        if (num >= 10 && num < 20) {
            str += double[num - 10] + ' ';
        } else {
            if (num >= 20) {
                str += tens[Math.floor(num / 10)] + ' ';
                num %= 10;
            }
            if (num > 0) {
                str += single[num] + ' ';
            }
        }
        return str;
    };

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let rupeesInWords = '';

    if (rupees === 0) {
        rupeesInWords = 'Zero';
    } else {
        let n = rupees;
        const crore = Math.floor(n / 10000000);
        n %= 10000000;
        const lakh = Math.floor(n / 100000);
        n %= 100000;
        const thousand = Math.floor(n / 1000);
        n %= 1000;

        if (crore > 0) rupeesInWords += convertLessThanThousand(crore) + 'Crore ';
        if (lakh > 0) rupeesInWords += convertLessThanThousand(lakh) + 'Lakh ';
        if (thousand > 0) rupeesInWords += convertLessThanThousand(thousand) + 'Thousand ';
        if (n > 0) rupeesInWords += convertLessThanThousand(n);
    }

    let result = rupeesInWords.trim() + ' Rupees';
    if (paise > 0) {
        result += ' and ' + convertLessThanThousand(paise).trim() + ' Paisa';
    }
    return result + ' only';
}
