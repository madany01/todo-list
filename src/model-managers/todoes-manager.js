import { createEvent } from '../utils/events'
import { createTodo } from '../models/todoes'

function createTodoesManager () {
	const todoesMap = new Map()
	const todoesChangedEvent = createEvent()

	;(function init () {
		load().map(todo => todoesMap.set(todo.id, todo))
	})()

	function asArray () {
		return [...todoesMap.values()]
	}

	function load () {
		return (JSON.parse(localStorage.getItem('todoes')) || [])
			.map(jsonTodo => createTodo.fromJson(jsonTodo))
	}

	function save () {
		localStorage.setItem('todoes', JSON.stringify(asArray().map(todo => todo.toJson())))
	}

	function commit () {
		save()
		todoesChangedEvent.trigger(asArray())
	}

	function add (todo) {
		todo = createTodo(todo)
		todoesMap.set(todo.id, todo)
		commit()
		return todo.asViewModel()
	}

	function delete_ (todoId) {
		todoesMap.delete(todoId)
		commit()
	}

	function bulkDelete (todoIds) {
		todoIds.map(id => todoesMap.delete(id))
		commit()
	}

	function toggleTodoStatus (todoId) {
		todoesMap.get(todoId).toggleDone()
		commit()
	}

	function edit (todo) {
		todoesMap.get(todo.id).update(todo)
		commit()
	}

	return {
		todoesChangedEvent,
		add,
		delete: delete_,
		bulkDelete,
		toggleTodoStatus,
		edit,
		getTodo (id) {
			return todoesMap.get(id).asViewModel()
		},
		getTodoesOfProjectId (projectId) {
			return asArray()
				.filter(todo => todo.projectId === projectId)
				.map(todo => todo.asViewModel())
		},
	}
}


export { createTodoesManager }
