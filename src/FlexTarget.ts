import FlexSubject, { RelativeHeightFunction, RelativeWidthFunction } from './FlexSubject';
import FlexNode from './FlexNode';
import FlexContainer from './FlexContainer';
import FlexItem from './FlexItem';

export default class FlexTarget implements FlexSubject {
  private _children: FlexTarget[] = [];
  private _parent?: FlexTarget;

  // Layout results.
  private _x: number = 0;
  private _y: number = 0;
  private _w: number = 0;
  private _h: number = 0;

  // Specified coordinates and dimensions.
  private _sx: number = 0;
  private _sy: number = 0;
  private _sw: number = 0;
  private _sh: number = 0;

  private _optFlags: number = 0;

  private _funcX?: RelativeWidthFunction;
  private _funcY?: RelativeHeightFunction;
  private _funcW?: RelativeWidthFunction;
  private _funcH?: RelativeHeightFunction;

  private _visible: boolean = true;

  private _layout?: FlexNode;

  private recalc: number = 0;

  private hasUpdates: boolean = false;

  getChildren() {
    return this._children;
  }

  get layout(): FlexNode {
    this.ensureLayout();
    return this._layout!;
  }

  getLayout() {
    return this.layout;
  }

  get flex() {
    return this.layout.flex;
  }

  get flexItem() {
    return this.layout.flexItem;
  }

  private ensureLayout() {
    if (!this._layout) {
      this._layout = new FlexNode(this);
    }
  }

  hasFlexLayout() {
    return this._layout && this._layout.isEnabled();
  }

  triggerLayout() {
    this.setRecalc(256);
  }

  private triggerRecalcTranslate() {
    this.setRecalc(2);
  }

  private setRecalc(type: number) {
    this.recalc |= type;
    this.setHasUpdates();
  }

  private setHasUpdates() {
    let p: FlexTarget | undefined = this;
    while (p && !p.hasUpdates) {
      p.hasUpdates = true;
      p = p._parent;
    }
  }

  update() {
    if (this.recalc & 256) {
      this._layout!.layoutFlexTree();
    }

    if (this._optFlags && !this.hasFlexLayout()) {
      if (this._optFlags & 1) {
        const x = this._funcX!(this._parent!.getLayoutW());
        if (x !== this._x) {
          this._x = x;
          this.recalc |= 2;
        }
      }
      if (this._optFlags & 2) {
        const y = this._funcY!(this._parent!.getLayoutH());
        if (y !== this._y) {
          this._y = y;
          this.recalc |= 2;
        }
      }
      if (this._optFlags & 4) {
        const w = this._funcW!(this._parent!.getLayoutW());
        if (w !== this._w) {
          this._w = w;
          this.recalc |= 2;
        }
      }
      if (this._optFlags & 8) {
        const h = this._funcH!(this._parent!.getLayoutH());
        if (h !== this._h) {
          this._h = h;
          this.recalc |= 2;
        }
      }
    }

    if (this.recalc & 2) {
      this.onChangedLayout();
    }

    if (this.hasUpdates) {
      this.recalc = 0;
      this.hasUpdates = false;
      const children = this._children;
      if (children) {
        for (let i = 0, n = children.length; i < n; i++) {
          children[i].update();
        }
      }
    }
  }

  protected onChangedLayout() {
    // This is invoked when layout coordinates were changed.
  }

  get x() {
    if (this._funcX) {
      return this._funcX;
    } else {
      return this._sx;
    }
  }

  set x(v: number | RelativeWidthFunction) {
    if (FlexTarget.isFunction(v)) {
      this.funcX = v as RelativeWidthFunction;
    } else {
      this._disableFuncX();
      const dx = (v as number) - this._sx;
      this._sx = v as number;

      // No recalc is necessary because the layout offset can be updated directly.
      this._x += dx;
    }
  }

  getSourceFuncX() {
    return this._funcX;
  }

  set funcX(v: RelativeWidthFunction | undefined) {
    if (this._funcX !== v) {
      this._optFlags |= 1;
      this._funcX = v;
      this._x = 0;
      if (this.hasFlexLayout()) {
        this._layout!.forceLayout();
      } else {
        this.triggerRecalcTranslate();
      }
    }
  }

  private _disableFuncX() {
    this._optFlags = this._optFlags & (0xffff - 1);
    this._funcX = undefined;
  }

  get y() {
    if (this._funcY) {
      return this._funcY;
    } else {
      return this._sy;
    }
  }

  set y(v) {
    if (FlexTarget.isFunction(v)) {
      this.funcY = v as RelativeHeightFunction;
    } else {
      this._disableFuncY();
      const dy = (v as number) - this._sy;
      if (dy) {
        this._sy = v as number;

        // No recalc is necessary because the layout offset can be updated directly.
        this._y += dy;
      }
    }
  }

  getSourceFuncY() {
    return this._funcY;
  }

  set funcY(v: RelativeHeightFunction | undefined) {
    if (this._funcY !== v) {
      this._optFlags |= 2;
      this._funcY = v;
      this._y = 0;
      if (this.hasFlexLayout()) {
        this._layout!.forceLayout();
      } else {
        this.triggerRecalcTranslate();
      }
    }
  }

  private _disableFuncY() {
    this._optFlags = this._optFlags & (0xffff - 2);
    this._funcY = undefined;
  }

  get w() {
    if (this._funcW) {
      return this._funcW;
    } else {
      return this._sw;
    }
  }

