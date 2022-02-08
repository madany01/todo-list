import componentTemplate from './template.html'
import './style.css'
import '../../shared/style.css'

import { htmlToElement } from '../../utils/html-to-element'
import { createEvent } from '../../utils/events'
import { confirm, CONFIRMATION_MODES } from '../confirmation'
import { createModalFormMgr } from './_modal-form-manager'
import { createDetailsModalMgr } from './_modal-details-manager'




function createTodoesView (parentEl) {
	// state objects
	let activeProject = null
	const todoesMap = new Map()
	// events
	const todoAddEvent = createEvent()
	const todoEditEvent = createEvent()
	const todoDeleteEvent = createEvent()
	const todoToggleStatusEvent = createEvent()
	// dom elements
	const el = htmlToElement(componentTemplate)
	const activeProjectEl = el.querySelector('.current-project')
	const addTodoBtn = el.querySelector('.add-todo')
	const doneTodoesHiderTogglerEl = el.querySelector('.toggle-done-todoes')
	const todoesList = el.querySelector('.todoes')
	const doneTodoesList = el.querySelector('.done-todoes')
	// templates
	const todoTemplate = el.querySelector('.todoTemplate').textContent
	const doneTodoTemplate = el.querySelector('.doneTodoTemplate').textContent
	// modal managers
	const modalFormMgr = createModalFormMgr(el.querySelector('.modal-todo-form'))
	const todoDetailsModal = createDetailsModalMgr(el.querySelector('.todo-details'))



	// add/delete/edit/toggle todoes

	function add (...todoes) {
		const allTodoesEl = todoes.map(todo => createTodoEl(todo))

		const doneTodoesEl = allTodoesEl.filter((_, i) => todoes[i].isDone)
		const todoesEl = allTodoesEl.filter((_, i) => !todoes[i].isDone)

		doneTodoesList.append(...doneTodoesEl)
		todoesList.append(...todoesEl)

		todoes.forEach(todo => todoesMap.set(todo.id, todo))
	}

	function delete_ (id) {
		const listEl = todoesMap.get(id).isDone ? doneTodoesList : todoesList
		todoesMap.delete(id)
		listEl.querySelector(`.todo[data-id="${id}"]`).remove()
	}

	function edit (todo) {
		const curList = todoesMap.get(todo.id).isDone ? doneTodoesList : todoesList
		const targetList = todo.isDone ? doneTodoesList : todoesList

		const curlTodoEl = curList.querySelector(`.todo[data-id="${todo.id}"]`)

		const newTodoEl = createTodoEl(todo)
		const statusChanged = curList === targetList

		if (!statusChanged) {
			curlTodoEl.replaceWith(newTodoEl)
		} else {
			curlTodoEl.remove()
			targetList.append(newTodoEl)
		}

		todoesMap.set(todo.id, todo)
	}

	function toggleDone (todo) {
		todoesMap.set(todo.id, todo)

		let [curList, targetList] = [todoesList, doneTodoesList]
		if (!todo.isDone) [curList, targetList] = [targetList, curList]

		curList.querySelector(`.todo[data-id="${todo.id}"]`).remove()
		targetList.append(createTodoEl(todo))
	}

	// select/add/delete/edit projects

	function selectProject (project, newTodoes) {
		updateActiveProject(project)

		modalFormMgr.selectProject(project)


		clearTodoes()
		add(...newTodoes)
	}

	function addProject (...projects) {
		modalFormMgr.addProject(...projects)
	}

	function deleteProject (id) {
		modalFormMgr.deleteProject(id)
		if (id !== activeProject?.id) return
		activeProject = null
		clearTodoes()
	}

	function editProject (project) {
		modalFormMgr.editProject(project)
		if (project.id !== activeProject?.id) return
		updateActiveProject(project)
	}

	// event handlers

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
			item: todoesMap.get(todoId).name,
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
			}, todoesMap.get(todoId)
		)
	}

	function handleTodoClick (todoId) {
		todoDetailsModal.show(todoesMap.get(todoId), activeProject)
	}

	function handleAddTodoComplete (todo) {
		todoAddEvent.trigger(todo)
	}

	function handleEditTodoComplete (todo) {
		todoEditEvent.trigger(todo)
	}

	// utils

	function clearTodoes () {
		todoesMap.clear()
		;[todoesList, doneTodoesList].forEach(list => {
			while (list.childElementCount > 1) list.lastChild.remove()
		})
	}

	function createTodoEl (todo) {
		const template = todo.isDone ? doneTodoTemplate : todoTemplate

		const html = template
			.replaceAll(/{{todo.id}}/g, todo.id)
			.replaceAll(/{{todo.name}}/g, todo.name)
			.replaceAll(/{{todo.description}}/g, todo.description)
			.replaceAll(/{{todo.priority}}/g, todo.priority)
			.replaceAll(/{{todo.dueDate}}/g, todo.dueDate.toLocaleDateString())

		return htmlToElement(html)
	}

	function updateActiveProject (newActiveProject) {
		activeProject = newActiveProject
		activeProjectEl.textContent = activeProject.name
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
		add,
		edit,
		delete: delete_,
		toggleDone,
		selectProject,
		addProject,
		editProject,
		deleteProject,
		todoAddEvent,
		todoEditEvent,
		todoDeleteEvent,
		todoToggleStatusEvent,
	}
}




export {
	createTodoesView
}
