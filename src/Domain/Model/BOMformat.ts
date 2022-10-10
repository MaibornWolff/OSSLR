// unfinished
export interface BOMformat {
    bomFormat?: string;
    specVersion?: string,
    serialNumber?: string,
    version?: number | string,
    metadata?: {
        timestamp?: string,
        tools?: { vendor: string, name: string, version: string }[]
        authors?: { name: string, email: string }[]
    }
    components:
        {
            group: string;
            name: string;
            version: string;
            description?: string;
            scope?: string;
            hashes?: { alg: string, content: string }[];
            licenses: { license: { id: string, name?: string, text?: string, url: string } }[];
            purl?: string;
            externalReferences: { type: string, url: string }[]
            type?: string;
            'bom-ref'?: string;
            copyright?: string;
            mime_type?: string;
            supplier?: { name: string, url: [string], contact: { name: string, email: string, phone: string } }
            author?: { name: string, email: string }
        }[];
    services?: {
        'bom-ref': string;
        provider: {
            name: string,
            url: string,
            contact: { name: string, email: string, phone: string }
        },
        group: string,
        name: string,
        version: string,
        description: string,
        endpoints: string,
        authenticated: boolean,
        'x-trust-boundary': boolean,
        data: {
            flow: string,
            classification: string
        },
        licenses: { license: { id: string, name?: string, text?: string, url: string } }[];

    }
    externalReferences?: [{ type: string, ulr: string, comment: string }]
}
