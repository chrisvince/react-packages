# @nmsp/web-font-status-observer

## Overview
`@nmsp/web-font-status-observer` is a function for observing web font status change. It does this by
observing classname changes on the `html` element (such as `wf-loading`, `wf-active`,
`wf-inactive`).

## Installation
`npm install @nmsp/web-font-status-observer`

## Usage
```
import webFontStatusObserver from '@nmsp/web-font-status-observer'

webFontStatusObserver(callback, options)
```

## Example
```
import webFontStatusObserver from '@nmsp/web-font-status-observer'

const options = {
	disconnectOnActive: true, // defaults to `true`
}

webFontStatusObserver(status => {
	console.log(status) // 'loading', 'active', 'inactive'
}, options)
```

## Parameters
| Option     | Description                                   |
|:-----------|:----------------------------------------------|
| `callback` | Fired with the web font status changes.       |
| `options`  | Options for webFontStatusObserver. See below. |

## Options
| Option           | Description                                                                                                                                                            |
|:---------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `disconnectOnActive` | Disconnects the observer when web font status is 'active'. This is useful because once a web font is loaded, observing is no longer necessary. Defaults to `true`. |
