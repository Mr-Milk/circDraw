import sys
import os


def main():
    try:
        # add annotation
        m1a_annotation_db()
        m6a_annotation_db()
        m5c_annotation_db()
        snp_annotation_db()


        # aggregate snp to each
        update_snp()
    except KeyboardInterrupt:
        print("KeyboardInterrupt")
        raise

conf = {'gene':['gencode.v19.annotation.gtf',
                'gene',
                'gencode.json gencode_length_.json table_column.txt tools_annotation',
                'raw_data/gene_annotation/'],

        'm1a':['RMBase_hg19_all_m1A_site.txt',
                'm1a',
                'RMBase_hg19_all_m1A_site.json RMBase_hg19_all_m1A_site_length_.json table_column.txt tools_m1a',
                'raw_data/m1A/'],

        'm6a':['RMBase_hg19_all_m6A_site.txt',
                'm6a',
                'RMBase_hg19_all_m6A_site.json RMBase_hg19_all_m6A_site_length_.json table_column.txt tools_m6a',
                'raw_data/m1A/'],

        'm5c':['RMBase_hg19_all_m5C_site.txt',
                'm5c',
                'RMBase_hg19_all_m5C_site.json RMBase_hg19_all_m5C_site_length_.json table_column.txt tools_m5c',
                'raw_data/m1A/'],

        'snp':['RMBase_hg19_all_snp_site.txt',
                'snp',
                'RMBase_hg19_all_snp_site.json RMBase_hg19_all_snp_site_length_.json table_column.txt tools_snp',
                'raw_data/SNP/'],
                }

def annotation2db(type):
    try:
        command_annotation = f'sudo python3 annotation.py {type[0]} {type[1]}'
        command_db = f'sudo python3 mysql_db.py admin_login.json -annotation {type[3]}'
        current_path = os.getcwd()
        os.chdir(type[4])
        os.system(command_annotation)
        os.system(command_db)
        os.chdir(current_path)
    except Exception as e:
        print(f"Failed: in {type[1]}_annotation_db")
        print("Error: ", e)

# ================== gene ============================
def gene_annotation_db():
    try:
        command_annotation = """sudo python3 annotation.py gencode.v19.annotation.gtf gene"""
        command_db = """sudo python3 mysql_db.py admin_login.json -annotation gencode.json gencode_length_.json table_column.txt tools_annotation"""
        current_path = os.getcwd()
        os.chdir("raw_data/gene_annotation/")
        os.system(command_annotation)
        os.system(command_db)
        os.chdir(current_path)
    except Exception as e:
        print("Failed: in m1a_annotation_db")
        print("Error: ", e)

# ================== m1a ============================
def m1a_annotation_db():
    try:
        command_annotation = """sudo python3 annotation.py RMBase_hg19_all_m1A_site.txt m1a"""
        command_db = """sudo python3 mysql_db.py admin_login.json -annotation RMBase_hg19_all_m1A_site.json RMBase_hg19_all_m1A_site_length_.json table_column.txt tools_m1a"""
        current_path = os.getcwd()
        os.chdir("raw_data/m1A/")
        os.system(command_annotation)
        os.system(command_db)
        os.chdir(current_path)
    except Exception as e:
        print("Failed: in m1a_annotation_db")
        print("Error: ", e)

# ================== m6a ============================
def m6a_annotation_db():
    try:
        command_annotation = """sudo python3 annotation.py RMBase_hg19_all_m6A_site.txt m6a"""
        command_db = """sudo python3 mysql_db.py admin_login.json -annotation RMBase_hg19_all_m6A_site.json RMBase_hg19_all_m6A_site_length_.json table_column.txt tools_m6a"""
        current_path = os.getcwd()
        os.chdir("raw_data/m6a/")
        os.system(command_annotation)
        os.system(command_db)
        os.chdir(current_path)
    except Exception as e:
        print("Failed: in m6a_annotation_db.")
        print("Error: ",e)


