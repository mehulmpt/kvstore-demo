const KVStore = require('./store')
const fs = require('fs')
const path = require('path')

describe('Store tests', () => {
	let store = null

	beforeEach(async () => {
		store = new KVStore()
	})

	test('Default store works', async () => {
		await store.init()
		fs.statSync(path.join(__dirname, 'store-info'))
	})
})
