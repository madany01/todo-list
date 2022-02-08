import { createTodo } from '../models/todoes'

function createTodoesManager () {
	const todoesMap = new Map()

	function add (todoData) {
		const todo = createTodo(todoData)
		todoesMap.set(todo.id, todo)
		saveTodoIds()
		saveTodo(todo)
		return todo.asDataObject()
	}

	function isEmpty () {
		return todoesMap.size === 0
	}

	function createWelcomeTodo (projectId) {
		const todo = createTodo.createWelcomeTodo(projectId)
		todoesMap.set(todo.id, todo)
		saveTodoIds()
		saveTodo(todo)
		return todo.asDataObject()
	}

	function getTodo (id) {
		return todoesMap.get(id).asDataObject()
	}

	function getTodoes (ids) {
		return ids.map(id => todoesMap.get(id).asDataObject())
	}

	function delete_ (...todoIds) {
		todoIds.forEach(todoId => {
			todoesMap.delete(todoId)
			deleteTodo(todoId)
		})
		saveTodoIds()
	}

	function toggleTodoStatus (todoId) {
		const todo = todoesMap.get(todoId)
		todo.toggleDone()
		saveTodo(todo)
		return todo.asDataObject()
	}

	function edit (todoData) {
		const todo = todoesMap.get(todoData.id)
		todo.update(todoData)
		saveTodo(todo)
		return todo.asDataObject()
	}


	function saveTodo (...todos) {
		todos.forEach(todo =>
			localStorage.setItem(`todo-${todo.id}`, JSON.stringify(todo.toJson()))
		)
	}

	function saveTodoIds () {
		localStorage.setItem('todoIds', JSON.stringify(asArray().map(todo => todo.id)))
	}

	function deleteTodo (...ids) {
		ids.forEach(id =>
			localStorage.removeItem(`todo-${id}`)
		)
	}

	function load () {
		// storage: todoIds = [id1, id2, ...]
		// storage todo-1 => jsonRepresentation

		const todoIds = JSON.parse(localStorage.getItem('todoIds')) || []

		return todoIds
			.map(id => JSON.parse(localStorage.getItem(`todo-${id}`)))
			.map(jsonTodo => createTodo.fromJson(jsonTodo))
	}

	function asArray () {
		return [...todoesMap.values()]
	}

	;(function init () {
		load().map(todo => todoesMap.set(todo.id, todo))
	})()

	return {
		add,
		createWelcomeTodo,
		isEmpty,
		getTodo,
		getTodoes,
		delete: delete_,
		edit,
		toggleTodoStatus,
	}
}


export { createTodoesManager }
