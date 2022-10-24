export type Nullable<SPDXLicenseDetails> = SPDXLicenseDetails | null;

export interface SPDXLicenseDetails {
    'isDeprecatedLicenseId': boolean,
    'licenseText': string,
    'standardLicenseTemplate': string,
    'name': string,
    'licenseId': string,
    'crossRef': [
        {
            'match': string,
            'url': string,
            'isValid': boolean,
            'isLive': boolean,
            'timestamp': string,
            'isWayBackLink': boolean,
            'order': number
        }
    ],
    'seeAlso': string[],
    'isOsiApproved': boolean,
    'licenseTextHtml': string
}