  set w(v: number | RelativeWidthFunction) {
    if (FlexTarget.isFunction(v)) {
      this.funcW = v as RelativeWidthFunction;
    } else {
      this.disableFuncW();
      if (this._sw !== v) {
        this._sw = v as number;
        if (this.hasFlexLayout()) {
          this._layout!.updatedSourceW();
        } else {
          this._w = v as number;
          this.triggerRecalcTranslate();
        }
      }
    }
  }

  get h() {
    return this._h;
  }

  set h(v: number | RelativeHeightFunction) {
    if (FlexTarget.isFunction(v)) {
      this.funcH = v as RelativeHeightFunction;
    } else {
      this.disableFuncH();
      if (this._sh !== v) {
        this._sh = v as number;
        if (this.hasFlexLayout()) {
          this._layout!.updatedSourceH();
        } else {
          this._h = v as number;
          this.triggerRecalcTranslate();
        }
      }
    }
  }

  getSourceFuncW() {
    return this._funcW;
  }

  set funcW(v: RelativeWidthFunction | undefined) {
    if (this._funcW !== v) {
      this._optFlags |= 4;
      this._funcW = v;
      if (this.hasFlexLayout()) {
        this.layout.updatedSourceW();
      } else {
        this._w = 0;
        this.triggerRecalcTranslate();
      }
    }
  }

  private disableFuncW() {
    this._optFlags = this._optFlags & (0xffff - 4);
    this._funcW = undefined;
  }

  getSourceFuncH() {
    return this._funcH;
  }

  set funcH(v: RelativeHeightFunction | undefined) {
    if (this._funcH !== v) {
      this._optFlags |= 8;
      this._funcH = v;
      if (this.hasFlexLayout()) {
        this.layout.updatedSourceH();
      } else {
        this._h = 0;
        this.triggerRecalcTranslate();
      }
    }
  }

  private disableFuncH() {
    this._optFlags = this._optFlags & (0xffff - 8);
    this._funcH = undefined;
  }

  getParent() {
    return this._parent;
  }

  private setParent(p: FlexTarget | undefined) {
    if (this._parent !== p) {
      const prevParent = this._parent;
      this._parent = p;
      if (this._layout || (p && p.getLayout().isFlexEnabled())) {
        this.layout.setParent(prevParent, p);
      }

      if (prevParent) {
        prevParent.triggerRecalcTranslate();
      }
      if (p) {
        p.triggerRecalcTranslate();
      }
    }
  }

  setChildren(children: FlexTarget[]) {
    this._children = children;

    children.forEach(child => {
      child.setParent(this);
    });
  }

  get children() {
    return this._children;
  }

  addChild(child: FlexTarget) {
    this.addChildAt(child, this._children.length);
  }

  addChildAt(child: FlexTarget, index: number) {
    if (!this._children) this._children = [];
    this._children.splice(index, 0, child);
    child.setParent(this);
  }

  removeChildAt(index: number) {
    if (this._children) {
      const child = this._children[index];
      this._children.splice(index, 1);
      child.setParent(undefined);
    }
  }

  setLayoutCoords(x: number, y: number) {
    if (this._x !== x || this._y !== y) {
      this._x = x;
      this._y = y;
      this.triggerRecalcTranslate();
    }
  }

  setLayoutDimensions(w: number, h: number) {
    if (this._w !== w || this._h !== h) {
      this._w = w;
      this._h = h;

      this.triggerRecalcTranslate();
    }
  }

  get visible() {
    return this._visible;
  }

  set visible(v: boolean) {
    if (this._visible !== v) {
      this._visible = v;
      if (this.hasFlexLayout()) {
        this.layout.updateVisible();
      }
    }
  }

  isDisplayed() {
    return this._visible;
  }

  toJson(path: number[] = []): any {
    const layout = [this._x, this._y, this._w, this._h];
    const json = {
      path: '[' + path.join('][') + ']',
      layout: layout.join(' '),
      w: this.getLayoutW(),
      h: this.getLayoutH(),
      x: this.getLayoutX(),
      y: this.getLayoutY(),
      sw: this.getSourceW(),
      sh: this.getSourceH(),
      sx: this.getSourceX(),
      sy: this.getSourceY(),
      flex: this._layout && this._layout.flex ? FlexTarget.flexToJson(this._layout.flex) : false,
      flexItem: this._layout && this._layout.flexItem ? FlexTarget.flexItemToJson(this._layout.flexItem) : false,
      children: this._children.map((c, index) => c.toJson(path.concat([index]))),
    };

    return json;
  }

  static flexToJson(flex: FlexContainer) {
    return {
      direction: flex.direction,
      alignItems: flex.alignItems,
      alignContent: flex.alignContent,
      justifyContent: flex.justifyContent,
    };
  }

  static flexItemToJson(flexItem: FlexItem) {
    return {
      grow: flexItem.grow,
      shrink: flexItem.shrink,
      alignSelf: flexItem.alignSelf,
    };
  }

  toString() {
    const obj = this.toJson();
    return JSON.stringify(obj, null, 2);
  }

  getLocationString(): string {
    const i = this._parent ? this._parent._children.indexOf(this) : 'R';
    let str = this._parent ? this._parent.getLocationString() : '';
    str += '[' + i + ']';
    return str;
  }

  getSourceX() {
    return this._sx;
  }

  getSourceY() {
    return this._sy;
  }

  getSourceW() {
    return this._sw;
  }

  getSourceH() {
    return this._sh;
  }

  getLayoutX() {
    return this._x;
  }

  getLayoutY() {
    return this._y;
  }

  getLayoutW() {
    return this._w;
  }

  getLayoutH() {
    return this._h;
  }

  static isFunction(value: any) {
    return typeof value === 'function';
  }
}
