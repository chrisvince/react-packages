import { shape, string } from 'prop-types'
import React, { useMemo } from 'react'
import shopifyBuy from 'shopify-buy'

import ContextProvider from '../ContextProvider'

const DISPLAY_NAME = 'Provider'

const PROP_TYPES = {
	credentials: shape({
		domain: string.isRequired,
		storefrontAccessToken: string.isRequired,
	}).isRequired,
}

const Component = props => {
	const {
		children,
		credentials: {
			domain,
			storefrontAccessToken,
		},
	} = props

	const client = useMemo(() => (
		shopifyBuy.buildClient({ domain, storefrontAccessToken })
	), [ domain, storefrontAccessToken ])

	return (
		<ContextProvider client={client}>
			{children}
		</ContextProvider>
	)
}

Component.displayName = DISPLAY_NAME
Component.propTypes = PROP_TYPES

export default Component
