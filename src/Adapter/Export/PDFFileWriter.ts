import { appendFileSync } from "fs";
import * as path from 'path';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export class PDFFileWriter {
    export(head: string [][], body: string[][]): void {
        let doc = new jsPDF();
        autoTable(doc, {
            theme: "grid",
            head: head,
            body: body
        })
        const rawOutput = doc.output("arraybuffer");
        appendFileSync(path.join('out', 'updatedBom.pdf'), Buffer.from(rawOutput));
    }
}