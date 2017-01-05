var solver = require('javascript-lp-solver');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var collectionName =  process.argv[2] || 'previsoes';

function Variable(record){
	this.jogador = 1;
	this.goleiro = 0;
	this.tecnico = 0;
	this.atacante = 0;
	this.meia = 0;
	this.lateral = 0;
	this.zagueiro = 0;
	this[record.posicao] = 1;
	this.pontos = record.pontos_prev;
	this.nome = record.nome;
	this.cartoletas = record.preco_num;
	this.pontos_reais = record.pontos_fut;
}

function findVariables(cursor, db){
	var variables = {};
	var binaries = {};
    var rodada;
	cursor.each(function(err, doc){
		assert.equal(err, null);
		if(doc != null){
            rodada = doc.rodada_id;
			var v = new Variable(doc);
			var_id = v.nome + " " + doc.atleta_id;
			variables[var_id] = v;
			binaries[var_id] = 1;
		}else{
			db.close();
			main(variables, binaries, rodada);
		}
	});
}

function main(variables, binaries, rodada){
	
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

	model = {
		"optimize": "pontos",
        "opType": "max",
        "constraints": constraints,
        "variables": variables,
        "ints": binaries
	}
	
	results = solver.Solve(model);
	time = [];
	var ptos = 0;
	for(var k in results){
		if(k == 'result'||k == 'feasible')
			continue;
		if(results[k] == 1){
			ptos += variables[k].pontos_reais;
            time.push(k);
		}
	}
    var finalResult = {
        rodada: rodada,
        time: time,
        pontuacaoEstimada: results.result,
        pontuacaoReal: ptos
    }
    console.log(finalResult);
}

MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
  // Get the collection
  var col = db.collection(collectionName);
  var cursor = col.find({});
  findVariables(cursor, db);
});