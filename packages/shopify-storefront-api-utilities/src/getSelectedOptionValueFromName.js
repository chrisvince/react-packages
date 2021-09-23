export default (name, selectedOptions) => (
	selectedOptions.find(selectedOption => selectedOption.name === name)?.value
)
