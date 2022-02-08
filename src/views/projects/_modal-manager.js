import '../../shared/style.css'
import './style.css'

import { acquireOverlay } from '../overlay'

const MODES = Object.freeze({
	ADD: 'add',
	EDIT: 'edit',
})

function createModalMgr (el) {
	// dom elements
	const nameInput = el.querySelector('input.project-name')
	const colorInput = el.querySelector('input.project-color')
	const closeBtns = [...el.querySelectorAll('.cancel, .modal-close-icon')]
	const actionBtn = el.querySelector('.action')
	// state objects
	let overlayReleaser = null
	let doneHandler = null


	async function showModal (mode, onDoneHandler, { name, color } = {}) {
		doneHandler = onDoneHandler

		el.classList.add(`mode-${mode}`)

		if (name) nameInput.value = name
		if (color) colorInput.value = color

		overlayReleaser = await acquireOverlay(handleCancelClick)

		unhide()
	}

	// event handlers

	function handleCancelClick (e) {
		if (e) e.preventDefault()
		cleanAndHide()
		release()
	}

	function handleActionClick (e) {
		e.preventDefault()
		if (!valid()) {
			reflectErrors()
			return
		}

		const projectData = {
			name: nameInput.value.trim(),
			color: colorInput.value
		}

		cleanAndHide()
		release()
		doneHandler(projectData)
		doneHandler = null
	}

	function reflectErrors () {
		if (!valid()) nameInput.classList.add('invalid')
		else nameInput.classList.remove('invalid')
	}

	// utils

	function clean () {
		Object.entries(MODES).forEach(
			([_, mode]) => el.classList.remove(`mode-${mode}`)
		)

		nameInput.value = ''
		nameInput.classList.remove('invalid')

		colorInput.value = '#350323'
	}

	function hide () {
		el.classList.add('d-none')
	}

	function unhide () {
		el.classList.remove('d-none')
	}

	function cleanAndHide () {
		clean()
		hide()
	}

	function release () {
		overlayReleaser()
		overlayReleaser = null
	}

	function valid () {
		return nameInput.value.trim() !== ''
	}


	;(function init () {
		closeBtns.forEach(btn => btn.addEventListener('click', handleCancelClick))
		actionBtn.addEventListener('click', handleActionClick)
		nameInput.addEventListener('input', reflectErrors)
		cleanAndHide()
	})()

	return { showModal, MODES }
}

export { createModalMgr, MODES }
