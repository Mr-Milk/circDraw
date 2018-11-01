# coding: utf-8
import pandas as pd
import matplotlib
from matplotlib import patches
import matplotlib.patches as mpatches
import matplotlib.pyplot as plt

def __drawSemiCircle(fig, ax, x, y, width, height, linewidth=0.8, rotate=0):
    '''
    x,y is the left endpoint of semicircle
    '''
    xCord = x + width/2
    s = patches.Arc((xCord, y), width=width, 
                    height=height, 
                    theta1=rotate, 
                    theta2=rotate+180, 
                    linewidth=linewidth,
                    alpha=0.8
                    )
    ax.add_patch(s)

def __drawRectangle(fig, ax, x, y, height, width, color):
    '''
    The right center coordinate of rectangle(x, y)
    '''
    xCord = x - width/2
    yCord = y - width/2
    r = patches.Rectangle((xCord,yCord), height, width, facecolor=color, edgecolor = 'none',zorder=10)
    ax.add_patch(r)


#check input
def __validInput(inst):
    try:
        ins.iloc[:,0:1].dtypes == 'int64' & ins.iloc[:,1:2].dtypes == 'int64' & ins.iloc[:,2:3].dtypes == 'object'
    except ValueError:
        print('Unproper input, the format is start|end|type (int|int|str)')
    
    try:
        'backsplice' in ins.iloc[:,3:4].unique()
    except ValueError:
        print('there is no circRNA in your file')

def __data_process(inst):
    ins = inst
    ins.columns = ['start', 'end', 'type', 'name']
    mini = int(ins.iloc[:,0:1].min())
    length = int(ins.iloc[:,1:2].max()) - mini
    drawTab = ins
    drawTab['start_10'] = ((drawTab['start'] - mini)/length)*10
    drawTab['end_10'] = ((drawTab['end'] - mini)/length)*10
    drawTab['r_10'] = (drawTab['end_10'] - drawTab['start_10'])/2
    return drawTab

def __structureTab(df):
    strucTab = df[df['type'] != 'backsplice']
    strucTab['len'] = strucTab['end_10'] - strucTab['start_10']
    return strucTab

def __bspTab(df):
    bspTab = df[df['type'] == 'backsplice']
    return bspTab

def __draw_backsplice(fig, ax, df):
    start = df['start_10'].tolist()
    end = df['end_10'].tolist()
    
    for i in start:
        __drawRectangle(fig, ax, i, 0.02, 0.04, 0.15, color='purple')
    for i in end:
        __drawRectangle(fig, ax, i, 0.02, 0.04, 0.15, color='purple')
    
    for i in range(0, len(df)):
        value = df.iloc[i]['r_10']
        __drawSemiCircle(fig, ax, df.iloc[i]['start_10']-0.05, 0.15, width=2*value, height=value, linewidth=0.3)
        ax.text(df.iloc[i]['start_10']+value, (value+0.8)/2, df.iloc[i]['name'], fontsize=5, horizontalalignment='center',verticalalignment='center')
        
def __typeList(df):
    types = list(df['type'].unique())
    return types

def __drawStructure(fig, ax, df, palette):
    num = 0
    types = __typeList(df)
    for typ in types:
        t = df[df['type'] == typ]
        for i in range(0, len(t)):
            __drawRectangle(fig, ax, t.iloc[i]['start_10'], 0.02, t.iloc[i]['len'], 0.1, color=palette[num])
            ax.text(t.iloc[i]['start_10'], -0.2, t.iloc[i]['name'], fontsize=5)
        num += 1

def circDraw(inst, title='circDraw', dpi=400, chr_color='black', palette=None, save='png'):
    Default_color = ['#CB1B45','#00896C','#CC543A','#DDD23B','#562E37','#0F2540']
    
    if palette == None:
        palette = Default_color
    elif len(palette) < len(inst.iloc[:,3:4].unique()):
        print('The color in the palette are less than your input types.')
        break
    
    fig = plt.figure(dpi=dpi)
    ax = fig.add_subplot(111, aspect='auto')
    ax.set_axis_off()
    ax.set_ylim(bottom=-1, top=5)
    ax.set_xlim(left=-0.5, right=10.5)
    plt.title(title)
    
    drawTab = __data_process(inst)
    bsp_Tab = __bspTab(drawTab)
    struc_Tab = __structureTab(drawTab)
    
    __drawStructure(fig, ax, struc_Tab, palette)
    __draw_backsplice(fig, ax, bsp_Tab)
    
    x1, y1 = [-1.1, 11.1], [0.02, 0.02]
    plt.plot(x1, y1, marker = 'o', linewidth = 0.2, color = chr_color)
    
    legend_elements = []
    types = __typeList(struc_Tab)
    num = 0
    for x in types:
        legend_elements.append(mpatches.Patch(facecolor=palette[num], label = str(x)))
        num += 1
        ax.legend(handles=legend_elements)
    
    filename = 'circDraw.' + str(save)
    plt.savefig(filename, dpi=dpi)
