import csv
import time
import datetime
import urllib.request
import pandas as pd
import json

base_url = "https://www.cac.bcr.com.ar/es/api/prices/987/export?product=%d&type=any&date_start=2017-01-01&date_end=2030-01-01&period=day"

# Soja (product=13) Camara Arbitral de Cereales
# Trigo (8)
# Maiz (3)
# Girasol (9)
# Sorgo (6)




urllib.request.urlretrieve(base_url % 13 , "soja.xls")
urllib.request.urlretrieve(base_url % 8 , "trigo.xls")
urllib.request.urlretrieve(base_url % 3 , "maiz.xls")
urllib.request.urlretrieve(base_url % 9 , "girasol.xls")
urllib.request.urlretrieve(base_url % 6 , "sorgo.xls")

cultivos = ["soja","trigo","maiz","girasol","sorgo"]

for x in cultivos:
    read_file = pd.read_excel ("%s.xls" % x)
    # Write the dataframe object
    # into csv file
    read_file.to_csv("%s.csv" % x,index = None,header=True)

    with open('%s.csv' % x) as csvfile:
        spamreader = csv.reader(csvfile, delimiter=',', quotechar='"',skipinitialspace=True)
        next(spamreader)
        next(spamreader)
        next(spamreader)
        next(spamreader)                
        next(spamreader)
        response = []
        for row in spamreader:
            value = row[2]
            fecha = row[0][:10]
            #print(', '.join(row))
            try:
                r1 = value.replace("$","")
                r2 = r1.replace(",","")
                r3 = float(r2)
                # print(r3)
                # print(fecha)
                element = datetime.datetime.strptime(fecha,"%Y-%m-%d")
                tuple = element.timetuple()
                timestamp = time.mktime(tuple)
                line = [timestamp *1000,r3]
                response.append(line)
            except:
                next()
        # print(response)
        # Serializing json
        json_object = json.dumps(response, indent=4)
        print(json_object)
         
        # Writing to sample.json
        # with open("../../public/prices/car/%s/precio.json" % x, "w") as outfile:
        #    outfile.write(json_object)
            
