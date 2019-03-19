
# Create your tests here.
def aggregate(dic, chr_ci):
    """calculate values in dic and return list of blocks with their calibrated density
    >>> a = {1: 0, 2:0, 3:0, 4:4, 5:5,6:0,7:2}
    >>> r = aggregate(a, "hi")
    >>> r
    [{'chr': 'hi', 'start': 4, 'end': 5, 'density': 82}, {'chr': 'hi', 'start': 7, 'end': 7, 'density': 18}]

    """
    total = 0
    last = 0
    sep = 0
    start, end = 0, 0
    blocks = []
    length = len(dic)
    for i in dic:
        now = dic[i]
        if now == 0 and last == 0:
            pass
        elif now != 0 and last == 0:
            sep += now
            start = i
            last = now
            if i == length:
                b = {'chr': chr_ci, 'start': start, 'end': start, 'density': sep}
                blocks.append(b)
                total += sep
                sep = 0
        elif now != 0 and last != 0:
            sep += now
            last = now
            if i == length:
                b = {'chr': chr_ci, 'start': start, 'end': i, 'density': sep}
                blocks.append(b)
                total += sep
                sep = 0
        elif now == 0 and last != 0:
            end = i - 1
            total += sep
            b = {'chr': chr_ci, 'start': start, 'end': end, 'density': sep}
            blocks.append(b)
            sep = 0
            last = now


    for ob in blocks:
        ob['density'] = round(ob['density'] / total * 100)
    return blocks


def scale_den(f, scale):
    """
    >>> f =
    """
    while f > scale[1] or f < scale[0]:
        if f > scale[1]:
            f = f / 10
        elif f < scale[0]:
            f = f * 10
    return f
