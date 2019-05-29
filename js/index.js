"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./patches");
const chalk_1 = __importDefault(require("chalk"));
const commander_1 = __importDefault(require("commander"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const readline_sync_1 = __importDefault(require("readline-sync"));
const io_1 = require("./io");
const DataStructure_1 = require("./structures/DataStructure");
const ESCAPE_TOKEN = "::q";
function getInput(token, fieldKey, fieldValue) {
    const answer = readline_sync_1.default.question(chalk_1.default.yellow(`[${fieldValue[0]}] `) + chalk_1.default.green(`${fieldKey}: `));
    if (answer === token)
        throw "break";
    let parsedValue;
    if (fieldValue[0] === "n") {
        if (isNaN(parsedValue = parseFloat(answer)))
            return getInput(token, fieldKey, fieldValue);
    }
    else if (fieldValue[0] === "b") {
        parsedValue = Boolean(answer);
    }
    else
        parsedValue = answer;
    return parsedValue;
}
commander_1.default.version(fs_extra_1.default.readJSONSync("../package.json").version);
commander_1.default.option("-o, --output", "Output directory. Defaults to @mass-data-entry/entries")
    .option("-e, --escape", `String token that signals the program to stop, default is ${ESCAPE_TOKEN}`)
    .option("-l, --load", "Load and append to an existing entry file")
    .command("dp <structure>")
    .action(async function (structure, { output, escape, load }) {
    if (output)
        io_1.IOKit.ENTRIES_PATH = output;
    let struct = undefined;
    if (!(await fs_extra_1.default.pathExists(structure)) || !structure.endsWith(".json") || !DataStructure_1.validateDataStructure(struct = await fs_extra_1.default.readJSON(structure)))
        console.log(chalk_1.default.red("Please supply a valid structure file"));
    const token = escape || ESCAPE_TOKEN;
    const meta = {};
    const destructure = (obj) => Object.keys(obj).map((fieldKey) => ({ fieldKey, fieldValue: obj[fieldKey] }));
    if (struct.meta) {
        console.log(chalk_1.default.blue("doing metadata collection"));
        const metaFields = destructure(struct.meta);
        metaFields.forEach(({ fieldKey, fieldValue }) => {
            meta[fieldKey] = getInput(token, fieldKey, fieldValue);
        });
    }
    const fields = destructure(struct.fields);
    let entries = [];
    if (load)
        entries = entries.concat(JSON.parse(load).entries);
    while (true) {
        console.log(chalk_1.default.blue(`new entry starting now, submit ${token} at any time to break`));
        const entry = {};
        let shouldBreak = false;
        try {
            fields.forEach(({ fieldKey, fieldValue }) => {
                entry[fieldKey] = getInput(token, fieldKey, fieldValue);
            });
        }
        catch (e) {
            if (e === "break")
                break;
            else
                throw e;
        }
        entries.push(entry);
    }
    await io_1.IOKit.writeEntries(struct, entries, meta);
});
commander_1.default.parse(process.argv);
