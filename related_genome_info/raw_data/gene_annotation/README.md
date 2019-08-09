## Automate database insertation
This part of code takes in charge of the implementation of tables in circDraw database that can't be changed by interaction.


1) run `python3 annotation.py` to create the `gencode_annotation.json` file, which is the data needed to sink into database.

2) run `python3 tools_mysql_setup.py` to insert data to the database;

3) if you want to select the attribution needed to save in the database, just list them inside the `table_columns` tuples and specify the mysql requirement of each column.

:) Good luck!
