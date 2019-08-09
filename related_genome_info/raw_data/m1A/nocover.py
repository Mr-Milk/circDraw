import cProfile
lst = []

with open("RMBase_hg19_all_m1A_site.txt") as f:
    for line in f:
        w = hash(line)
        lst.append(w)
        print(w)

print("origin length:", len(lst))
lst2 = set(lst)
print("after set:", len(lst2))


def loop(lst):
    for i in lst:
        if i in lst:
            print("True")

cProfile.run('loop(lst)')





