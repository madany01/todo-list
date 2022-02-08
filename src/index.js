import { createProjectsManager } from './model-managers/projects-manager'
import { createTodoesManager } from './model-managers/todoes-manager'
import { createProjectsView } from './views/projects/index'
import { createTodoesView } from './views/todoes'


// _createDummyData(10, 10)


const projectsView = createProjectsView(document.querySelector('.side-menu'))
const projectManager = createProjectsManager()

const todoesView = createTodoesView(document.querySelector('.todoes-section'))
const todoesManager = createTodoesManager()


// projects handlers

function handleProjectAddEvent (projectData) {
	const project = projectManager.add(projectData)
	projectsView.add(project)
	todoesView.addProject(project)
}

function handleProjectDeleteEvent (projectId) {
	const wasActive = projectManager.getActiveProject().id === projectId

	todoesManager.delete(...projectManager.getProject(projectId).todoIds)
	projectManager.delete(projectId)

	projectsView.delete(projectId)
	todoesView.deleteProject(projectId)

	if (!wasActive) return

	const activeProject = projectManager.getActiveProject()

	projectsView.select(activeProject)
	todoesView.selectProject(activeProject, todoesManager.getTodoes(activeProject.todoIds))
}

function handleProjectSelectEvent (projectId) {
	projectManager.setActiveProject(projectId)

	const activeProject = projectManager.getProject(projectId)

	projectsView.select(activeProject)
	todoesView.selectProject(activeProject, todoesManager.getTodoes(activeProject.todoIds))
}

function handleProjectEditEvent (projectData) {
	const project = projectManager.edit(projectData)

	projectsView.edit(project)
	todoesView.editProject(project)
}

// todoes handlers

function handleTodoAddEvent (todoData) {
	const todo = todoesManager.add(todoData)
	projectManager.addTodo(todo.id, todo.projectId)

	projectsView.edit(projectManager.getProject(todo.projectId))

	if (todo.projectId !== projectManager.getActiveProject().id) return

	todoesView.add(todo)
}

function handleTodoDeleteEvent (todoId) {
	const projectId = todoesManager.getTodo(todoId).projectId

	todoesManager.delete(todoId)
	projectManager.removeTodo(todoId, projectId)

	todoesView.delete(todoId)
	projectsView.edit(projectManager.getProject(projectId))
}

function handleTodoEditEvent (todoData) {
	const preProjectId = todoesManager.getTodo(todoData.id).projectId
	const curProjectId = todoData.projectId

	const todo = todoesManager.edit(todoData)

	if (preProjectId === curProjectId) {
		todoesView.edit(todo)
		return
	}

	projectManager.moveTodoToProject(todoData.id, preProjectId, curProjectId)

	todoesView.delete(todo.id)
	projectsView.edit(...projectManager.getProjects([preProjectId, curProjectId]))
}

function handleTodoToggleStatusEvent (todoId) {
	const todo = todoesManager.toggleTodoStatus(todoId)
	todoesView.toggleDone(todo)
}


function _createDummyData (nProjects, nTodoes) {
	// projectIds = [id1, id2, ..]
	// project-${id} => json
	// todoIds = [id1, id2, ..]
	// todo-${id} => json

	(JSON.parse(localStorage.getItem('projectIds')) || []).forEach(projectId => {
		localStorage.removeItem(`project-${projectId}`)
	})

	;(JSON.parse(localStorage.getItem('todoIds')) || []).forEach(todoId => {
		localStorage.removeItem(`todo-${todoId}`)
	})

	localStorage.removeItem('projectIds')
	localStorage.removeItem('todoIds')

	const alphaNum = '0123456789abcdef'

	let projects = new Array(nProjects).fill(null).map(() => [])

	const todoes = new Array(nTodoes).fill(null).map((_, i) => {
		const date = new Date()
		date.setFullYear(date.getFullYear() + Math.trunc(Math.random() * nTodoes))

		const projectIndex = Math.trunc(Math.random() * nProjects)

		const todo = {
			id: `${i}`,
			projectId: `${projectIndex}`,
			name: `todo-${i}`,
			description: `todo${i}:\n`,
			priority: Math.trunc(Math.random() * 3),
			dueDate: date,
			isDone: Math.random() < 0.2,
		}

		projects[projectIndex].push(todo.id)

		return todo
	})

	projects = projects.map((projectTodoIds, i) => {
		const color = '#' + (
			new Array(6).fill(null).map(() => alphaNum[Math.trunc(Math.random() * 16)]).join('')
		)

		const project = {
			id: `${i}`,
			todoIds: projectTodoIds,
			name: i === 0 ? 'home' : `pro${i}`,
			color,
			isHome: i === 0,
			isActive: i === 0,
		}

		return project
	})

	localStorage.setItem('projectIds', JSON.stringify(projects.map(project => project.id)))
	localStorage.setItem('todoIds', JSON.stringify(todoes.map(todo => todo.id)))

	projects.forEach(project => {
		localStorage.setItem(`project-${project.id}`, JSON.stringify(project))
	})

	todoes.forEach(todo => {
		localStorage.setItem(`todo-${todo.id}`, JSON.stringify(todo))
	})
}


;(function init () {
	projectsView.projectAddEvent.addListener(handleProjectAddEvent)
	projectsView.projectSelectEvent.addListener(handleProjectSelectEvent)
	projectsView.projectEditEvent.addListener(handleProjectEditEvent)
	projectsView.projectDeleteEvent.addListener(handleProjectDeleteEvent)

	todoesView.todoAddEvent.addListener(handleTodoAddEvent)
	todoesView.todoEditEvent.addListener(handleTodoEditEvent)
	todoesView.todoToggleStatusEvent.addListener(handleTodoToggleStatusEvent)
	todoesView.todoDeleteEvent.addListener(handleTodoDeleteEvent)


	document.querySelector('.toggle-side-menu').addEventListener('click', e => {
		document.querySelector('.toggle-side-menu').classList.toggle('closed')
		document.querySelector('.side-menu').classList.toggle('closed')
	})

	document.querySelector('.home-nav').addEventListener('click', () => {
		handleProjectSelectEvent(projectManager.homeProjectId)
	})

	const allProjects = projectManager.getAllProjects()

	if (todoesManager.isEmpty() && projectManager.getAllProjects().length === 1) {
		const todo = todoesManager.createWelcomeTodo(projectManager.getHomeProject().id)
		projectManager.addTodo(todo.id, todo.projectId)
	}

	projectsView.add(...allProjects)
	todoesView.addProject(...allProjects)
	handleProjectSelectEvent(projectManager.getActiveProject().id)
})()
