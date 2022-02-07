import componentTemplate from './template.html'

import '../../shared/style.css'
import './style.css'

import { htmlToElement } from '../../utils/html-to-element'
import { createEvent } from '../../utils/events'
import { confirm, CONFIRMATION_MODES } from '../confirmation/index'

import { createModalMgr } from './_modal-manager'


function createProjectEl (projectTemplate, project) {
	const template = projectTemplate
		.replace(/{{project.id}}/g, project.id)
		.replace(/{{project.name}}/g, project.name)
		.replace(/{{project.color}}/g, project.color)
		.replace(/{{project.todoesCnt}}/g, project.todoesCnt)

	const el = htmlToElement(template)

	if (project.isActive) el.classList.add('selected')
	el.querySelector('.color').style.setProperty('background-color', project.color)

	return el
}

function updateHomeEl (homeEl, project) {
	homeEl.dataset.id = String(project.id)
	homeEl.classList.remove('selected')
	if (project.isActive) homeEl.classList.add('selected')
	homeEl.textContent = project.name
}


function createProjectsView (parentEl) {
	const projectAddEvent = createEvent()
	const projectEditEvent = createEvent()
	const projectDeleteEvent = createEvent()
	const projectSelectEvent = createEvent()

	const projects = new Map()

	const el = htmlToElement(componentTemplate)

	const projectTemplate = el.querySelector('.projectTemplate').textContent

	const menuEl = el.querySelector('.collapsed-menu-options')
	const homeProjectEl = el.querySelector('.home-project')
	const projectListEl = el.querySelector('.project-list')

	const modalMgr = createModalMgr(el.querySelector('.project-modal'))

	function handleMenuClick (e) {
		const addBtn = e.target.closest('.add-project')
		if (addBtn) handleAddEvent()
		else menuEl.classList.toggle('collapsed')
	}

	function handleProjectListClickEvent (e) {
		const closest = e.target.closest('.delete-project, .edit-project, .project')
		if (!closest) return

		if (closest.classList.contains('project')) {
			const projectId = closest.dataset.id
			handleSelectEvent(projectId)
			return
		}
		const projectId = closest.closest('.project').dataset.id

		if (closest.classList.contains('delete-project')) handleDeleteEvent(projectId)
		else handleEditEvent(projectId)
	}

	async function handleDeleteEvent (id) {
		const ok = await confirm({
			verb: 'delete',
			item: projects.get(id).name,
			mode: CONFIRMATION_MODES.danger,
		})
		if (!ok) return
		handleDeleteDone(id)
	}

	function handleAddEvent () {
		modalMgr.showModal(modalMgr.MODES.ADD, handleAddDone)
	}

	function handleEditEvent (id) {
		const project = projects.get(id)
		modalMgr.showModal(modalMgr.MODES.EDIT, handleEditDone.bind(null, id), project)
	}

	function handleSelectEvent (id) {
		if (projects.get(id).isActive) return
		projectSelectEvent.trigger(id)
	}

	function handleAddDone (projectData) {
		projectAddEvent.trigger(projectData)
	}

	function handleEditDone (id, projectData) {
		projectEditEvent.trigger({ ...projectData, id })
	}

	function handleDeleteDone (id) {
		projectDeleteEvent.trigger(id)
	}

	function render (newProjects) {
		while (projectListEl.childElementCount) projectListEl.lastChild.remove()

		projects.clear()

		newProjects.forEach(project => {
			projects.set(project.id, project)
			if (project.isHome) updateHomeEl(homeProjectEl, project)
		})

		projectListEl.append(
			...newProjects
				.filter(project => !project.isHome)
				.map(project => createProjectEl(projectTemplate, project))
		)
	}

	function bindEvents () {
		homeProjectEl.addEventListener('click', () => handleSelectEvent(homeProjectEl.dataset.id))
		menuEl.addEventListener('click', handleMenuClick)
		projectListEl.addEventListener('click', handleProjectListClickEvent)
	}

	(function init () {
		parentEl.append(el)
		bindEvents()
	})()


	return {
		projectAddEvent,
		projectEditEvent,
		projectDeleteEvent,
		projectSelectEvent,
		render,
	}
}


export {
	createProjectsView
}
