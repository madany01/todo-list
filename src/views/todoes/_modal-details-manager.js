import '../../shared/style.css'
import './style.css'

import { acquireOverlay } from '../overlay'

function createDetailsModalMgr (el) {
	// dom elements
	const projectNameEl = el.querySelector('.todo-details-project-name')
	const projectColorEl = el.querySelector('.todo-details-project-color')
	const nameEl = el.querySelector('.todo-details-title')
	const descriptionEl = el.querySelector('.todo-details-description')
	const priorityEl = el.querySelector('.priority-ctr')
	const statusEl = el.querySelector('.todo-details-status')
	const dueDateEl = el.querySelector('.todo-details-date')
	const closeEl = el.querySelector('.modal-close-icon')
	// state objects
	let overlayReleaser = null


	async function show (todo, project) {
		const { name, description, priority, isDone, dueDate } = todo
		const { name: projectName, color } = project

		nameEl.textContent = name

		descriptionEl.textContent = description

		priorityEl.classList.remove('priority-0', 'priority-1', 'priority-2')
		priorityEl.classList.add(`priority-${priority}`)

		statusEl.classList.remove('todo-details-status-done')
		if (isDone) statusEl.classList.add('todo-details-status-done')
		dueDateEl.textContent = dueDate.toLocaleDateString()

		projectNameEl.textContent = projectName
		projectColorEl.style.backgroundColor = color

		overlayReleaser = await acquireOverlay(releaseAndHide)
		el.classList.remove('d-none')
	}

	// utils

	function releaseAndHide () {
		el.classList.add('d-none')
		overlayReleaser()
		overlayReleaser = null
	}

	;(function init () {
		closeEl.addEventListener('click', releaseAndHide)
	})()

	return {
		show
	}
}


export { createDetailsModalMgr }
