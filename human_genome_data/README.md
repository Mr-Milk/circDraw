Important note:


1) Please unzip the gtf file to the file needed by annotation.py. Although the comprassed file is only 39M, the data after unzip has the size of 1.1G and need qualified server to process it! Current Vultr server with 2G RAM killed the process when maxread lines is above 500,000. To process all lines in the annotion file, simplely set the `maxread` argument in `readfile` function inside the main() call of 'annotation.py' file. This will change the 'gencode_annotation.json' file.

2) run `python3 annotation.py` to create the 'gencode_annotation.json' file, which is the data needed to be sink into database.

3) run `python3 connection.py` to updata the database;

4) if you want to select the attribution needed to save in the database, just list them inside the `table_columns` tuples and specify the mysql requirement of each column.


:) Good luck!
