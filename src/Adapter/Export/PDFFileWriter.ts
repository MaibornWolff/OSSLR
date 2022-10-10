import {appendFileSync} from 'fs';
import * as path from 'path';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';

export class PDFFileWriter {
    /**
     * Writes the given information into a PDF file given
     * @param {string[][]} head Names of the columns
     * @param {string[][]} body Content of the rows
     */
    // https://github.com/opensbom-generator/spdx-sbom-generator
    export(head: string[][], body: string[][], fileName: string): void {
        let doc = new jsPDF();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        doc.autoTable({
                theme: 'grid',
                head: head,
                body: body
            }
        );

        const rawOutput = doc.output('arraybuffer');
        appendFileSync(path.join('out', fileName), Buffer.from(rawOutput));
    }
}