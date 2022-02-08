import { createProject } from '../models/projects'


function createProjectsManager () {
	// state objects
	const projectsMap = new Map() // project id => project object
	const state = {
		activeProjectId: null,
		homeProjectId: null,
	}

	function add (projectData) {
		const project = createProject(projectData)
		projectsMap.set(project.id, project)
		saveProjectIds()
		saveProject(project)
		return project.asDataObject()
	}

	function getProject (id) {
		return projectsMap.get(id).asDataObject()
	}

	function getProjects (ids) {
		return ids.map(id => projectsMap.get(id).asDataObject())
	}

	function getAllProjects () {
		return asArray().map(project => project.asDataObject())
	}


	function getActiveProject () {
		return projectsMap.get(state.activeProjectId).asDataObject()
	}

	function getHomeProject () {
		return projectsMap.get(state.homeProjectId).asDataObject()
	}

	function delete_ (id) {
		if (id === state.homeProjectId) throw new Error("can't delete home project")

		if (id === state.activeProjectId) {
			const homeProject = projectsMap.get(state.homeProjectId)
			homeProject.toggleActive()
			state.activeProjectId = homeProject.id
			saveProject(homeProject)
		}

		projectsMap.delete(id)
		saveProjectIds()
		deleteProject(id)
	}

	function edit (projectData) {
		const project = projectsMap.get(projectData.id)
		project.update(projectData)
		saveProject(project)
		return project.asDataObject()
	}

	function setActiveProject (id) {
		if (state.activeProjectId === id) return

		const preActive = projectsMap.get(state.activeProjectId)
		const curActive = projectsMap.get(id)

		preActive?.toggleActive()
		curActive.toggleActive()

		state.activeProjectId = id

		saveProject(preActive, curActive)
	}


	function addTodo (todoId, projectId) {
		const project = projectsMap.get(projectId)
		project.addTodo(todoId)
		saveProject(project)
	}

	function removeTodo (todoId, projectId) {
		const project = projectsMap.get(projectId)
		project.removeTodo(todoId)
		saveProject(project)
	}

	function moveTodoToProject (todoId, fromProjectId, toProjectId) {
		const fromProject =	projectsMap.get(fromProjectId)
		const toProject =	projectsMap.get(toProjectId)

		fromProject.removeTodo(todoId)
		toProject.addTodo(todoId)

		saveProject(fromProject, toProject)
	}



	function saveProject (...projects) {
		projects.forEach(project =>
			localStorage.setItem(`project-${project.id}`, JSON.stringify(project.toJson()))
		)
	}

	function saveProjectIds () {
		localStorage.setItem('projectIds', JSON.stringify(asArray().map(project => project.id)))
	}

	function deleteProject (...ids) {
		ids.forEach(id =>
			localStorage.removeItem(`project-${id}`)
		)
	}

	function load () {
		// projectIds => [id1, id2, ..]
		// project-${id} => {jsonRepresentation}

		const projectIds = JSON.parse(localStorage.getItem('projectIds')) || []

		return projectIds
			.map(id => JSON.parse(localStorage.getItem(`project-${id}`)))
			.map(jsonProject => createProject.fromJson(jsonProject))
	}

	// utils

	function asArray () {
		return [...projectsMap.values()]
	}


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
			saveProjectIds()
			saveProject(homeProject)
		}

		state.homeProjectId = homeProject.id
		state.activeProjectId = [...projectsMap.values()].find(project => project.isActive).id
	})()


	return {
		add,
		getProject,
		getProjects,
		getAllProjects,
		getActiveProject,
		getHomeProject,
		edit,
		setActiveProject,
		delete: delete_,

		addTodo,
		removeTodo,
		moveTodoToProject,
	}
}

export { createProjectsManager }
