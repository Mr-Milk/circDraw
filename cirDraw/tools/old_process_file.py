# processing file module

def handle_uploaded_file(f, filter_lst):
	lines = []
	f_iter = iter(f)
	header = next(f_iter).decode("utf-8").split("\t")
	for line in f_iter:
		line_sep = line.decode().split('\t')
		line_sep, head = fil_lst(line_sep, header, filter_lst)
		lines.append(RNAob(head, line_sep))
	#header_ob = Header(head)
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


def save_line(md5ob, header, lst):
    """save each observation"""
    try:
        ob = ToolsEachobservation(caseid = md5ob)
        assert type(header) == list, "HEADER passed in to save is not a list"
        e = lst
        for each in header:
            exec('ob.' + each +' = ' + 'e["' + each +'"]', globals(), locals())
        ob.save()
        return True
    except:
        return False





def save(md5, header, results, file_type, species):
    """Save file"""
    chromosome_info = [[[sys.maxsize, 0], [sys.maxsize, 0]] for _ in range(25)]
    max_length = 0

    def get_start_point(lst):
        """get the start point of [xxx, xxx]"""
        return lst[0][0]
    def get_end_point(lst):
        return lst[0][1]
    def get_max_len(lst):
        return lst[1][1]
    def get_min_len(lst):
        return lst[1][0]

    def update_chromosome_start(lst, update_to):
        lst[0][0] = update_to
    def update_chromosome_end(lst, update_to):
        lst[0][1] = update_to
    def update_circlen_max(lst, update_to):
        lst[1][1] = update_to
    def update_circlen_min(lst, update_to):
        lst[1][0] = update_to

    chr_order = 0
    for e in results:
        # save each observation
        ob = ToolsEachobservation(caseid = case)
        assert type(header) == list, "HEADER passed in to save is not a list"
        for each in header:
            exec('ob.' + each +' = ' + 'e["' + each +'"]', globals(), locals())
        ob.save()

        # update chromosome max end and min start
        now_chr = e['chr_ci']
        chr_num = get_chr_num(now_chr)
        now_start = int(e['circRNA_start'])
        now_end = int(e['circRNA_end'])
        if chr_num >= 0:
            if now_start < get_start_point(chromosome_info[chr_num-1]):
                update_chromosome_start(chromosome_info[chr_num-1],now_start)
            if now_end > get_end_point(chromosome_info[chr_num - 1]):
                update_chromosome_end(chromosome_info[chr_num-1], now_end)
        else:
            print("one of Your input of chr from the handle file is crap")

        # update max length of circle RNA
        length = now_end - now_start
        now_max = get_max_len(chromosome_info[chr_num - 1])
        now_min = get_min_len(chromosome_info[chr_num - 1])
        if length > max_length:
            if now_max < length:
                update_circlen_max(chromosome_info[chr_num - 1], length)
            if now_min > length:
                update_circlen_min(chromosome_info[chr_num - 1], length)

    for i,each_chr in enumerate(chromosome_info):
        if get_start_point(each_chr) < get_end_point(each_chr):
            ob_chr = ToolsChromosome(caseid = case, chr_ci = toCHR(i+1),chr_start = get_start_point(each_chr), chr_end = get_end_point(each_chr), max_length_circ = get_max_len(each_chr), min_length_circ = get_min_len(each_chr))
            ob_chr.save()
    return caseid

