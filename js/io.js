"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const uuid_1 = __importDefault(require("uuid"));
var IOKit;
(function (IOKit) {
    IOKit.ENTRIES_PATH = path_1.default.resolve(__dirname, "..", "entries");
    async function writeEntries({ structureID }, entries) {
        const name = `${structureID}-entry-${uuid_1.default.v1()}`;
        await fs_extra_1.default.mkdirp(IOKit.ENTRIES_PATH);
        await fs_extra_1.default.writeJSON(path_1.default.resolve(IOKit.ENTRIES_PATH, name), { structureID, entries });
    }
    IOKit.writeEntries = writeEntries;
})(IOKit = exports.IOKit || (exports.IOKit = {}));
