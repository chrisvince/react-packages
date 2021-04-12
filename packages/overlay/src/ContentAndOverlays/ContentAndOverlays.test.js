import React from 'react'
import { shallow } from 'enzyme'
import Component from '.'

describe('Basic tests', () => {
	it('renders without crashing', () => {
		shallow(<Component />)
	})
})
