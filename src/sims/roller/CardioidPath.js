// Copyright 2016 Erik Neumann.  All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('myphysicslab.sims.roller.CardioidPath');

goog.require('myphysicslab.lab.util.UtilityCore');
goog.require('myphysicslab.sims.roller.AbstractPath');

goog.scope(function() {

var UtilityCore = myphysicslab.lab.util.UtilityCore;
var AbstractPath = myphysicslab.sims.roller.AbstractPath;
var NF = myphysicslab.lab.util.UtilityCore.NF;

/** ParametricPath that represents a cardiod, which is a vaguely heart shaped
figure. Currently set to not be a closed curve, with end points at the point (at the
origin) where the derivative is discontinuous. The discontinuous derivative causes
problems with RigidBody physics engine.

Cardioid equation:

    r = a (1 - cos theta)
    x = a cos t (1 + cos t)
    y = a sin t (1 + cos t)

or interchange x-y to rotate by 90 degrees.


* @param {number} radius
* @param {number=} start
* @param {number=} finish
* @param {boolean=} closedLoop
* @param {string=} name
* @param {string=} localName
* @constructor
* @final
* @struct
* @extends {AbstractPath}
*/
myphysicslab.sims.roller.CardioidPath = function(radius, start, finish,
      closedLoop, name, localName) {
  if (!goog.isNumber(start)) {
    start = -Math.PI;
  }
  if (!goog.isNumber(finish)) {
    finish = Math.PI;
  }
  if (!goog.isDef(closedLoop)) {
    closedLoop = false;
  }
  name = name || CardioidPath.en.NAME;
  localName = localName || CardioidPath.i18n.NAME;
  AbstractPath.call(this, name, localName, start, finish, closedLoop);
  /** @type {number}
  * @private
  * @const
  */
  this.a_ = radius;
};
var CardioidPath = myphysicslab.sims.roller.CardioidPath;
goog.inherits(CardioidPath, AbstractPath);

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  CardioidPath.prototype.toString = function() {
    return CardioidPath.superClass_.toString.call(this).slice(0, -1)
        + ', radius: '+NF(this.a_)+'}';
  };
};

/** @inheritDoc */
CardioidPath.prototype.getClassName = function() {
  return 'CardioidPath';
};

/** @inheritDoc */
CardioidPath.prototype.x_func = function(t) {
  var c = Math.cos(t);
  return this.a_ *Math.sin(t)*(1+c);
};

/** @inheritDoc */
CardioidPath.prototype.y_func = function(t) {
  var c = Math.cos(t);
  return -this.a_ *c*(1+c);
};

/** Set of internationalized strings.
@typedef {{
  NAME: string
  }}
*/
CardioidPath.i18n_strings;

/**
@type {CardioidPath.i18n_strings}
*/
CardioidPath.en = {
  NAME: 'Cardioid'
};

/**
@private
@type {CardioidPath.i18n_strings}
*/
CardioidPath.de_strings = {
  NAME: 'Cardioid'
};

/** Set of internationalized strings.
@type {CardioidPath.i18n_strings}
*/
CardioidPath.i18n = goog.LOCALE === 'de' ? CardioidPath.de_strings :
    CardioidPath.en;

}); // goog.scope
