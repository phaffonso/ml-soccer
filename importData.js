
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

var dataArray = [];

var filenames = fs.readdirSync('rawData');

var teste = false;

for(filenum = 0; filenum < filenames.length; filenum++){
	var filename = 'rawData/' + filenames[filenum];
	var rawData = fs.readFileSync(filename, 'utf8');
	var r_nome = /a href="\/jogador\/.+?">(.+?)</;
	var nome = r_nome.exec(rawData)[1];
	var r_pos = /a href="\/posicao\/(.+?)"/g;
	var posicao = r_pos.exec(rawData)[1];
	var r =  /data.addRow\(\[(.+?)\]\)/g;
	var row = r.exec(rawData);
	var jogos_num = 0;
	var reg_anterior = null;
	while(row != null){
		params = row[1];
		// console.log(params);
		values = params.split(',');
		if(values[1] == 'true'){
			jogos_num ++;
		}
		var mando = [values[values.length - 1] == 'true'];
		var partida = values[values.length - 2].replace(/\'/g, '');
		var adversario = partida.split(" ")[mando? 0:2];
		var obj = {
			atleta_id: filenames[filenum].split(/[_\.]/g)[1] * 1,
			rodada_id: values[0].replace(/\'/g, '').substr(4) * 1,
			nome: nome,
			posicao: posicao,
			jogou: values[1] == 'true',
			pontos_num: values[2]* 1,
			media_num: values[3]* 1,
			preco_num: values[4]* 1,
			variacao_num: values[5]* 1,
			jogos_num: jogos_num,
			mando: mando,
			adversario: adversario,
			mando_fut: false,
			adversario_fut: 'null', 
			pontos_fut: values[2]* 1,
			variacao_fut: 0,
			vai_jogar: false
		};
		// console.log(obj);
		dataArray.push(obj);
		
		if(reg_anterior != null){
			reg_anterior.pontos_fut = obj.pontos_num;
			reg_anterior.variacao_fut = obj.variacao_num;
			reg_anterior.mando_fut = mando;
			reg_anterior.adversario_fut = adversario;
			reg_anterior.vai_jogar = obj.jogou;
		}
		
		reg_anterior = obj;
		
		row = r.exec(rawData);
	}
	if(teste){
		console.log(obj);
		break;
	}
}

MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
  // Get the collection
  var col = db.collection('rodadas');
  col.insertMany(dataArray, function(err, r) {
	if(err){
	  console.log(err);
	}else{
	  console.log(r);
	}
	// Finish up test
	db.close();
  });
});
