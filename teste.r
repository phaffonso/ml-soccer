set.seed(21)
m = mtcars[sample(nrow(mtcars)),];
mtr = m[1:28,];
mtest = m[29:32,];
mod = lm(mpg ~ poly(wt, 1), data=mtr);

mse <- function(sm){
  return (sum(sm$residuals^2));
}

mod
  
mse(mod)
pred = predict(mod, mtest);
sum((pred - mtest$mpg)^2)


