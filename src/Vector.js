/**
 *
 * Vector class for handling positions
 *
 */
function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.get = function get(axis) {
  return this[axis];
};

Vector.prototype.add = function add(vector) {
  if (typeof vector === 'number') {
    return new Vector(this.x + vector, this.y + vector);
  }
  return new Vector(this.x + vector.x, this.y + vector.y);
};

Vector.prototype._add = function _add(vector) {
  this.x += vector.x === undefined ? vector : vector.x;
  this.y += vector.y === undefined ? vector : vector.y;
  return this;
};

Vector.prototype.subtract = function subtract(vector) {
  if (typeof vector === 'number') {
    return new Vector(this.x - vector, this.y - vector);
  }
  return new Vector(this.x - vector.x, this.y - vector.y);
};

Vector.prototype._subtract = function _subtract(vector) {
  this.x -= vector.x === undefined ? vector : vector.x;
  this.y -= vector.y === undefined ? vector : vector.y;
  return this;
};

Vector.prototype.divideBy = function divideBy(num) {
  return new Vector(this.x / num, this.y / num);
};

Vector.prototype._divideBy = function _divideBy(num) {
  this.x /= num;
  this.y /= num;
  return this;
};

Vector.prototype.multiplyBy = function multiplyBy(num) {
  return new Vector(this.x * num, this.y * num);
};

Vector.prototype._multiplyBy = function _multiplyBy(num) {
  this.x *= num;
  this.y *= num;
  return this;
};

Vector.prototype.distanceTo = function distanceTo(vector) {
  const diff = vector.subtract(this);
  const { x } = diff;
  const { y } = diff;
  return Math.sqrt(x * x + y * y);
};

export default Vector;
