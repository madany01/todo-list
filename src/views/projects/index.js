import componentTemplate from './template.html'

import '../../shared/style.css'
import './style.css'

import { htmlToElement } from '../../utils/html-to-element'
import { createEvent } from '../../utils/events'
import { confirm, CONFIRMATION_MODES } from '../confirmation/index'

import { createModalMgr } from './_modal-manager'



function createProjectsView (parentEl) {
	// state objects
	const projectsMap = new Map()
	let activeProject = null
	// events
	const projectAddEvent = createEvent()
	const projectEditEvent = createEvent()
	const projectDeleteEvent = createEvent()
	const projectSelectEvent = createEvent()
	// dom elements
	const el = htmlToElement(componentTemplate)
	const menuEl = el.querySelector('.collapsed-menu-options')
	const homeProjectEl = el.querySelector('.home-project')
	const projectListEl = el.querySelector('.project-list')
	// templates
	const projectTemplate = el.querySelector('.projectTemplate').textContent
	// modal managers
	const modalMgr = createModalMgr(el.querySelector('.project-modal'))



	// add/select/delete/edit projects

	function add (...projects) {
		projects.forEach(project => {
			projectsMap.set(project.id, project)

			if (project.isHome) {
				updateHomeEl(project)
				return
			}

			projectListEl.append(createProjectEl(project))
		})
	}

	function select (project) {
		if (activeProject) {
			if (activeProject.isHome) homeProjectEl.classList.remove('selected')
			else projectListEl.querySelector('.project.selected')?.classList.remove('selected')
		}

		activeProject = project

		if (activeProject.isHome) homeProjectEl.classList.add('selected')
		else {
			projectListEl.querySelector(`.project[data-id="${project.id}"]`)
				.classList.add('selected')
		}
	}

	function delete_ (id) {
		if (activeProject && activeProject.id === id) activeProject = null

		projectListEl.querySelector(`.project[data-id="${id}"]`).remove()
		projectsMap.delete(id)
	}

	function edit (...projects) {
		projects.forEach(project => {
			projectsMap.set(project.id, project)

			if (project.isHome) {
				updateHomeEl(project)
				return
			}

			const projectEl = createProjectEl(project)

			if (project.id === activeProject?.id) projectEl.classList.add('selected')

			projectListEl.querySelector(`.project[data-id="${project.id}"]`).replaceWith(projectEl)
		})
	}

	// event handlers

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
			item: projectsMap.get(id).name,
			mode: CONFIRMATION_MODES.danger,
		})
		if (!ok) return
		handleDeleteDone(id)
	}

	function handleAddEvent () {
		modalMgr.showModal(modalMgr.MODES.ADD, handleAddDone)
	}

	function handleEditEvent (id) {
		const project = projectsMap.get(id)
		modalMgr.showModal(modalMgr.MODES.EDIT, handleEditDone.bind(null, id), project)
	}

	function handleSelectEvent (id) {
		if (id === activeProject?.id) return
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

	// utils

	function createProjectEl (project) {
		const html = projectTemplate
			.replace(/{{project.id}}/g, project.id)
			.replace(/{{project.name}}/g, project.name)
			.replace(/{{project.color}}/g, project.color)
			.replace(/{{project.todoesCnt}}/g, project.todoesCnt)

		const el = htmlToElement(html)

		el.querySelector('.color').style.setProperty('background-color', project.color)

		return el
	}

	function updateHomeEl (project) {
		homeProjectEl.dataset.id = String(project.id)
		homeProjectEl.textContent = project.name
	}


	(function init () {
		parentEl.append(el)
		// bind events
		homeProjectEl.addEventListener('click', () => handleSelectEvent(homeProjectEl.dataset.id))
		menuEl.addEventListener('click', handleMenuClick)
		projectListEl.addEventListener('click', handleProjectListClickEvent)
	})()

	return {
		projectAddEvent,
		projectEditEvent,
		projectDeleteEvent,
		projectSelectEvent,
		add,
		edit,
		select,
		delete: delete_,
	}
}


export {
	createProjectsView
}
