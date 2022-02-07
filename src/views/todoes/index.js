import componentTemplate from './template.html'
import './style.css'
import '../../shared/style.css'

import { htmlToElement } from '../../utils/html-to-element'
import { createEvent } from '../../utils/events'
import { confirm, CONFIRMATION_MODES } from '../confirmation'
import { createModalFormMgr } from './_modal-form-manager'
import { createDetailsModalMgr } from './_modal-details-manager'


function createTodoEl (template, todo) {
	template = template
		.replaceAll(/{{todo.id}}/g, todo.id)
		.replaceAll(/{{todo.name}}/g, todo.name)
		.replaceAll(/{{todo.description}}/g, todo.description)
		.replaceAll(/{{todo.priority}}/g, todo.priority)
		.replaceAll(/{{todo.dueDate}}/g, todo.dueDate.toLocaleDateString())

	return htmlToElement(template)
}


function createTodoesView (parentEl) {
	const projects = []
	let activeProject = null
	const todoes = new Map()

	const todoAddEvent = createEvent()
	const todoEditEvent = createEvent()
	const todoDeleteEvent = createEvent()
	const todoToggleStatusEvent = createEvent()

	const el = htmlToElement(componentTemplate)

	const todoTemplate = el.querySelector('.todoTemplate').textContent
	const doneTodoTemplate = el.querySelector('.doneTodoTemplate').textContent

	const activeProjectEl = el.querySelector('.current-project')
	const addTodoBtn = el.querySelector('.add-todo')
	const doneTodoesHiderTogglerEl = el.querySelector('.toggle-done-todoes')
	const todoesList = el.querySelector('.todoes')
	const doneTodoesList = el.querySelector('.done-todoes')

	const modalFormMgr = createModalFormMgr(el.querySelector('.modal-todo-form'))
	const todoDetailsModal = createDetailsModalMgr(el.querySelector('.todo-details'))


	function projectsChanged (newProjects) {
		projects.splice(0, projects.length, ...newProjects)
		modalFormMgr.setProjects(newProjects)
		activeProject = projects.find(project => project.isActive)
		activeProjectEl.textContent = activeProject.name
	}

	function render (newTodoes) {
		;[todoesList, doneTodoesList].forEach(list => {
			while (list.childElementCount > 1) list.lastChild.remove()
		})
		newTodoes.forEach(todo => {
			todoes.set(todo.id, todo)
			if (todo.isDone) doneTodoesList.append(createTodoEl(doneTodoTemplate, todo))
			else todoesList.append(createTodoEl(todoTemplate, todo))
		})
	}

	function handleAddEvent () {
		modalFormMgr.showModal(modalFormMgr.MODES.ADD, handleAddTodoComplete)
	}

	function handleToggleDoneTodoesVisibility () {
		doneTodoesHiderTogglerEl.classList.toggle('on')
		doneTodoesList.classList.toggle('hidden')
	}

	function handleTodoesListClick (e) {
		const closest = e.target.closest('.todo-change-status, .edit-todo, .delete-todo, .todo')

		if (!closest) return
		const todoId = closest.closest('.todo').dataset.id

		let handler
		if (closest.classList.contains('todo-change-status')) handler = handleTodoChangeStatus
		else if (closest.classList.contains('edit-todo')) handler = handleEditTodoClick
		else if (closest.classList.contains('delete-todo')) handler = handleDeleteTodoClick
		else handler = handleTodoClick

		handler(todoId)
	}

	function handleTodoChangeStatus (todoId) {
		todoToggleStatusEvent.trigger(todoId)
	}

	async function handleDeleteTodoClick (todoId) {
		const ok = await confirm({
			verb: 'delete',
			item: todoes.get(todoId).name,
			mode: CONFIRMATION_MODES.danger,
		})
		if (!ok) return
		todoDeleteEvent.trigger(todoId)
	}

	function handleEditTodoClick (todoId) {
		modalFormMgr.showModal(
			modalFormMgr.MODES.EDIT, (todo) => {
				todo.id = todoId
				handleEditTodoComplete(todo)
			}, todoes.get(todoId)
		)
	}

	function handleTodoClick (todoId) {
		todoDetailsModal.show(todoes.get(todoId), activeProject)
	}

	function handleAddTodoComplete (todo) {
		todoAddEvent.trigger(todo)
	}

	function handleEditTodoComplete (todo) {
		todoEditEvent.trigger(todo)
	}


	;(function init () {
		function bindEvents () {
			addTodoBtn.addEventListener('click', handleAddEvent)
			doneTodoesHiderTogglerEl.addEventListener('click', handleToggleDoneTodoesVisibility)
			todoesList.addEventListener('click', handleTodoesListClick)
			doneTodoesList.addEventListener('click', handleTodoesListClick)
		}

		parentEl.append(el)
		bindEvents()
	})()

	return {
		render,
		projectsChanged,
		todoAddEvent,
		todoEditEvent,
		todoDeleteEvent,
		todoToggleStatusEvent,
	}
}


export {
	createTodoesView
}
