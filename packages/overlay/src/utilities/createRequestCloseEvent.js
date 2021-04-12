import consts from '../consts'
const { OVERLAY_SHOULD_CLOSE_EVENT_TYPE } = consts

export default component => (
	new CustomEvent(OVERLAY_SHOULD_CLOSE_EVENT_TYPE, { detail: { component } })
)
