export interface User {
    id?: string;
    displayName: string;
    username: string;
    token: string;
    email: string;
    roles: string[];

    isPartner: boolean;
        isCasier: boolean;
        isAirportCasier: boolean;

    partnerApproved: boolean;
    companyLogoPath?: string;
    tradeLicensePath?: string;
    createDate?: string | null;
    rejectionReason: string | null;
    securityDepositPaymentType:string | null;
    securityDepositPaid:boolean;
    securityDepositAmount:string;

}

export interface UserIdAndName {
    id: string;
    displayName: string;
    email:string;
    password:string;
}


///