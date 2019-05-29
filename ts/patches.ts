declare interface Array<T> {
    includesMany(searchElements: T[], fromIndex?: number): boolean;
}

Array.prototype.includesMany = function(searchElements, fromIndex) {
    return searchElements.every(element => this.includes(element, fromIndex));
}