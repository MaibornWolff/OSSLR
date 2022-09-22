import { appendFileSync } from 'fs';
import * as path from 'path';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export class PDFFileWriter {
   /**
   * Writes the given information into a PDF file given 
   * @param {string[][]} head Names of the columns
   * @param {string[][]} body Content of the rows
   */
  // https://github.com/opensbom-generator/spdx-sbom-generator
    export(head: string[][], body: string[][]): void {
        let doc = new jsPDF();
        autoTable(doc, {
            theme: 'grid',
            head: head,
            body: body
        });
        const rawOutput = doc.output('arraybuffer');
        appendFileSync(path.join('out', 'updatedBom.pdf'), Buffer.from(rawOutput));
    }
}