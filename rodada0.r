
require("caret")
require("boot")
require("MASS")
require("jsonlite")

r0data = read.table("rodada0.csv")

head(r0data)

data = subset(r0data, vai_jogar==TRUE)
plot(data$preco_num, data$variacao_fut)

casa = subset(data, mando_fut == TRUE)
fora = subset(data, mando_fut == FALSE)

attach(data)
fit = lm(variacao_fut ~ poly(preco_num, 4))
points(preco_num, fitted(fit), col='green', pch=20)
fit = rlm(variacao_fut ~ poly(preco_num, 6))
points(preco_num, fitted(fit), col='yellow', pch=20)


k = 10
sim_count = 10
for(i_sim in 1:sim_count){
  predictions = data.frame()
  folds = createFolds(data$variacao_fut, k, list=FALSE)
  for(i in 1:k){
    testIndexes <- which(folds==i,arr.ind=TRUE)
    testData <- data[testIndexes, ]
    trainData <- data[-testIndexes, ]
    fit = rlm(variacao_fut ~ poly(preco_num, 6) + mando_fut, data=trainData)
    yy = predict(fit, newdata=testData)
    mse = mean((yy - testData$variacao_fut) ^ 2)^(1/2)
    print(mse)
    #points(testData$preco_num, yy, col='yellow', pch=20)
    testData$variacao_prev <- yy
    predictions <- rbind(predictions, testData)
  }
  
  json <- toJSON(predictions)
  fn <- sprintf("prev%d.json", i_sim)
  write(json, fn) 
}


detach("data")

attach(casa)
fit = lm(variacao_fut ~ poly(preco_num, 4))
points(preco_num, fitted(fit), col='blue', pch=20)
detach("casa")

attach(fora)
fit = lm(variacao_fut ~ poly(preco_num, 4))
points(preco_num, fitted(fit), col='red', pch=20)
detach("fora")


