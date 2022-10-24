import {writeFileSync} from 'fs';
import {printError} from '../../Logging/ErrorFormatter';

export class JSONFileWriter {
    /**
     * Writes the given information into a json file
     */
    write(fileName: string, data: string) {
        try {
            writeFileSync(fileName, data);
        } catch (err) {
            printError(err);
        }
    }
}
