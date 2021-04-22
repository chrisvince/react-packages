import { prop } from 'ramda'

// eslint-disable-next-line no-console
const notifyInvalidSlug = slug => console.error(`${slug} is not a valid design.`)

const initStyledVariant = (designs, options = {}) => ({ default: defaultSlug }) => {
	const { prop: propValue = 'variant' } = options
	const getDesignCss = slug => prop(slug, designs)
	const defaultCss = getDesignCss(defaultSlug)
	const defaultSlugIsInvalid = defaultSlug && !defaultCss

	if (defaultSlugIsInvalid) {
		notifyInvalidSlug(defaultSlug)
		return null
	}

	return ({ [propValue]: slug }) => {
		const css = getDesignCss(slug)
		const slugIsInvalid = slug && !css

		if (slugIsInvalid) {
			notifyInvalidSlug(slug)
			return null
		}

		if (!slug) {
			return defaultCss
		}

		return css
	}
}

export default initStyledVariant
