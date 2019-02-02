import json




class Extractor:
    """A parent class for Extracting action from one line file"""
    def __init__(self, line):
        self.line = line

    def human_genome(self):
        """Costomized extractor for human genome annotation"""
        result = {}
        return result

    def m6A(self):
        """Costomized extractor for human genome annotation"""
        result = {}
        return result

    def

class DBoperation:
    """A parent class for DataBase operation action, including insertion, deletion, droping, and updating"""
    def __init__(self, phased_line, db_connector):
        self.phased_line = phased_line
        self.db_connector = db_connector





class LoopControl:
    """control agent in every loop"""
    def __init__(self, line, db_connector):
        self.extractor = Extractor(line)
        self.connector = db_connector
    def run(self):




