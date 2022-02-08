import { generateId } from '../utils/unique-number-generator'

function createTodo ({
	id = null,
	name,
	description,
	priority,
	dueDate,
	projectId,
	isDone = false,
}) {
	id = id ?? generateId()
	dueDate = new Date(dueDate)

	function toJson () {
		return {
			id, name, description, priority, dueDate, projectId
		}
	}

	function asDataObject () {
		return Object.freeze({
			id, name, description, priority, dueDate, projectId, isDone
		})
	}

	function toggleDone () {
		isDone = !isDone
	}

	function update (todoData) {
		name = todoData.name ?? name
		description = todoData.description ?? description
		priority = todoData.priority ?? priority
		projectId = todoData.projectId ?? projectId

		dueDate = new Date(todoData.dueDate ?? dueDate)
	}

	return {
		toJson,
		update,
		toggleDone,
		asDataObject,
		get id () { return id },
		get projectId () { return projectId },
	}
}

createTodo.fromJson = function (jsonTodo) {
	return createTodo(jsonTodo)
}

createTodo.createWelcomeTodo = function (projectId) {
	return createTodo({
		name: 'Create your first todo 😃',
		description: `
select project from the left side, or create new one,
then click on "Add todo",
specify todo name, description, project, priority, and date
		`.trim(),
		priority: 0,
		dueDate: new Date(),
		projectId,
		isDone: false,
	})
}

export { createTodo }
