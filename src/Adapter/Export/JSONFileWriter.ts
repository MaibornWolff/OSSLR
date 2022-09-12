import { writeFileSync } from 'fs';

export class JSONFileWriter {
    /**
   * Writes the given information into a json file 
   * @param {string} fileName File name
   * @param {string} data Content of the file
   */
  
  write(fileName: string, data: string) {
    try {
      writeFileSync(fileName, data);
    } catch (err) {
      console.error(err);
    }
  }
}
