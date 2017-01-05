'use strict'

var solver = require('javascript-lp-solver');

var assert = require('assert');
var filename =  process.argv[2] || 'prevRodada0.json';
var fs = require("fs");

function Variable(record){
	this.jogador = 1;
	this.goleiro = 0;
	this.tecnico = 0;
	this.atacante = 0;
	this.meia = 0;
	this.lateral = 0;
	this.zagueiro = 0;
	this[record.posicao] = 1;
	this.pontos = record.variacao_prev;
	this.nome = record.nome;
	this.cartoletas = record.preco_num;
	this.pontos_reais = record.variacao_fut;
}

function calcSd(arr){
    let mean = calcMean(arr);
    let sum = arr
        .map(v => (v-mean)*(v-mean))
        .reduce((a, b) => a+b, 0);
    return Math.sqrt(sum / arr.length);
}

function calcMean(arr){
    let sum = arr.reduce((a, b) => a+b, 0);
    return sum / arr.length;
}


/*If the command line argument is a directory, then read predictions from all files in it, 
choose a team for each, and display actual profits, along with statistics 
Otherwise, open a single file with predictions, choose a team and display 
the chosen players along with other information */
if(fs.lstatSync(filename).isDirectory()){
    let files = fs.readdirSync(filename);
    
    let profits = files
        .map(file => choose(filename + '/' + file))
        .map(s => s.realProfit);
    console.log({
        profits: profits,
        meanProfit: calcMean(profits),
        standardDeviation: calcSd(profits)
    });
    
}else{
    let result = choose(filename);
    console.log(result);
}

/*
Choose the best possible team from a group of players with predictions about their future profit
Returns an object containing the chosen players, the predicted and actual profit
*/
function choose(filename){
    let data = require('./'+filename);
    let variables = data.map(function(record){return new Variable(record)});
    
    var binaries = {};
    for(let key in variables){
        binaries[key] = 1;
    }
	
	var constraints = {
		"jogador": {"max": 12},
		"goleiro": {"max": 1},
		"tecnico": {"max": 1},
		"zagueiro": {"max": 3},
		"lateral": {"max": 2},
		"meia": {"max": 3},
		"atacante": {"max": 2},
		"cartoletas": {"max": 100}
	}
	
	var i = 0;
	for(var key in variables){
		var each = variables[key];
		var j = 0;
		for(var key2 in variables){
			each['x'+j] = (i == j?1:0);
			j++;
		}
		constraints['x'+i] = {"max": 1};
		i++;
	}

	let model = {
		"optimize": "pontos",
        "opType": "max",
        "constraints": constraints,
        "variables": variables,
        "ints": binaries
	}
	
	let results = solver.Solve(model);
	let time = [];
	var ptos = 0;
	for(var k in results){
		if(k == 'result'||k == 'feasible')
			continue;
		if(results[k] == 1){
			ptos += variables[k].pontos_reais;
            let full = data[k*1];
            let summary = {
                'preco_num' : full.preco_num,
                'variacao_fut' : full.variacao_fut, 
                'variacao_prev' : full.variacao_prev, 
                'posicao' : full.posicao
            }
            time.push(summary);
		}
	}
    var finalResult = {
        team: time,
        predictedProfit : results.result,
        realProfit : ptos
    }
    return finalResult;
}
