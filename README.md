# max-min-dist

[![Build Status](https://travis-ci.org/DrPaulBrewer/max-min-dist.svg?branch=master)](https://travis-ci.org/DrPaulBrewer/max-min-dist)
[![Coverage Status](https://coveralls.io/repos/github/DrPaulBrewer/max-min-dist/badge.svg?branch=master)](https://coveralls.io/github/DrPaulBrewer/max-min-dist?branch=master) 

Generate approximate solutions to the max-min-dist dispersion problem. 

## Installation

```
npm i max-min-dist -S
```

## Dependencies

`@seregpie/bron-kerbosch` provides The Bron-Kerbosch algoritm used internally for finding maximal cliques.  

`prob.js` provides a random number generator based on Mersenne Twister.  It is used internally to uniformly remove
elements from maximal cliques that exceed the desired solution size.  

## Initialization

Depending on import style, choose one of these statements to import `class MaxMinDist`

`const MaxMinDist = require('max-min-dist');`

or

`import MaxMinDist from 'max-min-dist';`

## Usage


### Instantiation

An instance of MaxMinDist can be defined through an array of arrays, each inner array providing a location vector; 

```
example1 = new MaxMinDist({data: [[1,0,1],[1,1,0]]});
```

Here, `example1` is a MaxMinDist instance with locations `[1,0,1]` and `[1,1,0]`


or an instance can be created from random locations.

```
  example2 = new MaxMinDist({
    create: true,
    dimensions: 50,
    items: 1000
  });
```

Here `example2` is a MaxMinDist instance with 1000 locations.  Each location is a vector of dimension 50.
By default, created location vectors are generated from the uniform distribution on [0,1].

Optionally, a `metric` property may be specified in the constructor.  If no metric is specified, the squared euclidean distance is used.

A custom `metric` should have a function value with signature `function dist(x,y){...}` where `x` and `y` are Arrays that contain the x and y location vectors.

### Class Methods for Approximate Solutions

The greedy algorithm will provide an exact solution for size = 2. 

Because MaxMinDist is a combinatorial problem, a general method for exact brute force solution would not scale well and is not provided.

#### Greedy Algorithm

`.greedyGuess(size)` 

provides a greedy-algorithm guess for max-min-distance when locating `size` items among the location vectors.

The greedy algorithm finds the solution for size=2 exactly.  For size greater than 2, it begins with the solution for size 2 and adds 
locations that -- **at the time they are added** -- maximize the minimum separation.  This neglects the possibility of adding a location
that is not myopically optimal but is globally optimal when considered together with future choices. 

The return value is an Object `{result, value}` where `result` is an Array of location indexes and `value` is the smallest separation distance among locations in `result`. 

The greedy algorithm psuedocode for this class of problems is also referred to as `GMM` in Figure 1 (p.302) of Ravi, Rosenkrantz, and Tayi, cited below.


#### Iterative Heuristic 

`.betterGuess(size, _lowerBound)` 

provides a heuristic guess for max-min-dist by looking for a solution whose smallest separation distance strictly exceeds `_lowerBound`.

First, the greedy solution is examined.  If the greedy solution satisfies the lower bound, it is returned.  

Otherwise, the algorithm finds the graph of locations that are separated by a distance strictly greater than `_lowerBound`.  If there is no clique of the 
desired size, the algorithm terminates with a `null` solution.  One or more maximal cliques are found via the Bron-Kerbosh algorithm provided 
externally. These maximal cliques are pared down in size as neccessary by random culling.  The resulting set of cliques are scanned brute-force
for the maximum of the smallest-separation-distance.  The answer is returned in the `{result, value}` format detailed above.

#### Timed "Best Guess"

`.bestGuess(size, timeLimit=1500)`

Calls `.betterGuess()` repeatedly until the `timeLimit` is exhausted.  

The answer is returned in the `{result, value}` format detailed above.

Polling `Date.now()` occurs after each guess iteration, not an interrupt.  It may be that this function vastly exceeds the timeLimit.

## Tests

Mocha tests are provided and can be run with

```
npm test
```

### Further Reading

<pre>
Heuristic and Special Case Algorithms for Dispersion Problems
S. S. Ravi, D. J. Rosenkrantz and G. K. Tayi
Operations Research  42(2), Mar - Apr 1994, pp.299-310.
</pre>

<pre>
K-means clustering using Max-min distance measure
N. K. Visalakshi and J. Suguna
2009 Annual Meeting of the North American Fuzzy Information Processing Society
Cincinnati, OH, 2009
pp. 1-6 
doi: 10.1109/NAFIPS.2009.5156398.
</pre>


### Copyright

Copyright 2020 Paul Brewer, Economic and Financial Technology Consulting LLC

### License

The MIT license

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
