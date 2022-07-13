import { appendFileSync } from "fs";
import path = require('path');
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PackageInfo } from '../../Domain/model/packageInfo';
import { Exporter } from './exporter';

export class PDFExporter implements Exporter {
    export(packageInfos: PackageInfo[]): void {
        var doc = new jsPDF();
        var col = ["Group", "Name", "Version", "License", "Copyright"];
        var rows = [];

        var groupPdf: string;
        var namePdf: string;
        var versionPdf: string;
        var licensePdf: string;
        var copyrightPdf: string;

        packageInfos.forEach(packageInfo => {
            if (packageInfo.group !== '') {
                groupPdf = packageInfo.group;
            } else {
                groupPdf = "no group";
            }

            if (packageInfo.name !== '') {
                namePdf = packageInfo.name;
            } else {
                namePdf = "no name";
            }

            if (packageInfo.version !== '') {
                versionPdf = packageInfo.version;
            } else {
                versionPdf = "no version";
            }

            licensePdf = this.extractLicense(packageInfo);

            if (packageInfo.copyright !== '') {
                copyrightPdf = packageInfo.copyright;
            } else {
                copyrightPdf = "no copyright";
            }

            rows.push([groupPdf, namePdf, versionPdf, licensePdf, copyrightPdf]);
        })

        autoTable(doc, {
            theme: "grid",
            head: [col],
            body: rows
        })

        const rawOutput = doc.output("arraybuffer");
        appendFileSync(path.join('out', 'updatedBom.pdf'), Buffer.from(rawOutput));
    }

    extractLicense(packageInfo: PackageInfo) {
        if (packageInfo.licenses.length > 0) {
            if (packageInfo.licenses[0]['license']['id']) {
                return packageInfo.licenses[0]['license']['id'];
            } else if (packageInfo.licenses[0]['license']['name']) {
                return packageInfo.licenses[0]['license']['name'];
            } else {
                return "no license";
            }
        } else {
            return "no license";
        }
    }
}