# ================== m5c ============================
def m5c_annotation_db():
    try:
        command_annotation = """sudo python3 annotation.py RMBase_hg19_all_m5C_site.txt m5c"""
        command_db = """sudo python3 mysql_db.py admin_login.json -annotation RMBase_hg19_all_m5C_site.json RMBase_hg19_all_m5C_site_length_.json table_column.txt tools_m5c"""
        current_path = os.getcwd()
        os.chdir("raw_data/m5c/")
        os.system(command_annotation)
        os.system(command_db)
        os.chdir(current_path)
    except Exception as e:
        print("Failed: in m5c_annotation_db")
        print("Error: ", e)

# ================== snp ============================
def snp_annotation_db():
    try:
        command_annotation = """sudo python3 annotation.py RMBase_hg19_all_mod_snp_disease.txt snp"""
        command_db = """sudo python3 mysql_db.py admin_login.json -annotation RMBase_hg19_all_mod_snp_disease.json RMBase_hg19_all_mod_snp_disease_length_.json table_column.txt tools_snp"""
        current_path = os.getcwd()
        os.chdir("raw_data/SNP/")
        os.system(command_annotation)
        os.system(command_db)
        os.chdir(current_path)
    except Exception as e:
        print("Failed: in snp_annotation_db")
        print("Error: ",e)


# ================== update_snp ============================
def update_snp():
    try:
        command1 = """sudo python3 mysql_db.py admin_login.json -snp_update tools_m1a tools_snp m1a"""
        command2 = """sudo python3 mysql_db.py admin_login.json -snp_update tools_m6a tools_snp m6a"""
        command3 = """sudo python3 mysql_db.py admin_login.json -snp_update tools_m5c tools_snp m5c"""
        current_path = os.getcwd()
        os.chdir("process_pkg/")
        os.system(command1)
        os.system(command2)
        os.system(command3)
        os.chdir(current_path)
    except Exception as e:
        print("Failed: in update_snp")
        print("Error: ",e)

# ================== add_id ============================
def add_id():
    try:
        command1 = """sudo python3 mysql_db.py admin_login.json -add_id tools_m1a tools_m6a tools_m5c"""
        current_path = os.getcwd()
        os.chdir("process_pkg/")
        os.system(command1)
        os.chdir(current_path)
        print("Success: Add_id success! :)")
    except Exception as e:
        print("Failed: in add_id")
        print("Error: ",e)



def add_gene_species():
    try:
        command = """sudo python3 mysql_db.py admin_login.json -add tools_annotation"""
        current_path = os.getcwd()
        os.chdir("process_pkg/")
        os.system(command)
        os.chdir(current_path)
        print("Success: Add_species to annotation success! :)")
    except Exception as e:
        print("Failed: in add_id")
        print("Error: ",e)




def get_input_value(sys_input):
    """Sys_input is exact the same as sys.argv, return dict contain parameters and lists of values of that parameter. Default is stored by {'default': [default_1, default_2...]}"""
    args = {}
    parameter_now = None
    obligated = True
    default = []
    sys_input = sys_input[1:]
    for i in range(len(sys_input)):

        if sys_input[i][0] == '-':
            obligated = False
            parameter_now = sys_input[i][1:]
            # error when parameter_now is 'default'
            if parameter_now == 'default':
                raise ValueError("You have '-default' in your command line input, please include them without '-default'")
            args[parameter_now] = []
        elif obligated:
            default.append(sys_input[i])
        else:
            args[parameter_now].append(sys_input[i])
    re = dict({'default': default}, **args)
    return re


def get_parameter_or_None(dic, para_name):
    if para_name in dic.keys():
        return dic[para_name]
    else:
        return None



if __name__ == '__main__':
    paras = get_input_value(sys.argv)
    update_snp_= get_parameter_or_None(paras, 'update_snp')
    addid = get_parameter_or_None(paras, 'add_id')
    annotation = get_parameter_or_None(paras, 'annotation')
    add_species = get_parameter_or_None(paras, 'add_species')

    if addid == [] or addid:
        add_id()

    if annotation:
        print("annotation: ",annotation)
        if 'm1a' in annotation:
            m1a_annotation_db()
        if 'm6a' in annotation:
            print("M6A in")
            m6a_annotation_db()
        if 'm5c' in annotation:
            m5c_annotation_db()
        if 'snp' in annotation:
            snp_annotation_db()
        if 'gene' in annotation:
            gene_annotation_db()
    if update_snp_ or update_snp_ == []:
        update_snp()
    if add_species or add_species == []:
        add_gene_species()
