class Vector {
  /**
   * Vector for positioning
   * @param {number} x
   * @param {number} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    if (typeof vector === 'number') {
      return new Vector(this.x + vector, this.y + vector);
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  _add(vector) {
    this.x += vector.x === undefined ? vector : vector.x;
    this.y += vector.y === undefined ? vector : vector.y;
    return this;
  }

  subtract(vector) {
    if (typeof vector === 'number') {
      return new Vector(this.x - vector, this.y - vector);
    }
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  _subtract(vector) {
    this.x -= vector.x === undefined ? vector : vector.x;
    this.y -= vector.y === undefined ? vector : vector.y;
    return this;
  }

  divideBy(num) {
    return new Vector(this.x / num, this.y / num);
  }

  multiplyBy(num) {
    return new Vector(this.x * num, this.y * num);
  }
}

export default Vector;
