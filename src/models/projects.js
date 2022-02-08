import { generateId } from '../utils/unique-number-generator'

function createProject ({
	id = null,
	name,
	color,
	isHome = false,
	isActive = false,
	todoIds = [],
}) {
	id = id === null ? generateId() : id
	todoIds = [...todoIds]

	function getTodoIds () {
		return [...todoIds]
	}

	function toggleActive () {
		isActive = !isActive
	}

	function addTodo (todoId) {
		todoIds.push(todoId)
	}

	function removeTodo (todoId) {
		todoIds.splice(todoIds.findIndex(someTodoId => someTodoId === todoId), 1)
	}

	function toJson () {
		return {
			id, name, color, todoIds, isHome, isActive
		}
	}

	function asDataObject () {
		return Object.freeze({
			id,
			name,
			color,
			todoIds,
			todoesCnt: todoIds.length,
			isHome,
		})
	}

	function update (projectData) {
		name = projectData.name ?? name
		color = projectData.color ?? color
	}


	return {
		toJson,
		update,
		getTodoIds,
		toggleActive,
		addTodo,
		removeTodo,
		asDataObject,
		get id () { return id },
		get isHome () { return isHome },
		get isActive () { return isActive },
		get name () { return name },
		get color () { return color },
	}
}

createProject.fromJson = function (json) {
	return createProject(json)
}

export {
	createProject
}
