import csv
import time
import datetime

with open('precios.csv') as csvfile:
    spamreader = csv.reader(csvfile, delimiter=',', quotechar='"',skipinitialspace=True)
    next(spamreader)
    response = []
    for row in spamreader:
        value = row[2]
        fecha = row[0]
        #print(', '.join(row))
        try:
            r1 = value.replace("$","")
            r2 = r1.replace(",","")
            r3 = float(r2)

            element = datetime.datetime.strptime(fecha,"%m/%d/%Y")
            tuple = element.timetuple()
            timestamp = time.mktime(tuple)
            line = [timestamp *1000,r3]
            response.append(line)
        except:
           next
    print(response)
        
