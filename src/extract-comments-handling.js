/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Hartorn
*/
"use strict";
const buildCommentsFunction = (options, uglifyOptions, extractedComments) => {
	const condition = {};
	const commentsOpts = uglifyOptions.comments || "some";
	if(typeof options.extractComments === "string" || options.extractComments instanceof RegExp) {
		// extractComments specifies the extract condition and commentsOpts specifies the preserve condition
		condition.preserve = commentsOpts;
		condition.extract = options.extractComments;
	} else if(Object.prototype.hasOwnProperty.call(options.extractComments, "condition")) {
		// Extract condition is given in extractComments.condition
		condition.preserve = commentsOpts;
		condition.extract = options.extractComments.condition;
	} else {
		// No extract condition is given. Extract comments that match commentsOpts instead of preserving them
		condition.preserve = false;
		condition.extract = commentsOpts;
	}

	// Ensure that both conditions are functions
	["preserve", "extract"].forEach(key => {
		switch(typeof condition[key]) {
			case "boolean":
				var b = condition[key];
				condition[key] = () => b;
				break;
			case "function":
				break;
			case "string":
				if(condition[key] === "all") {
					condition[key] = () => true;
					break;
				}
				if(condition[key] === "some") {
					condition[key] = (astNode, comment) => comment.type === "comment2" && /@preserve|@license|@cc_on/i.test(comment.value);
				}
				var regex = new RegExp(condition[key]);
				condition[key] = (astNode, comment) => regex.test(comment.value);
				break;
			default:
				regex = condition[key];
				condition[key] = (astNode, comment) => regex.test(comment.value);
		}
	});

	// Redefine the comments function to extract and preserve
	// comments according to the two conditions
	return (astNode, comment) => {
		if(condition.extract(astNode, comment)) {
			extractedComments.push(
				comment.type === "comment2" ? "/*" + comment.value + "*/" : "//" + comment.value
			);
		}
		return condition.preserve(astNode, comment);
	};
};
module.exports = buildCommentsFunction;
