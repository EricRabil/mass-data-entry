import "./patches";
import chalk from "chalk";
import program from "commander";
import fs from "fs-extra";
import readline from "readline-sync";
import { IOKit } from "./io";
import DataStructure, { validateDataStructure, Entry } from "./structures/DataStructure";

const ESCAPE_TOKEN = "::q";

program.version(fs.readJSONSync("../package.json").version);
program.option("-o, --output", "Output directory. Defaults to @mass-data-entry/entries")
       .option("-e, --escape", `String token that signals the program to stop, default is ${ESCAPE_TOKEN}`)
       .command("dp <structure>")
       .action(async function(structure: string, {output, escape}: {output?: string, escape?: string}) {
            if (output) IOKit.ENTRIES_PATH = output;

            let struct: DataStructure = undefined as any;
            if (!(await fs.pathExists(structure)) || !structure.endsWith(".json") || !validateDataStructure(struct = await fs.readJSON(structure))) console.log(chalk.red("Please supply a valid structure file"));

            const token = escape || ESCAPE_TOKEN;
            const fields = Object.keys(struct.fields).map((fieldKey) => ({fieldKey, fieldValue: struct.fields[fieldKey]}));

            const entries: Entry[] = [];

            while (true) {
                console.log(chalk.blue(`new entry starting now, submit ${token} at any time to break`));

                const entry: Entry = {};

                let shouldBreak: boolean = false;

                try {
                    fields.forEach(({fieldKey, fieldValue}) => {
                        const ask: any = () => {
                            const answer = readline.question(chalk.yellow(`[${fieldValue[0]}] `) + chalk.green(`${fieldKey}: `));

                            if (answer === token) throw "break";
    
                            let parsedValue: string | boolean | number;
                            if (fieldValue[0] === "n") {
                                if (isNaN(parsedValue = parseFloat(answer))) return ask();
                            } else if (fieldValue[0] === "b") {
                                parsedValue = Boolean(answer);
                            } else parsedValue = answer;
                            entry[fieldKey] = parsedValue;
                        }
    
                        ask();
                    });
                } catch (e) {
                    if (e === "break") break;
                    else throw e;
                }

                entries.push(entry);
            }

            await IOKit.writeEntries(struct, entries);
       });

program.parse(process.argv)