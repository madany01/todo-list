import { createProject } from '../models/projects'
import { createEvent } from '../utils/events'


function createProjectsManager () {
	const projectsMap = new Map()
	const state = {
		activeProjectId: null,
		homeProjectId: null,
	}
	const projectsChangedEvent = createEvent()


	;(function init () {
		load().forEach(project => projectsMap.set(project.id, project))

		let homeProject = [...projectsMap.values()].find(project => project.isHome)

		if (!homeProject) {
			homeProject = createProject({
				name: 'home',
				color: '#ffffff00',
				isActive: true,
				isHome: true,
			})
			projectsMap.set(homeProject.id, homeProject)
		}

		state.homeProjectId = homeProject.id
		state.activeProjectId = [...projectsMap.values()].find(project => project.isActive).id
	})()


	function asArray () {
		return [...projectsMap.values()]
	}

	function load () {
		return (JSON.parse(localStorage.getItem('projects')) || [])
			.map(jsonProject => createProject.fromJson(jsonProject))
	}

	function save () {
		const projectsJson = [...projectsMap.values()].map(project => project.toJson())
		localStorage.setItem('projects', JSON.stringify(projectsJson))
	}

	function commit () {
		save()
		projectsChangedEvent.trigger(asArray().map(project => project.asViewModel()))
	}

	function add (project) {
		project = createProject(project)
		projectsMap.set(project.id, project)
		commit()
	}

	function edit (project) {
		projectsMap.get(project.id).update(project)
		commit()
	}

	function delete_ (id) {
		if (id === state.homeProjectId) throw new Error("can't delete home project")
		if (id === state.activeProjectId) {
			projectsMap.get(state.homeProjectId).toggleActive()
			state.activeProjectId = state.homeProjectId
		}
		projectsMap.delete(id)
		commit()
	}

	function setActiveProject (id) {
		if (state.activeProjectId === id) return
		projectsMap.get(state.activeProjectId).toggleActive()
		projectsMap.get(id).toggleActive()
		state.activeProjectId = id
		commit()
	}

	function addTodo (todoId, projectId) {
		projectsMap.get(projectId).addTodo(todoId)
		commit()
	}

	function removeTodo (todoId, projectId) {
		projectsMap.get(projectId).removeTodo(todoId)
		commit()
	}

	function moveTodoToProject (todoId, oldProjectId, newProjectId) {
		projectsMap.get(oldProjectId).removeTodo(todoId)
		projectsMap.get(newProjectId).addTodo(todoId)
		commit()
	}

	function getTodoIdsOfProject (projectId) {
		return projectsMap.get(projectId).getTodoIds()
	}


	return {
		projectsChangedEvent,
		add,
		edit,
		delete: delete_,
		setActiveProject,
		addTodo,
		removeTodo,
		moveTodoToProject,
		getTodoIdsOfProject,
		get activeProjectId () { return state.activeProjectId },
		get homeProjectId () { return state.homeProjectId },
		get projects () { return asArray().map(project => project.asViewModel()) },
	}
}

export { createProjectsManager }
