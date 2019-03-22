import os


def main():
    # add annotation
    m1a_annotation_db()
    m6a_annotation_db()
    m5c_annotation_db()
    snp_annotation_db()


    # aggregate snp to each
    update_snp()


# ================== m1a ============================
def m1a_annotation_db():
    command_annotation = """python3 annotation.py RMBase_hg19_all_m1A_site.txt m1a"""
    command_db = """python3 mysql_db.py admin_login.json -annotation RMBase_hg19_all_m1A_site.json RMBase_hg19_all_m1A_site_length_.json table_column.txt tools_m1a"""
    current_path = os.getcwd()
    os.chdir("raw_data/m1A/")
    os.system(command_annotation)
    os.system(command_db)
    os.chdir(current_path)


def m6a_annotation_db():
    command_annotation = """python3 annotation.py RMBase_hg19_all_m6A_site.txt m6a"""
    command_db = """python3 mysql_db.py admin_login.json -annotation RMBase_hg19_all_m6A_site.json RMBase_hg19_all_m6A_site_length_.json table_column.txt tools_m6a"""
    current_path = os.getcwd()
    os.chdir("raw_data/m6A/")
    os.system(command_annotation)
    os.system(command_db)
    os.chdir(current_path)


def m5c_annotation_db():
    command_annotation = """python3 annotation.py RMBase_hg19_all_m5C_site.txt m5c"""
    command_db = """python3 mysql_db.py admin_login.json -annotation RMBase_hg19_all_m5C_site.json RMBase_hg19_all_m5C_site_length_.json table_column.txt tools_m5c"""
    current_path = os.getcwd()
    os.chdir("raw_data/m5c/")
    os.system(command_annotation)
    os.system(command_db)
    os.chdir(current_path)

def snp_annotation_db():
    command_annotation = """python3 annotation.py RMBase_hg19_all_mod_snp_disease.txt snp"""
    command_db = """python3 mysql_db.py admin_login.json -annotation RMBase_hg19_all_mod_snp_disease.json RMBase_hg19_all_mod_snp_disease_length_.json table_column.txt tools_snp"""
    current_path = os.getcwd()
    os.chdir("raw_data/SNP/")
    os.system(command_annotation)
    os.system(command_db)
    os.chdir(current_path)


def update_snp():
    command1 = """python3 mysql_db.py admin_login.json -snp_update tools_m1a tools_snp m1a"""
    command2 = """python3 mysql_db.py admin_login.json -snp_update tools_m6a tools_snp m6a"""
    command3 = """python3 mysql_db.py admin_login.json -snp_update tools_m5c tools_snp m5c"""
    current_path = os.getcwd()
    os.chdir("process_pkg/")
    os.system(command1)
    os.system(command2)
    os.system(command3)
    os.chdir(current_path)

if __name__ == '__main__':
    main()
