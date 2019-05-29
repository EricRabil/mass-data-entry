import fs from "fs-extra";
import path from "path";
import uuid from "uuid";

import DataStructure, { Entry } from "./structures/DataStructure";

export namespace IOKit {
    export let ENTRIES_PATH = path.resolve(__dirname, "..", "entries");

    export async function writeEntries({ structureID }: DataStructure, entries: Entry[], meta?: Entry): Promise<void> {
        const name = `${structureID}-entry-${uuid.v1()}`;
        
        await fs.mkdirp(ENTRIES_PATH)
        await fs.writeJSON(path.resolve(ENTRIES_PATH, name), { structureID, entries, meta });
    }
}