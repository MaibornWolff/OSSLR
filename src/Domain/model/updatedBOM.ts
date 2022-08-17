import { License } from "./License"
// check if exists importable version from cdx or something else use this

export interface BOMFile {
    
  bomFormat: string,
  specVersion: string,
  serialNumber: string,
  version: number,
  metadata: {
    timestamp: string,
    tools: [any],
    authors: [any]
  },
  components : [{
    group: string,
    name: string,
    version: string,
    description: string,
    scope: string,
    licenses: [License],
    purl: string,
    type: string,
    bom_ref: string,
    copyright: string
  }]
    

}