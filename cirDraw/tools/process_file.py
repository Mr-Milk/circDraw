info_needed = ['circRNA_ID', 'chr', 'circRNA_start', 'circRNA_end']

def detect_filetype(f):
    return "CIRI2.0"

def detect_species(f):
    return "human"

def handle_uploaded_file(f, filter_lst=info_needed):
	lines = []
	f_iter = iter(f)
	header = next(f_iter).decode("utf-8").split("\t")
	for line in f_iter:
		line_sep = line.decode().split('\t')
		line_sep, head = fil_lst(line_sep, header, filter_lst)
		lines.append(RNAob(head, line_sep))
	return head, lines



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

