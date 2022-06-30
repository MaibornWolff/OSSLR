import { appendFileSync } from "fs";
import path = require('path');
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PackageInfo } from '../model/packageInfo';
import { Exporter } from './exporter';

export class PDFExporter implements Exporter {
    exportBom(packageInfos: PackageInfo[]): void {
        this.exportToPDF(packageInfos);
    }


    exportToPDF(packageInfos: PackageInfo[]) {
        var doc = new jsPDF();
        var col = ["Group", "Name", "Version", "License", "Copyright"];
        var rows = [];

        var groupPdf: String;
        var namePdf: String;
        var versionPdf: String;
        var licensePdf: String;
        var copyrightPdf: String;

        for (let i = 0; i < packageInfos.length; i++) {
            let group = packageInfos[i].group;
            let name = packageInfos[i].name;
            let version = packageInfos[i].version;
            let license = packageInfos[i].licenses;
            let copyright = packageInfos[i].copyright;


            if (group !== '') {
                groupPdf = group;
            } else {
                groupPdf = "no group";
            }

            if (name !== '') {
                namePdf = name;
            } else {
                namePdf = "no name";
            }

            if (version !== '') {
                versionPdf = version;
            } else {
                versionPdf = "no version";
            }

            if (license.length > 0) {
                if (license[0]['license']['id']) {
                    licensePdf = license[0]['license']['id'];
                } else if (license[0]['license']['name']) {
                    licensePdf = license[0]['license']['name'];
                } else {
                    licensePdf = "no license";
                }
            } else {
                licensePdf = "no license";
            }

            if (copyright !== '') {
                copyrightPdf = copyright;
            } else {
                copyrightPdf = "no copyright";
            }

            rows.push([groupPdf, namePdf, versionPdf, licensePdf, copyrightPdf]);
        }

        autoTable(doc, {
            theme: "grid",
            head: [col],
            body: rows
        })

        const rawOutput = doc.output("arraybuffer");
        appendFileSync(path.join('out', 'updatedBom.pdf'), Buffer.from(rawOutput));
    }
}