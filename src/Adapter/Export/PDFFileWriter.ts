import {appendFileSync} from 'fs';
import * as path from 'path';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';

export class PDFFileWriter {
    private readonly topMargin = 10;
    private readonly botMargin = 10;
    private readonly leftMargin = 10;
    private readonly titleFontSize = 12;
    private readonly fontSize = 10;
    private readonly lineSpacing = 5;
    private readonly pageWidth = 190;


    /**
     * Writes the given information into a PDF file given
     * @param {string[][]} head Names of the columns
     * @param {string[][]} body Content of the rows
     */
    // https://github.com/opensbom-generator/spdx-sbom-generator
    export(head: string[][], body: string[][], licenseTexts: Map<string, string>, fileName: string): void {
        let doc = new jsPDF();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        doc.autoTable({
                theme: 'grid',
                head: head,
                body: body
            }
        );
        licenseTexts.forEach((licenseText, licenseId) => {
            doc.addPage();
            let pageHeight = doc.internal.pageSize.height;
            let pageWidth = doc.internal.pageSize.getWidth();
            let y = this.topMargin;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            doc.setFont(undefined, 'bold');
            doc.setFontSize(this.titleFontSize);
            doc.text(licenseId, pageWidth / 2, y, {align: 'center'});
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            doc.setFont(undefined, 'normal');
            doc.setFontSize(this.fontSize);
            y += this.lineSpacing + 5;
            let splittedText = doc.splitTextToSize(licenseText, this.pageWidth);
            splittedText.forEach((line: string) => {
                if (y > pageHeight - this.botMargin) {
                    y = this.topMargin;
                    doc.addPage();
                }
                doc.text(line, this.leftMargin, y);
                y += this.lineSpacing;
            });
        });

        const rawOutput = doc.output('arraybuffer');
        appendFileSync(path.join('out', fileName), Buffer.from(rawOutput));
    }
}