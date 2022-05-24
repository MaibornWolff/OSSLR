import { PackageInfo } from './packageInfo';
import { readFileSync } from 'fs';

type Format = 'json' | 'xml';

abstract class InputParser {
    format: Format;
    rawData: object;

    constructor(format: Format) {
        this.format = format;
    }

    readInput(url: string) {
        try {
            return readFileSync(url).toString();
        } catch (err) {
            console.error(`Couldn't load bom.json from ${url}.`);
        }
    }
    abstract parseInput(url: string): PackageInfo[];
}

class CycloneDXParser extends InputParser {
    constructor(format: Format) {
        super(format);
    }

    parseInput(data: string): PackageInfo[] {
        switch (super.format) {
            case 'json':
                return this.parseJSON(data);
        }
    }

    private parseJSON(data: string): PackageInfo[] {
        super.rawData = JSON.parse(data);
        let packageInfos = [];
        for (let pkg in super.rawData['components']) {
            packageInfos.push(new PackageInfo());
            let group = pkg['group'];
            let name = pkg['name'];
            let version = pkg['version'];
            let licenses = [];
            for (let license in pkg['licenses']) {
                licenses.push(license);
            }
            let extRefs = [];
            for (let extRef in pkg['externalReferences']) {
                extRefs.push(extRef['url']);
            }
        }
        return packageInfos;
    }
}