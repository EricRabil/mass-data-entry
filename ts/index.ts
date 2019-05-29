import "./patches";
import chalk from "chalk";
import program from "commander";
import fs from "fs-extra";
import readline from "readline-sync";
import { IOKit } from "./io";
import DataStructure, { validateDataStructure, Entry } from "./structures/DataStructure";

const ESCAPE_TOKEN = "::q";

function getInput(token: string, fieldKey: string, fieldValue: "string" | "number" | "boolean"): string | number | boolean {
    const answer = readline.question(chalk.yellow(`[${fieldValue[0]}] `) + chalk.green(`${fieldKey}: `));

    if (answer === token) throw "break";

    let parsedValue: string | boolean | number;
    if (fieldValue[0] === "n") {
        if (isNaN(parsedValue = parseFloat(answer))) return getInput(token, fieldKey, fieldValue);
    } else if (fieldValue[0] === "b") {
        parsedValue = Boolean(answer);
    } else parsedValue = answer;
    return parsedValue;
}

program.version(fs.readJSONSync("../package.json").version);
program.option("-o, --output", "Output directory. Defaults to @mass-data-entry/entries")
       .option("-e, --escape", `String token that signals the program to stop, default is ${ESCAPE_TOKEN}`)
       .option("-l, --load", "Load and append to an existing entry file")
       .command("dp <structure>")
       .action(async function(structure: string, {output, escape, load}: {output?: string, escape?: string, load?: string}) {
            if (output) IOKit.ENTRIES_PATH = output;

            let struct: DataStructure = undefined as any;
            if (!(await fs.pathExists(structure)) || !structure.endsWith(".json") || !validateDataStructure(struct = await fs.readJSON(structure))) console.log(chalk.red("Please supply a valid structure file"));

            const token = escape || ESCAPE_TOKEN;

            const meta: Entry = {};

            const destructure = (obj: {[key: string]: "string" | "number" | "boolean"}) => Object.keys(obj).map((fieldKey) => ({fieldKey, fieldValue: obj[fieldKey]}));

            if (struct.meta) {
                console.log(chalk.blue("doing metadata collection"))

                const metaFields = destructure(struct.meta as any);

                metaFields.forEach(({fieldKey, fieldValue}) => {
                    meta[fieldKey] = getInput(token, fieldKey, fieldValue);
                });
            }

            const fields = destructure(struct.fields);

            let entries: Entry[] = [];
            if (load) entries = entries.concat(JSON.parse(load).entries);

            while (true) {
                console.log(chalk.blue(`new entry starting now, submit ${token} at any time to break`));

                const entry: Entry = {};

                let shouldBreak: boolean = false;

                try {
                    fields.forEach(({fieldKey, fieldValue}) => {
                        entry[fieldKey] = getInput(token, fieldKey, fieldValue);
                    });
                } catch (e) {
                    if (e === "break") break;
                    else throw e;
                }

                entries.push(entry);
            }

            if (entries.length === 0) return;

            await IOKit.writeEntries(struct, entries, meta);
       });

program.parse(process.argv)