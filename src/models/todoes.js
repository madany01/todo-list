import { generateId } from '../utils/unique-number-generator'

function createTodo ({
	id = null, name, description, priority, dueDate, projectId, isDone = false
}) {
	id = id ?? generateId()
	dueDate = new Date(dueDate)

	function toJson () {
		return {
			id, name, description, priority, dueDate, projectId
		}
	}

	function asViewModel () {
		return {
			id, name, description, priority, dueDate, projectId, isDone
		}
	}

	function toggleDone () {
		isDone = !isDone
	}

	function update (todoData) {
		name = todoData.name ?? name
		description = todoData.description ?? description
		priority = todoData.priority ?? priority
		dueDate = new Date(todoData.dueDate ?? dueDate)
		projectId = todoData.projectId ?? projectId
	}

	return {
		toJson,
		update,
		toggleDone,
		asViewModel,
		get id () { return id },
		get projectId () { return projectId },
	}
}

createTodo.fromJson = function (jsonTodo) {
	return createTodo(jsonTodo)
}

export { createTodo }
