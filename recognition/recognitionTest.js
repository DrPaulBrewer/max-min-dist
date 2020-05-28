/* eslint "no-console":"off" */

const MaxMinDist = require("../index.js");

const totalCases = 1000;
const items = 200;

const success=new Array(6).fill(0);
for(let cases=0;cases<totalCases;cases++){
  const example = new MaxMinDist({
    create: true,
    dimensions: 20,
    items
  });
  const special1 = new Array(20).fill(0).map((v,j)=>(j/14));
  const special2 = new Array(20).fill(0).map((v,j)=>(Math.max(1.5-(j/10),0)));
  example.item.push(special1);
  example.item.push(special2);
  for(let j=2;j<=5;++j){
    const best = example.bestGuess(j);
    if(
      (best.result.indexOf(items)>=0) &&
      (best.result.indexOf(items+1)>=0)
    ) success[j]+=1;
  }
  if (cases%100===0) console.log(cases);
}

for(let j=2;j<=5;++j){
  console.log(`j=${j}`,((totalCases-success[j])/totalCases)+' failure rate to find two special charts');
}
