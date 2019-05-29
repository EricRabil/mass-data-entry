"use strict";
Array.prototype.includesMany = function (searchElements, fromIndex) {
    return searchElements.every(element => this.includes(element, fromIndex));
};
