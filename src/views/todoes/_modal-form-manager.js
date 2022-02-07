import '../../shared/style.css'
import './style.css'

import { acquireOverlay } from '../overlay'


const MODES = Object.freeze({
	ADD: 'add',
	EDIT: 'edit',
})


function createModalFormMgr (el) {
	const nameInput = el.querySelector('.todo-name-input')
	const descriptionTextarea = el.querySelector('.todo-description-input')
	const dateInput = el.querySelector('.todo-date-input')
	const prioritySelect = el.querySelector('.priority-select-input')
	const projectSelect = el.querySelector('.project-select-input')
	const closeBtns = [...el.querySelectorAll('.cancel, .modal-close-icon')]
	const actionBtn = el.querySelector('.action')

	const invalidInputs = new Set()
	let defaultProjectId = null
	let overlayReleaser = null
	let doneHandler = null


	function clean () {
		Object.entries(MODES).forEach(
			([_, mode]) => el.classList.remove(`mode-${mode}`)
		)

		;[nameInput, dateInput, descriptionTextarea].forEach(input => input.value = '')

		;[...invalidInputs.values()].forEach(input => input.classList.remove('invalid'))
		invalidInputs.clear()

		prioritySelect.classList.remove('priority-0', 'priority-1', 'priority-2')
		prioritySelect.value = '0'

		projectSelect.style.backgroundColor = ''
	}

	function populate (todo) {
		const { name, description, projectId, priority, dueDate } = todo
		nameInput.value = name

		descriptionTextarea.value = description

		prioritySelect.value = priority
		prioritySelect.classList.add(`priority-${priority}`)

		projectSelect.value = projectId
		highlightSelect(projectId)

		const year = dueDate.getFullYear()
		const month = `${dueDate.getMonth() + 1}`.padStart(2, '0')
		const day = `${dueDate.getDate()}`.padStart(2, '0')
		dateInput.value = `${year}-${month}-${day}`
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

	function validateName () {
		nameInput.classList.remove('invalid')
		invalidInputs.delete(nameInput)
		if (nameInput.value.trim() !== '') return

		invalidInputs.add(nameInput)
		nameInput.classList.add('invalid')
	}

	function validateDate () {
		dateInput.classList.remove('invalid')
		invalidInputs.delete(dateInput)

		let isValid = true

		if (dateInput.value) {
			const now = new Date()
			now.setHours(0, 0, 0, 0)
			const date = new Date(dateInput.value)
			if (date < now) isValid = false
		} else isValid = false

		if (isValid) return

		invalidInputs.add(dateInput)
		dateInput.classList.add('invalid')
	}

	function validateAll () {
		validateName()
		validateDate()
	}

	function handleSelectedPriorityChanged (e) {
		prioritySelect.classList.remove('priority-0', 'priority-1', 'priority-2')
		prioritySelect.classList.add(`priority-${prioritySelect.value}`)
	}

	function highlightSelect (projectId) {
		projectSelect.style.backgroundColor = projectSelect.querySelector(
			`option[value="${projectId}"]`
		).dataset.color
	}

	function handleSelectedProjectChanged (e) {
		const projectId = projectSelect.value
		highlightSelect(projectId)
		projectSelect.value = projectId
	}

	function handleCancelClick (e) {
		if (e) e.preventDefault()
		cleanAndHide()
		release()
	}

	function handleActionClick (e) {
		e.preventDefault()
		validateAll()
		if (invalidInputs.size) {
			return
		}

		const todo = Object.fromEntries(new FormData(e.target.closest('form')).entries())
		todo.priority = Number(todo.priority)
		cleanAndHide()
		release()
		doneHandler(todo)
		doneHandler = null
	}

	async function showModal (mode, onDoneHandler, todo = null) {
		doneHandler = onDoneHandler

		el.classList.add(`mode-${mode}`)


		if (todo) populate(todo)
		else {
			prioritySelect.classList.add('priority-0')

			projectSelect.value = defaultProjectId
			highlightSelect(defaultProjectId)
		}

		overlayReleaser = await acquireOverlay(handleCancelClick)
		unhide()
	}


	function setProjects (projects) {
		while (projectSelect.childElementCount) projectSelect.remove(projectSelect.lastChild)

		defaultProjectId = projects.find(project => project.isActive).id

		projectSelect.append(...projects.map(project => {
			const option = document.createElement('option')
			option.value = project.id
			// option.style.backgroundColor = project.color
			option.textContent = project.name
			option.dataset.color = project.color
			return option
		}))
	}


	;(function init () {
		closeBtns.forEach(btn => btn.addEventListener('click', handleCancelClick))
		actionBtn.addEventListener('click', handleActionClick)
		prioritySelect.addEventListener('change', handleSelectedPriorityChanged)
		projectSelect.addEventListener('change', handleSelectedProjectChanged)
		nameInput.addEventListener('input', validateName)
		dateInput.addEventListener('change', validateDate)
		cleanAndHide()
	})()

	return { showModal, setProjects, MODES }
}


export { createModalFormMgr, MODES }
