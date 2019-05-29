"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateDataStructure(struct) {
    return typeof struct === "object" && Object.keys(struct).includesMany(["structureID", "fields"]);
}
exports.validateDataStructure = validateDataStructure;
