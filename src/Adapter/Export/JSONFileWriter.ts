import { writeFileSync } from "fs";

export class JSONFileWriter {
  write(fileName: string, data: string) {
    try {
      writeFileSync(fileName, data);
    } catch (err) {
      console.error(err);
    }
  }
}
