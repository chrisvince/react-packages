export default (variantId, products) => products.find(product => (
	product.variants.findIndex(variant => variant.shopifyId === variantId) !== -1
))
