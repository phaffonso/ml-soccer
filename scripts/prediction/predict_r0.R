#This script creates predictors for the first round
#Then creates files with the predicted results 
#(using k-folds - that means that a player's points aren't used to predict his points)
#k: number of folds
#sim_count: number of runs (and number of files to be created)
#On each run, the k folds are randomized again, generating different results

#Load input data
r0data = read.table("rodada0.csv")

k = 10
sim_count = 10
for(i_sim in 1:sim_count){
  predictions = data.frame()
  #create k folds
  folds = createFolds(data$variacao_fut, k, list=FALSE)
  for(i in 1:k){
    #Use fold indexes to split data between train and test
    testIndexes <- which(folds==i,arr.ind=TRUE)
    testData <- data[testIndexes, ]
    trainData <- data[-testIndexes, ]
    #model
    fit = rlm(variacao_fut ~ poly(preco_num, 6) + mando_fut, data=trainData)
    yy = predict(fit, newdata=testData)
    #calculate error - root mean square
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