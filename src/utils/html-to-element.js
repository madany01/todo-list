/**
 * @param {String} html
 * @returns {Element}
 */
function htmlToElement (html) {
	const template = document.createElement('template')
	html = html.trim()
	template.innerHTML = html
	return template.content.firstChild
}


/**
* @param {String} html representing any number of sibling elements
* @returns {NodeList}
*/
function htmlToElements (html) {
	const template = document.createElement('template')
	html = html.trim()
	template.innerHTML = html
	return template.content.childNodes
}

export {
	htmlToElement,
	htmlToElements,
}
// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
