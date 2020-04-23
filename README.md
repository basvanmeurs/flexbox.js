# Flexbox.js

[![Build Status](https://img.shields.io/travis/Planning-nl/flexbox.js/master.svg)](https://travis-ci.org/Planning-nl/flexbox.js) 
[![NPM Version](https://img.shields.io/npm/v/flexbox.js)](https://www.npmjs.com/package/flexbox.js)

> Javascript flexbox layouting engine

- [Example](https://github.com/Planning-nl/flexbox.js-example)

Flexbox.js is a layout engine based on the flexbox CSS3 web layout model.

It allows a layout tree to be constructed. This tree consists of nodes on which flex properties may be specified. The layout can be calculated by invoking the `update()` method on the flex root. After updating the layout, the layout results will be stored in `x, y, w, h` coordinates for the tree nodes.

## Usage
This module was designed to be used by other frameworks that require some form of layouting. It was originally developed
for the [tree2d](https://github.com/Planning-nl/tree2d/) framework.

This package contains the FlexTarget class, which can be used directly to construct a layout tree. Usually this will be sufficient. In other cases, where a *deeper* integration is required, it is also possible to provide your own implementation of FlexTarget by implementing the FlexSubject interface. The latter is used in the tree2d framework to be able to implement advanced performance optimizations.

## Create flex tree

```javascript
import { FlexTarget } from 'flexbox.js';
const root = new FlexTarget();
root.flex.enabled = true;
root.flex.direction = "column";
root.flex.alignItems = "stretch";
const item = new FlexTarget();
item.w = 100;
item.h = 100;
root.addChild(item);
const item2 = new FlexTarget();
item2.w = 50;
item2.h = 50;
root.addChild(item2);
```

## Update layout

You can perform a layout update calling the `update()` method on the **root** FlexTarget:
 
```javascript
root.update();
```

After such an update all layout coordinates and sizes will be updated.

## Mutations

```javascript
root.flex.direction = "row";
item.marginLeft = 20;
root.update();
```

After one or more layout properties have been mutated a layout update is required. The engine keeps track of all 
changes and will only update the parts that actually need to be updated. 

## FlexTarget properties
| Property | type | CSS equivalent | Notes |
| -------- | ---- | -------------- |-----|
| `x` | `number,(parentW: number => number)` |  | Offset |
| `y` | `number,(parentH: number => number)` |  |  |
| `w` | `number,(parentW: number => number)` |  | Size |
| `h` | `number,(parentH: number => number)` |  |  |
| `visible` | `true,false` |  | Invisible elements are ignored |
| `flex`| `FlexContainer` | | See below |
| `flexItem`| `FlexItem` | | See below |
| `skipInLayout`| `boolean` | | See below |

### Offsets
The x and y properties act as relative positions to the positions calculated by the flexbox layout engine.

### Fit to contents
When the width or height is set to the number 0, it will **fit to the contents** in that direction.

### Relative size
Relative functions may be set for x, y, w and h. In that case, the property will be recalculated from the parent's
layout width or height. This allows the user to use relative and calculated sizes.

### Skipping
The `skipInLayout` property can be used to **skip** the node while layouting. In this mode, flex behaves as if this skipped node was replaced by it's own children. This means that if the node itself was a flex item of a flex container, it's children will now become flex items of that flex container. 

It also affects relative layout function arguments (`w` or `h`). If the parent has  `skipInLayout` set to true, the grandparent's width and height will be used.

This feature was built to enable another framework to expose a flex layoutable tree that's not be necessarily one-to-one with the layout tree.

## FlexTarget methods
| Method | Description |
| ------ | ----------- |
| `hasFlexLayout() : boolean` | Returns true iff this is an enabled flex container and/or item |
| `addChild(child: FlexTarget)` | |
| `addChildAt(child: FlexTarget, index: number)` | |
| `removeChildAt(index: number)` | |
| `toString(): string` | Returns a string representation |
| `getChildren() : FlexTarget[]` | |
| `update() : void` | Updates the layout in this branch. Should only be called on the root node. |
| `getLayoutX() : number` | The layout result |
| `getLayoutY() : number` | The layout result |
| `getLayoutW() : number` | The layout result |
| `getLayoutH() : number` | The layout result |
| `onChangedLayout() : void` | Event that is called when the layout results are changed. |

## FlexContainer properties

| Property | type | CSS equivalent | Notes |
| -------- | ---- | -------------- |-----|
| `enabled` | `true,false` | | |
| `direction`| `'row','row-reverse','column','column-reverse'` | `flex-direction` | |
| `wrap` | `true,false` | `flex-wrap` | `wrap-reverse` is not supported |
| `alignItems` | `'flex-start','flex-end','center','stretch'` | align-items | `baseline` not supported |
| `alignContent` | `'flex-start','flex-end','center','space-between','space-around','space-evenly','stretch'` | align-content | |
| `justifyContent` | `'flex-start','flex-end','center','space-between','space-around','space-evenly'` | justify-content | |
| `padding` | `number` | `padding` | in pixels |
| `paddingTop` | `number` | `padding-top` | |
| `paddingLeft` | `number` | `padding-left` | |
| `paddingBottom` | `number` | `padding-bottom` | |
| `paddingRight` | `number` | `padding-right` | |

## FlexItem properties

| Property | type | CSS equivalent | Notes |
| -------- | ---- | -------------- |----|
| `enabled` | `true,false` | | If disabled, this item will not affect the flex layout and will be positioned absolutely |
| `grow`| `number` | `flex-grow` | |
| `shrink`| `number` | `flex-shrink` | The default value is 0 (in CSS it defaults to 1) |
| `alignSelf` | `'flex-start','flex-end','center','stretch'` | `align-self` | |
|  |  | `order` | Not supported |
|  |  | `flex-basis` | Not supported (behavior is always as `flex-basis:auto`) |
| `minWidth` | `number` | `min-width` | in pixels |
| `maxWidth` | `number` | `max-width` | in pixels |
| `minHeight` | `number` | `min-height` | in pixels |
| `maxHeight` | `number` | `max-height` | in pixels |
| `margin` | `number` | `margin` | in pixels |
| `marginTop` | `number` | `margin-top` | |
| `marginLeft` | `number` | `margin-left` | |
| `marginBottom` | `number` | `margin-bottom` | |
| `marginRight` | `number` | `margin-right` | |

