import csv

with open('precios.csv') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=',', quotechar='"')
    for row in spamreader:
        value = row[2]
        fecha = row[0]
        print(value)
        print(', '.join(row))
