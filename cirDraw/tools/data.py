import random
import string
 


class circle:
    def __init__(self, start, end, chr_ci, pk):
        self.start = start
        self.end = end
        self.chr_ci = chr_ci
        self.pk = pk

class gene:
    def __init__(self, start, end, chr_ci, pk):
        self.name = salt = ''.join(random.sample(string.ascii_letters + string.digits, 8))
        self.start = start
        self.end = end
        self.chr_ci = chr_ci
        self.pk = pk

class chro:
    # information of chromosome where the uploaded circle RNA was located
    def __init__(self, id, chr_ci, min_start, max_end, caseid):
        self.id = id
        self.chr_ci = chr_ci
        self.min_start = min_start
        self.max_end = max_end
        self.caseid = caseid

class geno:
    # info for human genome
    def __init__(self, species, chr_ci, min_start, max_end):
        self.species = species
        self.chr_ci =chr_ci
        self.min_start = min_start
        self.max_end = max_end


circles_file1 = [circle(40*i, 40*i+200, "chr"+str(c), "id:"+str(i)+","+str(i+200)) for i in range(400) for c in range(1,20)]

genes_file2 = [gene(50*i, 50*i+300, "chr"+str(c), "id:"+str(i)+","+str(i+300)) for i in range(400) for c in range(1,20)]

chromosome_file4 = [
chro(168 , "chr1"   ,    746695 , 247323230 , "cae6024217c5444896326abe3b13a685") ,
chro(169 , "chr2"   ,    247538 , 241723271 , "cae6024217c5444896326abe3b13a685") ,
chro(170 , "chr3"   ,    592105 , 198024788 , "cae6024217c5444896326abe3b13a685") ,
chro(171 , "chr4"   ,    130788 , 186709845 , "cae6024217c5444896326abe3b13a685") ,
chro(172 , "chr5"   ,    230876 , 181241639 , "cae6024217c5444896326abe3b13a685") ,
chro(173 , "chr6"   ,    345854 , 170549113 , "cae6024217c5444896326abe3b13a685"),
chro(174 , "chr7"   ,    208898 , 158930515 , "cae6024217c5444896326abe3b13a685") ,
chro(175 , "chr8"   ,    492459 , 144890403 , "cae6024217c5444896326abe3b13a685") ,
chro(176 , "chr9"   ,    162432 , 138096611 , "cae6024217c5444896326abe3b13a685") ,
chro(177 , "chr10"  ,    150097 , 133402773 , "cae6024217c5444896326abe3b13a685"),
chro(178 , "chr11"  ,    460187 , 134210454 , "cae6024217c5444896326abe3b13a685" ),
chro(179 , "chr12"  ,    350621 , 133192003 , "cae6024217c5444896326abe3b13a685" ),
chro(180 , "chr13"  ,  19658995 , 114272665 , "cae6024217c5444896326abe3b13a685" ),
chro(181 , "chr14"  ,  20325539 , 105454310 , "cae6024217c5444896326abe3b13a685") ,
chro(182 , "chr15"  ,  22851639 , 101714963 , "cae6024217c5444896326abe3b13a685") ,
chro(183 , "chr16"  ,     98145 ,  90032924 , "cae6024217c5444896326abe3b13a685") ,
chro(184 , "chr17"  ,    803682 ,  82911789 , "cae6024217c5444896326abe3b13a685") ,
chro(185 , "chr18"  ,    163308 ,  80148647 , "cae6024217c5444896326abe3b13a685" ),
chro(186 , "chr19"  ,    311845 ,  58393487 , "cae6024217c5444896326abe3b13a685" ),
chro(187 , "chr20"  ,    417526 ,  64071941 , "cae6024217c5444896326abe3b13a685" ),
chro(188 , "chr21"  ,  14083950 ,  46649739 , "cae6024217c5444896326abe3b13a685" ),
chro(189 , "chr22"  ,  16611658 ,  50595262 , "cae6024217c5444896326abe3b13a685" ),
chro(190 , "chrX"   ,   3817545 , 155548224 , "cae6024217c5444896326abe3b13a685")
]


gene_genome_file4 = [
geno("human"   , "chr1"   ,          11869 ,    249231242),
geno("human"   , "chr10"  ,          90652 ,    135516024) ,
geno("human"   , "chr11"  ,          75780 ,    134945793 ),
geno("human"   , "chr12"  ,          67607 ,    133815135 ),
geno("human"   , "chr13"  ,       19041312 ,    115099423 ),
geno("human"   , "chr14"  ,       19110203 ,    107288019 ),
geno("human"   , "chr15"  ,       20083769 ,    102519298 ),
geno( "human"   , "chr16"  ,          61553 ,     90289086 ),
geno("human"   , "chr17"  ,           4961 ,     81188573 ),
geno("human"   , "chr18"  ,          11103 ,     78005429 ),
geno("human"   , "chr19"  ,          60105 ,     59111168 ),
geno("human"   , "chr2"   ,          38814 ,    243160825 ),
geno("human"   , "chr20"  ,          67891 ,     62944485 ),
geno("human"   , "chr21"  ,        9683191 ,     48111157 ),
geno("human"   , "chr22"  ,       16062157 ,     51239737 ),
geno("human"   , "chr3"   ,          65431 ,    197955247 ),
geno("human"   , "chr4"   ,          48991 ,    191013719 ),
geno("human"   , "chr5"   ,          58313 ,    180899431 ),
geno("human"   , "chr6"   ,          95124 ,    171055065 ),
geno("human"   , "chr7"   ,          70972 ,    159026067 ),
geno("human"   , "chr8"   ,          14091 ,    146281416 ),
geno("human"   , "chr9"   ,          11987 ,    141150148 ),
geno("human"   , "chrM"   ,            577 ,        16023 ),
geno("human"   , "chrX"   ,         170410 ,    155257848 ),
geno("human"   , "chrY"   ,         120410 ,     59360854)
]



