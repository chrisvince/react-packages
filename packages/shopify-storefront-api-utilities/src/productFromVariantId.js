export default (variantId, products) => products.find(product => (
	product.variants.find(variant => variant.id === variantId)
))
