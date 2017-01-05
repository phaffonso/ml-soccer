from subprocess import call

f = open('links.txt')

for line in f:
    parts = line.split('/')
    fn = parts[4]+'_'+parts[5][:-1]
    call(['wget', line, '-O', 'rawData/' + fn + '.html'])
