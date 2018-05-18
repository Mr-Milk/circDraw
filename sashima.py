from GTP import anno_matrix
import pandas as pd
import matplotlib
from matplotlib import patches
import matplotlib.patches as mpatches
import matplotlib.pyplot as plt

# 生成isoforms统计报告，每个基因生成circRNA isoforms的数量
# 暂时仅支持CIRI2 (因为我只用过CIRI2 :P)
def isonums(table, column_name, top=10):
    x = list(table[column_name])
    gene_isoforms = {}
    for iso in x:
        if iso in gene_isoforms:
            gene_isoforms[iso] += 1
        else:
            gene_isoforms[iso] = 1

    max_isoforms = sorted(gene_isoforms.items(), key=lambda item:item[1], reverse=True)
    y = max_isoforms[0:top]
    for x in y:
        print(str(x[0])+':'+str(x[1])+'isoforms')


def isoforms(file, method, annofile=None):
    if method == 'CIRI2':
        read_file = pd.read_table(str(file))
    else:
        print('Sorry, we don\'t support this circRNA tool for now.')
    
    if annofile == None:
        isonums(read_file, 'gene_id')

    else:
        # 根据读出来的 anno.gtf 的格式，来把 ciri2 的 gene_id 转成 gene_name
        isonums(read_file, 'gene_name')

# 初始化调色板，里面实际上重复了一遍
Default_color = [
    '#CB1B45',
    '#00896C',
    '#CC543A',
    '#DDD23B',
    '#562E37',
    '#0F2540',
    '#CB1B45',
    '#00896C',
    '#CC543A',
    '#DDD23B',
    '#562E37',
    '#0F2540'
    ]

def chr_info(filename):
    '''
    inputfile format:
    chr | start | end | type | draw_curve

    eg: (if input is a .csv)
    chr,start,end,type,draw_curve
    chr1,74,87,exon,no
    chr1,5,43,intron,yes
    chr1,54,74,exon,no
    chr1,23,62,3'UTR,no
    '''
    if filename.endswith('csv'):
        c = pd.read_csv(filename)
    else:
        c = pd.read_table(filename)
    c.columns = ['chr', 'start', 'end', 'type', 'draw_curve']
    check = c.drop_duplicates(['chr'])
    # 检查是否位于同一染色体上
    if len(check) != 1:
        print('The isoforms seem not from the same chromosome, please recheck your input.')
    # 坐标归一化计算
    start = min(c['start'])
    end = max(c['end'])
    length = end - start
    isoform_matrix = pd.DataFrame()
    c['end_10'] = ((c['end'] - start)/length)*10
    c['start_10'] = ((c['start'] - start)/length)*10
    isoform_matrix['start'] = round(c['start_10'], 3)
    isoform_matrix['end'] = round(c['end_10'], 3)
    isoform_matrix['r'] = round((isoform_matrix['end'] - isoform_matrix['start'])/2, 3)
    isoform_matrix['x'] = round(isoform_matrix['start'] + isoform_matrix['r'], 3)
    isoform_matrix['type'] = c['type']
    isoform_matrix['draw_curve'] = c['draw_curve'] == 'yes'
    return isoform_matrix

def semi_circle(fig, ax, x, y, width, height, linewidth=0.8, rotate=0):
    s = patches.Arc((x, y), width=width, 
                    height=height, 
                    theta1=rotate, 
                    theta2=rotate+180, 
                    linewidth=linewidth,
                    alpha=0.8
                    )
    ax.add_patch(s)

def rectangle(fig, ax, x, y, height, width, color):
    '''
    The right center coordinate of rectangle(x, y)
    It's height and width
    '''
    x -= width/2
    y -= height/2
    r = patches.Rectangle((x,y), height, width, color=color, edgecolor = None)
    ax.add_patch(r)

'''
def net(filename, header=True, rotate=0):
    chr = chr_info(filename)
    x = list(chr['x'])
    r = list(chr['r'])
    
    # Set the axis
    fig = plt.figure()
    start = list(chr['start'])
    end = list(chr['end'])
    axis_start = min(start)
    axis_end = max(end)
    ax = fig.add_subplot(111, aspect='auto')
    ax.set_axis_off()
    ax.get_xaxis().set_visible(True)
    ax.set_xticklabels('')
    ax.set_ylim(bottom=-10, top=max(r)+10)
    ax.set_xlim(left=axis_start, right=axis_end)
    
    # Draw arces
    semi_info = dict(zip(x, r))
    for key, value in semi_info.items():
        semi_circle(fig, ax, key, 2, value, rotate=rotate)

    # Draw rectangle
    for i in start:
        rectangle(fig, ax, i, 0, 0.2, 0.002)

    for i in end:
        rectangle(fig, ax, i, 0, 0.2, 0.002)
'''

# 以下可以封装成一个函数
chr = chr_info('test.csv')
uni_type = chr.drop_duplicates('type', keep='first')['type'].tolist()

curve = chr[chr['draw_curve'] == True]
x = curve['x'].tolist()
r = curve['r'].tolist()

# 定义画布大小
fig = plt.figure()
ax = fig.add_subplot(111, aspect='auto')
ax.set_axis_off()
ax.set_ylim(bottom=-1, top=5)
ax.set_xlim(left=-0.5, right=10.5)

# 绘制半圆
semi_info = dict(zip(x, r))
for key, value in semi_info.items():
    semi_circle(fig, ax, key, 0.15, width=2*value, height=value, linewidth=0.3)

# Draw rectangle
color_ser = 0
for x in uni_type:
    tp = chr[chr['type'] == x]
    start = tp['start']
    end = tp['end']
    for i in start:
        rectangle(fig, ax, i, 0, 0.04, 0.1, color=Default_color[color_ser])
    for i in end:
        rectangle(fig, ax, i, 0, 0.04, 0.1, color=Default_color[color_ser])
    color_ser += 1

# Draw line
x1, y1 = [-1.1, 11.1], [0.02,0.02]
plt.plot(x1, y1, marker = 'o', linewidth = 0.2, color = 'black')

# Draw legend
legend_elements = []
color_ser = 0
for x in uni_type:
    legend_elements.append(mpatches.Patch(facecolor=Default_color[color_ser], label = str(x)))
    color_ser += 1
ax.legend(handles=legend_elements)