const base = 36
const baseAlpha = '0123456789abcdefghijklmnopqrstuvwxyz'

const numberLength = 8 // '00000000' => 'ffffffff'

function generateId () {
	return new Array(numberLength)
		.fill(null)
		.map(() => {
			const k = Math.trunc(Math.random() * base)
			return baseAlpha[k]
		})
		.join('')
}

export { generateId }
