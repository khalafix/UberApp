
export interface NationalityData {
    id: string;
    name: string;
    singlePriceWithMonth: string;
    singlePriceWithTwoMonth?: string;
    singlePriceWithTwoMonthForChild?: string;
    multiplePriceWithMonth?: string;
    multiplePriceWithMonthForChild?: string;
    multiplePriceWithTwoMonth?: string;
    multiplePriceWithTwoMonthForChild?: string; 
    securityDeposit?: string; 
}