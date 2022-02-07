/*
through 'await acquireOverlay(clickHandler)' we can capture the window, showing blurry overlay,
this prevents the user from doing anything except clicking on the overlay,
or (which is the important thing) deal with the displayed modal on top of the overlay
*/

import styles from './style.css.json'

const el = createOverlayEl()
const requests = []


class DoubleOverlayReleaseError extends Error{
	name = 'DoubleOverlayReleaseError'
}

function createOverlayEl () {
	const el = document.createElement('div')
	Object.entries(styles).forEach(kv => {
		const [prop, val] = kv
		el.style.setProperty(prop, val)
	})
	return el
}

function show () {
	el.style.display = 'block'
}

function hide () {
	el.style.display = 'none'
}

function clickHandler () {
	if(!requests.length || !requests[0].clickHandler) return
	requests[0].clickHandler()
}

function releaseOverlay (promise) {
	const error = new DoubleOverlayReleaseError("you can't release the overlay twice")

	if (!requests.length) throw error

	const { promise: curPromise } = requests[0]

	if (curPromise !== promise) throw error

	requests.shift()
	processNextRequest()
}

function processNextRequest () {
	if (!requests.length) {
		hide()
		return
	}
	const { promiseResolver } = requests[0]
	promiseResolver()
	show()
}

function acquireOverlay (clickHandler=null) {
	let promiseResolver
	const promise = new Promise(resolve => {
		promiseResolver = () => resolve(releaseOverlay.bind(null, promise))
	})

	requests.push({ promise, promiseResolver, ...(clickHandler && {clickHandler}) })

	if (requests.length === 1) processNextRequest()

	return promise
}

;(function init() {
	el.addEventListener('click', clickHandler)
	document.body.prepend(el)
	hide()
})()

export {
	acquireOverlay,
}
