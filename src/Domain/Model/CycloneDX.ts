/**
 * Partial definition of the CycloneDx format
 */
export interface CycloneDX {
    bomFormat: string;
    specVersion: string,
    serialNumber?: string,
    version: number,
    metadata?: {
        timestamp?: string,
        tools?: { vendor: string, name: string, version: string }[]
        authors?: [{ name: string, email: string }]
        component?: {
            type: string,
            mime_type: string,
            bom_ref: string,
            supplier: {
                name: string,
                url: string,
                contact: { name: string, email: string, phone: string }[]
            }
        }
    }
    components?:
        {
            group?: string;
            name?: string;
            version?: string;
            description?: string;
            scope?: string;
            hashes?: { alg: string, content: string }[];
            licenses?: { license?: { id: string, name?: string, text?: string, url: string } }[];
            purl?: string;
            externalReferences?: { type: string, url: string }[]
            type?: string;
            'bom-ref'?: string;
            copyright?: string;
            mime_type?: string;
            supplier?: { name: string, url: [string], contact: { name: string, email: string, phone: string } }
            author?: { name: string, email: string }
        }[],
}