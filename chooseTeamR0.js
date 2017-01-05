'use strict'

var solver = require('javascript-lp-solver');

var assert = require('assert');
var filename =  process.argv[2] || './prevRodada0.json';

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

let data = require(filename);
let variables = data.map(function(record){return new Variable(record)});
main(variables, 0)

function main(variables, rodada){
    
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
        rodada: rodada,
        time: time,
        valorizacaoEstimada: results.result,
        valorizacaoReal: ptos
    }
    console.log(finalResult);
}
