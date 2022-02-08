import '../../shared/style.css'
import './style.css'

import { acquireOverlay } from '../overlay'


const MODES = Object.freeze({
	ADD: 'add',
	EDIT: 'edit',
})

function updateProjectOption (project, projectOption) {
	projectOption.value = project.id
	// projectOption.style.backgroundColor = project.color
	projectOption.textContent = project.name
	projectOption.dataset.color = project.color
}

function createProjectOption (project) {
	const projectOption = document.createElement('option')
	updateProjectOption(project, projectOption)
	return projectOption
}

function dateObjectToInputString (date) {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

function createModalFormMgr (el) {
	// dom elements
	const nameInput = el.querySelector('.todo-name-input')
	const descriptionTextarea = el.querySelector('.todo-description-input')
	const dateInput = el.querySelector('.todo-date-input')
	const prioritySelect = el.querySelector('.priority-select-input')
	const projectSelect = el.querySelector('.project-select-input')
	const closeBtns = [...el.querySelectorAll('.cancel, .modal-close-icon')]
	const actionBtn = el.querySelector('.action')
	// state objects
	const invalidInputs = new Set()
	const projectsMap = new Map()
	let defaultProjectId = null
	let overlayReleaser = null
	let doneHandler = null

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

	// add/select/delete/edit projects

	function addProject (...projects) {
		projects.forEach(project => {
			projectsMap.set(project.id, project)
			projectSelect.append(createProjectOption(project))
		})
	}

	function editProject (project) {
		projectsMap.set(project.id, project)
		updateProjectOption(project, projectSelect.querySelector(`option[value="${project.id}"]`))
	}

	function deleteProject (projectId) {
		if (projectId === defaultProjectId) defaultProjectId = null
		projectsMap.delete(projectId)
		projectSelect.querySelector(`option[value="${projectId}"]`).remove()
	}

	function selectProject (project) {
		defaultProjectId = project.id
	}

	// event handlers


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

	function handleSelectedPriorityChanged (e) {
		prioritySelect.classList.remove('priority-0', 'priority-1', 'priority-2')
		prioritySelect.classList.add(`priority-${prioritySelect.value}`)
	}

	function handleSelectedProjectChanged (e) {
		const projectId = projectSelect.value
		highlightSelect(projectId)
		projectSelect.value = projectId
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

	// utils

	function validateAll () {
		validateName()
		validateDate()
	}

	function clean () {
		Object.entries(MODES).forEach(
			([_, mode]) => el.classList.remove(`mode-${mode}`)
		)

		;[nameInput, descriptionTextarea].forEach(input => input.value = '')

		dateInput.value = dateObjectToInputString(new Date())

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

	function highlightSelect (projectId) {
		projectSelect.style.backgroundColor = projectSelect.querySelector(
			`option[value="${projectId}"]`
		).dataset.color
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

	return { showModal, MODES, addProject, editProject, deleteProject, selectProject }
}


export { createModalFormMgr, MODES }
