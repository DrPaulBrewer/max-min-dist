/* eslint-env node, mocha */

const assert = require('assert');
require('should');
const MaxMinDist = require("../index.js");

describe('MaxMinDist', function(){
  let example1 = null;
  let example2 = null;
  before(function(){
    example1 = new MaxMinDist({data: [[1,0,1],[1,1,0]]});
    example2 = new MaxMinDist({
      create: true,
      dimensions: 50,
      items: 1000
    });
  });
  it('new MaxMinDist({data:[[1,0,1],[1,1,0]]}) behaves as expected', function(){
    const example = example1;
    assert.equal(typeof(example),'object');
    assert.equal(typeof(example.metric), 'function');
    example.metric([1,0,1],[1,1,0]).should.equal(2);
    example.requireMaxDistance();
    example.dist[0][1].should.equal(2);
    example.maxDist.should.deepEqual({a:0,b:1,value:2});
    example.distancesToSubset([0]).should.deepEqual([0,2]);
    example.distancesToSubset([1]).should.deepEqual([2,0]);
    example.distancesToSubset([0,1]).should.deepEqual([0,0]);
    example.greedyStep().should.equal(true);
    example.greedyStep().should.equal(false);
    example.greedyApproximation.should.deepEqual([0,1]);
    example.bestGuess(2).should.deepEqual({result: [0,1], value: 2});
  });
  it('new MaxMinDist({create:true, dimensions:50, items:1000}) creates random example with 1000 items and 50 dimensions', function(){
    const example = example2;
    example.dimensions.should.equal(50);
    assert(example.items===undefined);
    assert.equal(Array.isArray(example.item),true);
    example.item.length.should.equal(1000);
    example.item[0].length.should.equal(50);
    [].concat(...example.item).length.should.equal(50000);
    Math.max(...[].concat(...example.item)).should.be.below(1.0);
    Math.min(...[].concat(...example.item)).should.be.above(0.0);
  });
  it('example.distanceMatrix() creates symmetric distance matrix in example.dist', function(){
    const example = example2;
    example.requireDistanceMatrix();
    example.dist.length.should.equal(1000);
    example.dist[0].length.should.equal(1000);
    example.dist[999].length.should.equal(1000);
    // diagonal elements should all be zero
    for(let i=0;i<1000;++i){
      example.dist[i][i].should.equal(0);
    }
    // test that matrix is positive and symmetric
    for(let i=0;i<1000;++i){
      for(let j=0;j<i;++j){
        example.dist[i][j].should.be.above(0.0);
        example.dist[i][j].should.equal(example.dist[j][i]);
      }
    }
  });
  it('example.maxDist.value should be the highest of example.dist[i][j]', function(){
    const example = example2;
    example.requireMaxDistance();
    const l = example.item.length;
    const {a,b,value} = example.maxDist;
    example.dist[a][b].should.equal(value);
    let count = 0;
    for(let j=0;j<l;++j){
      for(let i=0;i<j;++i){
        count++;
        const d = example.dist[i][j];
        if (d>value)
          throw new Error(`dist[${i}][${j}]=${d} but maxDist.value=${value}`);
        if ((d===value) && ((i!==a) || (j!==b)))
          throw new Error(`unlikely duplicate maximum, ${i}-->${j} vs maxDist ${a}-->${b}`);
      }
    }
    count.should.equal(1000*999/2);
  });
  it('first call to example.greedyStep() should yield solution from max distance elements', function(){
    const example = example2;
    example.greedyStep().should.equal(true);
    const {a,b} = example.maxDist;
    example.greedyApproximation.should.deepEqual([a,b]);
  });
  it('example.bestGuess(2) should match maxDist solution', function(){
    const example = example2;
    example.requireMaxDistance();
    const {a,b,value} = example.maxDist;
    example.bestGuess(2).should.deepEqual({
      result: [a,b],
      value
    });
  });
  it('example.greedyStep() should yield true and solution should have 3 elements', function(){
    const example = example2;
    example.greedyStep().should.equal(true);
    example.greedyApproximation.length.should.equal(3);
  });

  it('example.bestGuess(3) should meet or exceed greedyStep solution', function(){
    const example = example2;
    example.bestGuess(3).value.should.not.be.below(
      example.subsetMetric(example.greedyApproximation)
    );
  });

  it('example.greedyStep() should yield true and solution should have 4 elements', function(){
    const example = example2;
    example.greedyStep().should.equal(true);
    example.greedyApproximation.length.should.equal(4);
  });

  it('example.bestGuess(4) should meet or exceed greedyStep solution', function(){
    const example = example2;
    example.bestGuess(4).value.should.not.be.below(
      example.subsetMetric(example.greedyApproximation)
    );
  });

  it('example.greedyStep() should yield true and solution should have 5 elements', function(){
    const example = example2;
    example.greedyStep().should.equal(true);
    example.greedyApproximation.length.should.equal(5);
  });

  it('example.bestGuess(5) should meet or exceed greedyStep solution', function(){
    const example = example2;
    example.bestGuess(5).value.should.not.be.below(
      example.subsetMetric(example.greedyApproximation)
    );
  });

});
