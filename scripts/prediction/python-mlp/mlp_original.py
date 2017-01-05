from pymongo import MongoClient
import numpy as np

X = []
y = []
Xtest = []
ytest = []
documents = []

client = MongoClient()
db = client.test

cursor = db.rodadas.find({
    'rodada_id': {
        "$gte": 12,
        "$lte": 16
    },
    'vai_jogar': True
})
for document in cursor:
    mando = 0
    if(document['mando_fut'][0]):
        mando = 1
    input = [
        1,
        mando,
        document['media_num'],
        document['pontos_num'],
        document['variacao_num'],
        document['preco_num']
    ]
    output = [document['pontos_fut']]
    if(document['rodada_id'] == 16):
        Xtest.append(input)
        ytest.append(output)
        documents.append(document);
    else:
        X.append(input)
        y.append(output)

size=1480
X = np.array(X[1:size])
y = np.array(y[1:size])
Xtest = np.array(Xtest)
ytest = np.array(ytest)

def nonlin(x,deriv=False):
    if(deriv==True):
        return x*(1-x)

    return 1/(1+np.exp(-x))

np.random.seed(1)

n_in = len(X[0])
n_hid = 5;
n_out = len(y[0]);

# randomly initialize our weights with mean 0
syn0 = 2*np.random.random((n_in,n_hid)) - 1
syn1 = 2*np.random.random((n_hid,n_out)) - 1

for j in xrange(1000):
    # Feed forward through layers 0, 1, and 2
    l0 = X
    l1 = nonlin(np.dot(l0,syn0))
    l2 = np.dot(l1,syn1)

    # how much did we miss the target value?
    l2_error = y - l2
    
    if (j% 50) == 0:
        print "Error:" + str(np.mean(np.abs(l2_error)))
        l0t = Xtest
        l1t = nonlin(np.dot(l0t,syn0))
        l2t = np.dot(l1t,syn1)
        # how much did we miss the target value?
        l2_error_test = ytest - l2t
        print "Test                :" + str(np.mean(np.abs(l2_error_test)))
        
    # in what direction is the target value?
    # were we really sure? if so, don't change too much.
    l2_delta = l2_error #*nonlin(l2,deriv=True)

    # how much did each l1 value contribute to the l2 error (according to the weights)?
    l1_error = l2_delta.dot(syn1.T)
    
    # in what direction is the target l1?
    # were we really sure? if so, don't change too much.
    l1_delta = l1_error * nonlin(l1,deriv=True)

    syn1 += l1.T.dot(l2_delta * 0.001)
    syn0 += l0.T.dot(l1_delta * 0.001)

print syn0
print syn1

for i in range(len(documents)):
    l0 = Xtest
    l1 = nonlin(np.dot(l0,syn0))
    l2 = np.dot(l1,syn1)
    documents[i]['pontos_prev'] = l2[i][0]
    #print documents[i]

db.previsoes_mlp.delete_many({})
db.previsoes_mlp.insert_many(documents)