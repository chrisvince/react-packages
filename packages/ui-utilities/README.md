# @nmsp/ui-utilities

## Overview
`@nmsp/ui-utilities` contains utilities for frontend design/UI.

## Installation
`npm install @nmsp/ui-utilities`

## Usage
Each utility function can be imported as a named import. For example,
`import { CSSViewportVariables } from '@nmsp/ui-utilities'`.

## Available Functions
### CSSViewportVariables
Sets CSS variables `--inner-height` and `--inner-width` to the `window` `innerHeight` and
`innerWidth` values as a `px` value. This component can simply be included in the app and applies
listeners to the window resize event and updates the CSS value accordingly. It also sets
`--initial-inner-width` and `--initial-inner-height` to the initial values.

### Why?
[The CSS `vh` unit can't be trusted](https://stackoverflow.com/questions/37112218/css3-100vh-not-constant-in-mobile-browser)

#### Syntax
Inside component, this should be called as high as possible to ensure the values are available in
CSS.
`<CSSViewportVariables />`

#### Parameters
none                                                                                                                             |
