export function validateDataStructure(struct: unknown): struct is DataStructure {
    return typeof struct === "object" && Object.keys(<any>struct).includesMany(["structureID", "fields"]);
}

export default interface DataStructure {
    structureID: string;
    fields: {
        [key: string]: "string" | "number" | "boolean";
    };
    meta?: {
        [key: string]: "stirng" | "number" | "boolean";
    }
}

export interface Entry {
    [key: string]: string | number | boolean;
}