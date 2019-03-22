# Extract info needed




# loop
def read_file



def main():
    login_file_name = 'admin_login.json'
    annotation = True
    add = True
    scale = True
    gene_wiki = True

    # initial connection
    cnx, cursor = connect_to_db(login_file_name)


    # insert
    # data_file_name_annotation = 'test.json'
    data_file_name_annotation = 'gencode_annotation.json'
    length_info_name_annotation = 'gencode_length_annotation.json'
    table_columns_annotation = ("gene_type VARCHAR(50) NOT NULL","gene_name VARCHAR(200) NOT NULL","chr_ci VARCHAR(50) NOT NULL", "gene_start INT NOT NULL", "gene_end INT NOT NULL", "gene_id VARCHAR(200) NOT NULL")
    table_name_annotation = "tools_annotation"
    if annotation:
        load_and_insert(cnx, cursor, data_file_name_annotation, table_columns_annotation, table_name_annotation, length_info_name_annotation)
        cnx.commit()

    # add species info
    if add:
        add_column(cnx, cursor, table_name_annotation, ["species VARCHAR(300) NOT NULL"], ["'human'"])
        cnx.commit()
    # create scale(min start, max end) table
    table_name_scale = "tools_scalegenome"
    table_columns_scale = ("species VARCHAR(300) NOT NULL", "chr_ci VARCHAR(30) NOT NULL", "gene_min_start INT NOT NULL", "gene_max_end INT NOT NULL")
    if scale:
        toos_scale(cnx, cursor, table_name_scale, table_name_annotation, table_columns_scale, "chr_ci", ["gene_end", "gene_max_end"], ["gene_start", "gene_min_start"])
        cnx.commit()
    if gene_wiki:
        value_pairs = [
            ["'chr1'",  249250621],
            ["'chr2'",  243199373],
            ["'chr3'", 198022430],
            ["'chr4'",  191154276],
            ["'chr5'", 180915260],
            ["'chr6'", 171115067],
            ["'chr7'", 159138663],
            ["'chr8'", 146364022],
            ["'chr9'", 141213431],
            ["'chr10'", 135534747],
            ["'chr11'", 135006516],
            ["'chr12'", 133851895],
            ["'chr13'", 115169878],
            ["'chr14'", 107349540],
            ["'chr15'", 102531392],
            ["'chr16'",  90354753],
            ["'chr17'", 81195210],
            ["'chr18'", 78077248],
            ["'chr19'", 59128983],
            ["'chr20'", 63025520],
            ["'chr21'", 48129895],
            ["'chr22'", 51304566],
            ["'chrX'", 155270560],
            ["'chrY'", 59373566],
            ["'chrM'", 16023]
        ]
        add_one_column_update(cnx, cursor, table_name_scale, "genelens_wiki INT", value_pairs)
        add_one_column(cnx, cursor, table_name_scale, "id INT")


    commit_db(cnx, cursor)


if __name__ == '__main__':
   main()
