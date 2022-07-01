"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// module
function extractGithub(plugin) {
    let github = "";
    if ("string" === typeof plugin.github) {
        github = plugin.github;
    }
    else if ("string" === typeof plugin.repository) {
        github = plugin.repository;
    }
    else if (plugin.repository && "string" === typeof plugin.repository.url) {
        github = plugin.repository.url;
    }
    return github;
}
exports.default = extractGithub;
;
