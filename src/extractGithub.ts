"use strict";

// module

export default function extractGithub (plugin: any): string {

	let github: string = "";

	if ("object" === typeof plugin) {

		if ("string" === typeof plugin.github) {
			github = plugin.github;
		}
		else if ("string" === typeof plugin.repository) {
			github = plugin.repository;
		}
		else if (plugin.repository && "string" === typeof plugin.repository.url) {
			github = plugin.repository.url;
		}

	}

	return github;

};
