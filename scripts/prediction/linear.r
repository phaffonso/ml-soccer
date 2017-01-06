#This is an old script, mostly useless
#Reads data from mongodb, creates a model based on the
#first n-1 rounds, then predicts the results of round n
#and inserts the results in a different collection in mongodb

library(rmongodb)

rodada_min <- 12
rodada_max <- 16
args <- commandArgs(trailingOnly=TRUE)
if(length(args) == 2){
  rodada_min <- as.numeric(args[1])
  rodada_max <- as.numeric(args[2])
}

mongo_con = mongo.create();
if(mongo.is.connected(mongo_con) == TRUE) {
  col <- "test.rodadas";
  query <- list("rodada_id" = list("$gte" = rodada_min, "$lte" = (rodada_max - 1)), "vai_jogar" = TRUE);
  mtr <- mongo.find.all(mongo_con, col, query=query, data.frame = TRUE);
  query2 <- list("rodada_id" = list("$eq" = rodada_max), "vai_jogar" = TRUE);
  mtest <- mongo.find.all(mongo_con, col, query=query2, data.frame = TRUE);
}

n = nrow(mtest);

set.seed(21)
#m = mydata[sample(nrow(mydata)),];
mod_pontos = lm(pontos_fut ~ mando_fut * media_num * pontos_num, data=mtr);
mod_pontos
pred = predict(mod_pontos, mtest);
mean(abs(pred - mtest$pontos_fut))
mean(abs(mtest$pontos_fut - mean(mtr$pontos_fut)))

mtest$pontos_prev = pred
mongo.remove(mongo_con, "test.previsoes");
mongo.insert.batch(mongo_con, "test.previsoes", mongo.bson.from.df(mtest));

# mod_preco = lm(variacao_fut ~ variacao_num + preco_num + media_num, data=mtr)
# mod_preco
# pred = predict(mod_preco, mtest);
# mean(abs(pred - mtest$variacao_fut)^2)
# mean(abs(mtest$variacao_fut - mean(mtr$variacao_fut))^2)
# 
# mse <- function(sm){
#   return (sum(sm$residuals^2));
# }
# 
# mse(mod_pontos)
