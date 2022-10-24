export type Nullable<SPDXLicenses> = SPDXLicenses | null;

export interface SPDXLicenses {
    licenseListVersion: string,
    licenses: [
        {
            reference: string,
            isDeprecatedLicenseId: boolean,
            detailsUrl: string,
            referenceNumber: number,
            name: string,
            licenseId: string,
            seeAlso: string[],
            isOsiApproved: boolean
        }
    ]
}