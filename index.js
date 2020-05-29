/* eslint "max-params":"off" */

const Prob = require('prob.js');
const bronKerboshAlgorithm = require('@seregpie/bron-kerbosch');
function typeCheck(fname, vname, val, expectedType) {
  const actualType = typeof(val);
  if (actualType !== expectedType) {
    throw new TypeError(`MaxMinDist:${fname} ${vname} should be an ${expectedType}, got ${actualType}`);
  }
}

function squaredDistance(x, y) {
  let sum = 0;
  for (let j = 0;j < x.length;++j) {
    const d = x[j] - y[j];
    sum += d * d;
  }
  if (typeof(sum) !== 'number' || Number.isNaN(sum))
    throw new Error("MaxMinDist: metric: invalid items");
  return sum;
}

function randomlyShrink(c,size){
  while(c.length>size){
    c.splice(Prob.uniform(0,c.length)(),1);
  }
  return c;
}

class MaxMinDist {
  constructor(options = {}) {
    if (options.metric) {
      this.metric = options.metric;
    } else {
      this.metric = squaredDistance;
    }
    if (options.create) {
      this.create(options);
    } else if (options.data) {
      this.item = options.data;
      this.dimensions = options.data[0].length;
    } else {
      throw new Error("MaxMinDist must set options.create=true or options.data=itemdata");
    }
  }

  create({ dimensions, items, generator = { name: 'uniform', param: [0, 1] } }) {
    typeCheck('create', 'dimensions', dimensions, 'number');
    typeCheck('create', 'items', items, 'number');
    this.dimensions = dimensions;
    this.item = [];
    const random = Prob[generator.name](...generator.param);
    while (this.item.length < items) {
      const newItem = new Array(dimensions).fill(0).map(random);
      this.item.push(newItem);
    }
  }

  distanceMatrix() {
    this.dist = [];
    const l = this.item.length;
    for (let i = 0;i < l;++i) {
      this.dist[i] = new Array(l).fill(0);
    }
    for (let i = 0;i < l;++i) {
      for (let j = 0;j < i;++j) {
        const d = this.metric(this.item[i], this.item[j]);
        this.dist[i][j] = d;
        this.dist[j][i] = d;
      }
    }
    return this.dist;
  }

  requireDistanceMatrix() {
    if (!Array.isArray(this.dist))
      this.distanceMatrix();
  }

  subsetMetric(subset) {
    const s = subset.slice(); // clobber-protection
    this.requireDistanceMatrix();
    const l = s.length;
    if (l < 2) return [];
    let smallestValue = +Infinity;
    for (let i = 0;i < (l - 1);++i) {
      const row = this.dist[s[i]];
      for (let j = i + 1;j < l;++j) {
        const d = row[s[j]];
        if (d < smallestValue) {
          smallestValue = d;
        }
      }
    }
    return smallestValue;
  }

  maxDistance() {
    this.requireDistanceMatrix();
    this.maxDist = {};
    let value = 0.0;
    let a = null;
    let b = null;
    const l = this.item.length;
    for (let j = 1;j < l;++j) {
      const row = this.dist[j];
      for (let i = 0;i < j;++i) {
        const d = row[i];
        if (d > value) {
          value = d;
          a = i;
          b = j;
        }
      }
    }
    this.maxDist = { a, b, value };
    return this.maxDist;
  }

  requireMaxDistance() {
    if (!this.maxDist)
      this.maxDistance();
  }

  distancesToSubset(subset) {
    const distances = [];
    const l = this.item.length;
    for (let i = 0;i < l;++i) {
      distances[i] = Math.min(...subset.map((s) => (this.dist[i][s])));
    }
    return distances;
  }

  greedyStep() {
    this.requireMaxDistance();
    if (this.greedyApproximation) {
      const distances = this.distancesToSubset(this.greedyApproximation);
      let biggest = null;
      let value = 0;
      const l = this.item.length;
      for (let i = 0;i < l;++i)
        if (distances[i] > value) {
          value = distances[i];
          biggest = i;
        }
      if (biggest !== null) {
        this.greedyApproximation.push(biggest);
        return true;
      }
      return false;
    }
    this.greedyApproximation = [this.maxDist.a, this.maxDist.b];
    return true;
  }

  distantPairs(lowerBound){
    const pairs = [];
    const l = this.item.length;
    for(let i=0;i<l;++i){
      for(let j=i+1;j<l;++j){
        if (this.dist[i][j]>lowerBound)
          pairs.push([i,j]);
      }
    }
    return pairs;
  }

  greedyGuess(size){
    while(!this.greedyApproximation || (this.greedyApproximation.length<size))
      this.greedyStep();
    const result = this.greedyApproximation.slice(0,size);
    const value = this.subsetMetric(result);
    return { result, value };
  }

  betterGuess(size, lowerBound) {
    if (size===2){
      // greedy is optimal for size=2
      const best2 = this.greedyGuess(2);
      if (+lowerBound>best2.value) return null;
      return best2;
    }
    if ((size<2) || (size > this.item.length))
      throw new RangeError("MaxMinDist: requested subset size out of range");
    const greedyLowerBound = this.greedyGuess(size).value;
    const pairLowerBound = Math.max(+lowerBound,+greedyLowerBound);
    const pairs = this.distantPairs(pairLowerBound);
    if ((pairs.length)<(size/2)) return null;
    const cliques =
      bronKerboshAlgorithm(pairs)
      .filter((c)=>(c.length>=size))
      .map((c)=>(c.slice()))
      .map((c)=>(c.sort((a,b)=>(+a-b))))
      .map((c)=>((c.length===size? c : randomlyShrink(c,size))));
    if (!cliques || cliques.length===0) return null;
    let bestClique=0;
    let value = this.subsetMetric(cliques[0]);
    for(let i=1;i<cliques.length;++i){
      const d = this.subsetMetric(cliques[i]);
      if (d>value) {
        value = d;
        bestClique = i;
      }
    }
    const result = cliques[bestClique];
    return { result, value };
  }

  bestGuess(size, timeLimit=1500){
    const t0 = Date.now();
    const history = [];
    let guess = this.greedyGuess(size);
    if (size===2) return guess;
    history.push(guess);
    while(
      ((Date.now()-t0)<timeLimit) &&
      (guess = this.betterGuess(size,guess.value))
    ){
      history.push(guess);
    }
    return history.pop();
  }

}

module.exports = MaxMinDist;
