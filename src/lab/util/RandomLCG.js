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

goog.provide('myphysicslab.lab.util.RandomLCG');

goog.require('myphysicslab.lab.util.Random');
goog.require('myphysicslab.lab.util.UtilityCore');

goog.scope(function() {

var UtilityCore = myphysicslab.lab.util.UtilityCore;

/** Pseudo-random number generator using a Linear Congruential Generator (LCG).

This class is designed to give same numbers in both Java and Javascript, so that
tests using this class will have the same results. In Java we use floating point double
numbers to match how Javascript stores numbers.

Linear Congruential Generator (LCG)
-----------------------------------
From <http://en.wikipedia.org/wiki/Linear_congruential_generator>

>The generator is defined by the recurrence relation:

    X_{n+1} = ( a X_n + c ) mod m

> where `X` is the sequence of pseudorandom values, and

    m, 0 < m  – the 'modulus'
    a, 0 < a < m – the 'multiplier'
    c, 0 <= c < m – the 'increment'
    X_0, 0 <= X_0 < m – the 'seed' or 'start value'


Period Length
-------------
From <http://en.wikipedia.org/wiki/Linear_congruential_generator>

>Provided that the offset `c` is nonzero, the LCG will have a full period for all seed
values if and only if:

    c and m are relatively prime,
    a - 1 is divisible by all prime factors of m,
    a - 1 is a multiple of 4 if m is a multiple of 4.

>These three requirements are referred to as the Hull-Dobell Theorem. While LCGs are
capable of producing pseudorandom numbers which can pass formal tests for randomness,
this is extremely sensitive to the choice of the parameters `c`, `m`, and `a`.

The numbers chosen for RandomLCG satisfy the above conditions.

    m = 2 ^ 32 = 4,294,967,296

prime factors of the multiplier, `a`

    a = 1,664,525 = 5 x 5 x 139 x 479
    a - 1 = 1664524 = 2 x 2 x 71 x 5861
    c = 1,013,904,223 is a prime number

Floating Point Number
---------------------
The double number format allows exact representation of all integers with absolute
value less than 2^53. We need to avoid making numbers larger than 2^53 to avoid loss
of accuracy. Every number generated will be between 0 and `m-1`. The maximum number that
can be made in the algorithm is `(m-1)*a + c`. So we have to ensure that

    (m-1)*a + c < 2^53.

For the numbers chosen this works out to:

    (2^32-1)*1664525 + 1013904223 = 3.5745412314269e15

This is less than `2^53 = 9.00719925474099e15`, so we should stay within the range of
exact integers.

* @param {number=} seed starting seed number should be an integer from 0 to `m-1`;
*    otherwise it is manipulated to be in that range.  If not provided, then
*    the current time in milliseconds is used as the seed.
* @constructor
* @final
* @struct
* @implements {myphysicslab.lab.util.Random}
*/
myphysicslab.lab.util.RandomLCG = function (seed) {
  if (seed === undefined) {
    // use current time as seed.
    seed = goog.now();
  }
  // Ensure seed is an integer between 0 and modulus.
  seed = Math.floor(Math.abs(seed)) % RandomLCG.m;
  /**
  * @type {number}
  * @private
  */
  this.seed_ = seed;
  RandomLCG.checkSeed(this.seed_);
  // ensure that maximum number made during the algorithm < 2^53
  goog.asserts.assert((RandomLCG.m - 1) * RandomLCG.a + RandomLCG.c < Math.pow(2, 53));
};
var RandomLCG = myphysicslab.lab.util.RandomLCG;

if (!UtilityCore.ADVANCED) {
  /** @inheritDoc */
  RandomLCG.prototype.toString = function() {
    return 'RandomLCG{seed: '+this.seed_+'}';
  };
};

/**
* @type {boolean}
* @const
* @private
*/
RandomLCG.DEBUG_RANDOM = false;

/**
* @type {boolean}
* @const
* @private
*/
RandomLCG.DEBUG_RANDOM_DEEP = false;

/** the 'modulus'
* @type {number}
* @const
* @private
*/
RandomLCG.m = 0x100000000; // = 2^32

/** the 'multiplier'
* @type {number}
* @const
* @private
*/
RandomLCG.a = 1664525;

/** the 'increment' or 'offset'
* @type {number}
* @const
* @private
*/
RandomLCG.c = 1013904223;

/** Ensure seed is integer between 0 (inclusive) and modulus (exclusive)
* @param {number} seed
* @private
*/
RandomLCG.checkSeed = function(seed) {
  var err = 'random seed must be '
  if (seed < 0) {
    throw new Error(err + '0 or greater '+seed);
  }
  if (seed >= RandomLCG.m) {
    throw new Error(err + 'less than '+RandomLCG.m+' was '+seed);
  }
  if (seed != Math.floor(seed)) {
    throw new Error(err + 'an integer '+seed);
  }
};

/** @inheritDoc */
RandomLCG.prototype.getModulus = function() {
  return RandomLCG.m;
};

/** @inheritDoc */
RandomLCG.prototype.getSeed = function() {
  return this.seed_;
};

/** @inheritDoc */
RandomLCG.prototype.nextFloat = function() {
  var x = this.nextInt_();
  if (RandomLCG.DEBUG_RANDOM) {
    console.log(' '+x);
  }
  return x / (RandomLCG.m - 1);
};

/** @inheritDoc */
RandomLCG.prototype.nextInt = function() {
  var x = this.nextInt_();
  if (RandomLCG.DEBUG_RANDOM) {
    console.log(' '+x);
  }
  return x;
};

/**
@return {number} next the pseudo-random number
@private
*/
RandomLCG.prototype.nextInt_ = function() {
  var r = this.seed_ * RandomLCG.a + RandomLCG.c;
  var m = RandomLCG.m;
  this.seed_ = r - Math.floor(r/m)*m;
  RandomLCG.checkSeed(this.seed_);
  if (RandomLCG.DEBUG_RANDOM_DEEP) {
    var err = new Error();
    //console.log('RandomLCG.nextInt_ '+this.seed_);
    //console.log(err.stack);
  }
  return this.seed_;
};

/** @inheritDoc */
RandomLCG.prototype.nextRange = function(n) {
  var x = this.nextRange_(n);
  if (RandomLCG.DEBUG_RANDOM) {
    console.log(' '+x);
  }
  return x;
};

/** Returns random integer in range 0 (inclusive) to n (exclusive).
@param {number} n the limit of the range
@return {number} random integer in range 0 (inclusive) to n (exclusive)
@private
*/
RandomLCG.prototype.nextRange_ = function(n) {
  if (n <= 0)
    throw new Error('n must be positive');
  // We don't use modulu because of weak randomness in lower bits.
  var randomUnder1 = this.nextInt_() / RandomLCG.m;
  return Math.floor(randomUnder1 * n);
};

/** @inheritDoc */
RandomLCG.prototype.randomInts = function(n) {
  var set = new Array(n);
  var src = new Array(n);
  for (var i=0; i<n; i++) {
    set[i] = -1;
    src[i] = i;
  }
  var m = n;
  var setCount = 0;
  // move numbers from src to set, in random sequence
  do {
    var k = this.nextRange_(m--);
    // find the k'th number in src
    var srcCount = 0;
    for (var j=0; j<n; j++) {
      if (src[j]<0)
        continue;
      if (srcCount++ == k) {
        set[setCount++] = src[j];
        src[j] = -1;
        break;
      }
    }
  } while (set[n-1]<0);
  // for debugging:  report the set of numbers found
  if (RandomLCG.DEBUG_RANDOM) {
    var s = '';
    for (i=0; i<set.length; i++) {
      s += ' '+set[i];
    }
    console.log(s);
  }
  return set;
};

/** @inheritDoc */
RandomLCG.prototype.setSeed = function(seed) {
  RandomLCG.checkSeed(seed);
  this.seed_ = seed;
};

}); // goog.scope
