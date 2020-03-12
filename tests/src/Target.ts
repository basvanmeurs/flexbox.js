import Utils from './Utils';
import FlexTarget from '../../src/FlexTarget';

export default class Target extends FlexTarget {
  // Will contain the expected layout result while unit testing.
  public r: number[] = [0, 0, 0, 0];

  get flex() {
    return super.flex;
  }

  set flex(v: any) {
    Target.patch(this.layout.flex, v);
  }

  static patch(obj: any, settings: any) {
    for (const [key, value] of Object.entries(settings)) {
      obj[key] = value;
    }
  }

  get flexItem() {
    return super.flexItem;
  }

  set flexItem(v: any) {
    Target.patch(this.layout.flexItem, v);
  }

  get children() {
    return super.children;
  }

  set children(v: any[]) {
    this.setChildren(v);
  }

  setChildren(v: any[]) {
    const children = v.map(o => {
      if (Utils.isObjectLiteral(o)) {
        const c = new Target();
        Target.patch(c, o);
        return c;
      } else {
        return o;
      }
    });

    super.setChildren(children);
  }

  toJson(path: number[] = []): any {
    const json = super.toJson(path);

    if (this.r) {
      json.r = this.r.join(' ');
      let equals = true;
      for (let i = 0; i < 4; i++) {
        equals = equals && Math.abs(this.r[i] - json.layout[i]) < 0.1;
      }
      json.equals = equals ? 'equal' : 'not equal';
    }

    return json;
  }
}
