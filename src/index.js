import { createProjectsManager } from './model-managers/projects-manager'
import { createTodoesManager } from './model-managers/todoes-manager'
import { createProjectsView } from './views/projects/index'
import { createTodoesView } from './views/todoes'



const projectsView = createProjectsView(document.querySelector('.side-menu'))
const projectManager = createProjectsManager()

const todoesView = createTodoesView(document.querySelector('.todoes-section'))
const todoesManager = createTodoesManager()




;(function init () {
	// dummyData(10, 10)

	projectManager.projectsChangedEvent.addListener(handleProjectsChangedEvent)
	todoesManager.todoesChangedEvent.addListener(handleTodoesChangedEvent)


	projectsView.projectAddEvent.addListener(handleProjectAddEvent)
	projectsView.projectDeleteEvent.addListener(handleProjectDeleteEvent)
	projectsView.projectEditEvent.addListener(handleProjectEditEvent)
	projectsView.projectSelectEvent.addListener(handleProjectSelectEvent)

	todoesView.todoAddEvent.addListener(handleTodoAddEvent)
	todoesView.todoDeleteEvent.addListener(handleTodoDeleteEvent)
	todoesView.todoEditEvent.addListener(handleTodoEditEvent)
	todoesView.todoToggleStatusEvent.addListener(handleTodoToggleStatusEvent)


	handleProjectsChangedEvent(projectManager.projects)
	handleTodoesChangedEvent()

	document.querySelector('.toggle-side-menu').addEventListener('click', e => {
		document.querySelector('.toggle-side-menu').classList.toggle('closed')
		document.querySelector('.side-menu').classList.toggle('closed')
	})

	document.querySelector('.home-nav').addEventListener('click', () => {
		handleProjectSelectEvent(projectManager.homeProjectId)
	})
})()


// handlers: projects
function handleProjectsChangedEvent (projects) {
	projectsView.render(projects)
	todoesView.projectsChanged(projects)
}

function handleProjectAddEvent (project) {
	projectManager.add(project)
}

function handleProjectDeleteEvent (projectId) {
	const projectTodoIds = projectManager.getTodoIdsOfProject(projectId)
	projectManager.delete(projectId)
	todoesManager.bulkDelete(projectTodoIds)
}

function handleProjectEditEvent (project) {
	projectManager.edit(project)
}

function handleProjectSelectEvent (projectId) {
	projectManager.setActiveProject(projectId)
	handleTodoesChangedEvent()
}


// handlers: todoes
function handleTodoesChangedEvent () {
	todoesView.render(
		todoesManager.getTodoesOfProjectId(projectManager.activeProjectId)
	)
}

function handleTodoAddEvent (todo) {
	todo = todoesManager.add(todo)
	projectManager.addTodo(todo.id, todo.projectId)
}

function handleTodoDeleteEvent (todoId) {
	projectManager.removeTodo(todoId, todoesManager.getTodo(todoId).projectId)
	todoesManager.delete(todoId)
}

function handleTodoEditEvent (todo) {
	const preProjectId = todoesManager.getTodo(todo.id).projectId
	const curProjectId = todo.projectId

	if (preProjectId !== curProjectId) {
		projectManager.moveTodoToProject(todo.id, preProjectId, curProjectId)
	}
	todoesManager.edit(todo)
}

function handleTodoToggleStatusEvent (todoId) {
	todoesManager.toggleTodoStatus(todoId)
}

function _dummyData (nProjects, nTodoes) {
	localStorage.removeItem('projects')
	localStorage.removeItem('todoes')

	const alphaNum = '0123456789abcdef'

	let projects = new Array(nProjects).fill(null).map(() => [])

	const todoes = new Array(nTodoes).fill(null).map((_, i) => {
		const date = new Date()
		date.setFullYear(date.getFullYear() + Math.trunc(Math.random() * nTodoes))

		const projectIndex = Math.trunc(Math.random() * nProjects)

		const todo = {
			id: `todo-${i}`,
			projectId: `project-${projectIndex}`,
			name: `todo-${i}.name`,
			description: `todo-${i}.description`,
			priority: Math.trunc(Math.random() * 3),
			dueDate: date,
			isDone: Math.random() < 0.2,
		}

		projects[projectIndex].push(todo.id)

		return todo
	})


	localStorage.setItem('todoes', JSON.stringify(todoes))

	projects = projects.map((projectTodoIds, i) => {
		const color = '#' + (
			new Array(6).fill(null).map(() => alphaNum[Math.trunc(Math.random() * 16)]).join('')
		)

		const project = {
			id: `project-${i}`,
			todoIds: projectTodoIds,
			name: i === 0 ? 'home' : `pro-${i}.name`,
			color,
			isHome: i === 0,
			isActive: i === 0,
		}

		return project
	})

	localStorage.setItem('projects', JSON.stringify(projects))
}
