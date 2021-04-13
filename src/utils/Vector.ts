class Vector {
  x: number;

  y: number;

  /**
   * Vector for positioning
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(vector: Vector | number): Vector {
    if (typeof vector === 'number') {
      return new Vector(this.x + vector, this.y + vector);
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  _add(vector: Vector | number): Vector {
    this.x += typeof vector === 'number' ? vector : vector.x;
    this.y += typeof vector === 'number' ? vector : vector.y;

    return this;
  }

  subtract(vector: Vector | number): Vector {
    if (typeof vector === 'number') {
      return new Vector(this.x - vector, this.y - vector);
    }
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  _subtract(vector: Vector | number): Vector {
    this.x -= typeof vector === 'number' ? vector : vector.x;
    this.y -= typeof vector === 'number' ? vector : vector.y;
    return this;
  }

  divideBy(num: number): Vector {
    return new Vector(this.x / num, this.y / num);
  }

  multiplyBy(num: number): Vector {
    return new Vector(this.x * num, this.y * num);
  }
}

export default Vector;
