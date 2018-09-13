

info_needed = ['circRNA_ID', 'chr', 'circRNA_start', 'circRNA_end']




def handle_uploaded_file(f, filter_lst=info_needed):
	lines = []
	f_iter = iter(f)
	header = next(f_iter).decode("utf-8").split("\t")
	for line in f_iter:
		line_sep = line.decode().split('\t')
		line_sep, head = fil_lst(line_sep, header, filter_lst)
		lines.append(RNAob(head, line_sep))
	header_ob = Header(head)
	return header_ob, lines



def fil_lst(line_lst, header, filter_lst):
	lst = []
	head = []
	for i in range(len(header)):
		if header[i] in filter_lst:
			lst.append(line_lst[i])
			head.append(header[i])
	return lst, head



def RNAob(header, data_lst):
	ob = {}
	if len(header) == len(data_lst):
		for i in range(len(header)):
			if header[i] == 'chr':
				header[i] = 'chr_ci'
			header[i] = noslash(nohash(header[i]))
			if header[i] == 'junction_reads_ID':
				ob[str(header[i])] = data_lst[i][:-2]
			else:
				ob[str(header[i])] = data_lst[i]
		return ob
	else:
		return {"NO": [header, data_lst]}


def nohash(str):
	if str[0] != '#':
		return str
	else:
		return nohash(str[1:])


def noslash(str):
	if str == '':
		return str
	elif str[0] == '\n':
		return noslash(str[1:])
	else:
		return ''.join([str[0], noslash(str[1:])])




class Header:
	def __init__(self, lst):
		name = "-".join(lst)
		self.lst = lst
		self.name = name
	def __repr__(self):
		return self.name



# import pandas as pd
# """
# Front end need:
# 	circRNA_ID


# """
# def handle_uploaded_file(f):
# 	"""
# 	df = pd.read_csv(f, sep="\t", encoding='utf-8')
# 	lst_ob = [0]*len(df)
# 	for index, row in df.iterrows():
# 		lst_ob[index] = RNA(row)
# 	return lst_ob
# 	"""
# 	lines = []
# 	f_iter = iter(f)
# 	header = next(f_iter)
# 	header_ob = Header(header.decode("utf-8").split("\t"))
# 	for line in f_iter:
# 		line_sep = line.decode().split('\t')
# 		lines.append(RNA(line_sep))
# 	return header_ob, lines



# def get_circRNA_ID(lst):
# 	return lst[0]

# def get_chr(lst):
# 	return lst[1]

# def get_circRNA_start(lst):
# 	return lst[2]

# def get_circRNA_end(lst):
# 	return lst[3]

# def get_junction_reads(lst):
# 	return lst[4]

# def get_non_junction_reads(lst):
# 	return lst[6]

# def get_junction_reads_ratio(lst):
# 	return lst[7]

# def get_circRNA_type(lst):
# 	return lst[8]

# def get_gene_id(lst):
# 	return lst[9]

# def get_junction_reads_ID(lst):
# 	return lst[10]


# class RNA:
# 	def __init__(self, lst):
# 		self.circRNA_ID = get_circRNA_ID(lst)
# 		self.chr = get_chr(lst)
# 		self.circRNA_start = get_circRNA_start(lst)
# 		self.circRNA_end = get_circRNA_end(lst)
# 		self.junction_reads = get_junction_reads(lst)
# 		self.non_junction_reads = get_non_junction_reads(lst)
# 		self.junction_reads_ratio = get_junction_reads_ratio(lst)
# 		self.circRNA_type = get_circRNA_type(lst)
# 		self.gene_id = get_gene_id(lst)
# 		self.junction_reads_ID = get_junction_reads_ID(lst)


# class Header:
# 	def __init__(self, lst):
# 		name = "-".join(lst)
# 		self.name = name
# 	def __repr__(self):
# 		return self.name



