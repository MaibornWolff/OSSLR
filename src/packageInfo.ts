class PackageInfo{

    group: string;
    name: string;
    version: string;
    licenses: object[];
    externalReferences: object[];

    constructor(group: string, name: string, version: string, licenses: object[], externalReferences: object[]){
        this.group = group;
        this.name = name;
        this.version = version;
        this.licenses = licenses;
        this.externalReferences = externalReferences;
    }
}