#This script fits first round profits using linear models
#And plots the outputs of these models, along with input data
#No cross validation is used

require("caret")
require("MASS")
require("jsonlite")

r0data = read.table("r0data.txt")

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
detach("data")

attach(casa)
fit = lm(variacao_fut ~ poly(preco_num, 4))
points(preco_num, fitted(fit), col='blue', pch=20)
detach("casa")

attach(fora)
fit = lm(variacao_fut ~ poly(preco_num, 4))
points(preco_num, fitted(fit), col='red', pch=20)
detach("fora")


