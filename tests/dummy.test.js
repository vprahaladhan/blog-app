const dummy = require('../utils/list_helper').dummy

test ('dummy returns 1', () => {
    expect(dummy([])).toBe(1)
})