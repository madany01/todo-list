/*
allows for messaging the user to confirm some action.
e.g. when user click on some delete item, make sure the user really wants to delete that item
*/

import template from './template.html'
import '../../shared/style.css'
import './style.css'
import { htmlToElement } from '../../utils/html-to-element'
import { acquireOverlay } from '../overlay/index'


const CONFIRMATION_MODES = Object.freeze({
	normal: 'normal',
	warning: 'warning',
	danger: 'danger'
})
const requests = []
const { el, verbEl, itemEl, closeBtn, cancelBtn, confirmBtn } = createEls()


const overlayMgr = (function () {
	let overlayReleaser = null

	async function acquire () {
		if (!overlayReleaser) {
			overlayReleaser = await acquireOverlay()
		}
		return overlayReleaser
	}

	function release () {
		if (overlayReleaser) {
			overlayReleaser()
		}
		overlayReleaser = null
	}

	return {
		acquire,
		release,
	}
})()

function createEls () {
	const el = htmlToElement(template)
	const verbEl = el.querySelector('.confirmation-verb')
	const itemEl = el.querySelector('.confirmation-item')
	const closeBtn = el.querySelector('.cancel')
	const confirmBtn = el.querySelector('.confirmation-modal-confirm-btn')
	const cancelBtn = el.querySelector('.modal-close-icon')
	return {
		el, verbEl, itemEl, closeBtn, cancelBtn, confirmBtn
	}
}

function hide () {
	el.classList.add('d-none')
}

function setConfirmationMode (mode) {
	el.classList.remove('confirm-warning', 'confirm-danger')
	el.classList.add(`confirm-${mode}`)
}

function show ({ verb, item, mode }) {
	verbEl.textContent = verb
	itemEl.textContent = item
	setConfirmationMode(mode)
	el.classList.remove('d-none')
}

function responseHandler (answer) {
	const { promiseResolver } = requests[0]
	promiseResolver(answer)
	requests.shift()
	processNext()
}

async function processNext () {
	if (!requests.length) {
		hide()
		overlayMgr.release()
		return
	}
	await overlayMgr.acquire()
	const { verb, item, mode } = requests[0]
	show({ verb, item, mode })
}

function confirm ({ verb, item, mode = CONFIRMATION_MODES.normal }) {
	let promiseResolver
	const promise = new Promise(resolve => {
		promiseResolver = (...args) => resolve(...args)
	})
	requests.push({ promise, promiseResolver, verb, item, mode })
	if (requests.length === 1) processNext()
	return promise
}


;(function init () {
	;[closeBtn, cancelBtn].forEach(
		btn => btn.addEventListener('click', responseHandler.bind(null, false))
	)
	confirmBtn.addEventListener('click', responseHandler.bind(null, true))
	hide()
	document.body.prepend(el)
})()

export {
	confirm,
	CONFIRMATION_MODES
}
