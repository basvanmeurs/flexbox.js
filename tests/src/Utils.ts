export default class Utils {
  static isFunction(value: any) {
    return typeof value === 'function';
  }

  static isObject(value: any) {
    const type = typeof value;
    return !!value && (type === 'object' || type === 'function');
  }

  static isObjectLiteral(value: any) {
    return typeof value === 'object' && value && value.constructor === Object;
  }

  static equalValues(v1: any, v2: any) {
    if (typeof v1 !== typeof v2) return false;
    if (Utils.isObjectLiteral(v1)) {
      return Utils.isObjectLiteral(v2) && Utils.equalObjectLiterals(v1, v2);
    } else if (Array.isArray(v1)) {
      return Array.isArray(v2) && Utils.equalArrays(v1, v2);
    } else {
      return v1 === v2;
    }
  }

  static equalObjectLiterals(obj1: Record<string, any>, obj2: Record<string, any>) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }

    for (let i = 0, n = keys1.length; i < n; i++) {
      const k1 = keys1[i];
      const k2 = keys2[i];
      if (k1 !== k2) {
        return false;
      }

      const v1 = obj1[k1];
      const v2 = obj2[k2];

      if (!Utils.equalValues(v1, v2)) {
        return false;
      }
    }

    return true;
  }

  static equalArrays(v1: any[], v2: any[]) {
    if (v1.length !== v2.length) {
      return false;
    }
    for (let i = 0, n = v1.length; i < n; i++) {
      if (!this.equalValues(v1[i], v2[i])) {
        return false;
      }
    }

    return true;
  }

}
