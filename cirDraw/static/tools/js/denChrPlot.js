// Get URL and split to caseid
var url = $(location).attr('href').split("/")
var caseid = url[url.length -1]

// Initiate Density Plot
var den = Snap("#svg2");
var palette = ['#c73e3a',
'#c83f3a',
'#c8413a',
'#c9423a',
'#ca433a',
'#ca453a',
'#cb463b',
'#cc473b',
'#cc493b',
'#cd4a3b',
'#ce4b3b',
'#ce4d3b',
'#cf4e3b',
'#d0503b',
'#d0513b',
'#d1523c',
'#d1543c',
'#d2553c',
'#d3573c',
'#d3583c',
'#d45a3c',
'#d55b3c',
'#d55d3d',
'#d65e3d',
'#d6603d',
'#d7613d',
'#d8633d',
'#d8653d',
'#d9663d',
'#d9683e',
'#da693e',
'#da6b3e',
'#db6c3e',
'#dc6e3e',
'#dc703f',
'#dd713f',
'#dd733f',
'#de753f',
'#de763f',
'#df783f',
'#e07a40',
'#e07b40',
'#e17d40',
'#e17f40',
'#e28041',
'#e28241',
'#e38441',
'#e38541',
'#e48741',
'#e48942',
'#e58a42',
'#e68c42',
'#e68e42',
'#e79043',
'#e79143',
'#e89343',
'#e89543',
'#e99744',
'#e99844',
'#ea9a44',
'#ea9c44',
'#eb9e45',
'#eb9f45',
'#eca145',
'#eca345',
'#eda546',
'#eda746',
'#eda846',
'#eeaa47',
'#eeac47',
'#efae47',
'#efaf47',
'#f0b148',
'#f0b348',
'#f1b548',
'#f1b749',
'#f2b849',
'#f2ba49',
'#f2bc4a',
'#f3be4a',
'#f3c04a',
'#f4c24b',
'#f4c34b',
'#f5c54b',
'#f5c74c',
'#f5c94c',
'#f6cb4c',
'#f6cc4d',
'#f7ce4d',
'#f7d04d',
'#f8d24e',
'#f8d44e',
'#f8d54e',
'#f9d74f',
'#f9d94f',
'#f9db4f',
'#fadd50',
'#fade50',
'#fbe051',
'#fbe251']
var tipInfo = den.paper.text(700, 30, "Density: ").attr({
    'font-family': 'arial',
    'font-size': 15
})

// Draw Density Plot
var chrMaxLen, denINFO, densityBlock = []
$("#svg2").hide()
$.getJSON('/tools/tools_file4', {'case_id': caseid}).done(function(chrJSON){
    
    chrMaxLen = normChr(chrJSON)

    $.getJSON('/tools/tools_file5', {'case_id': caseid}).done(function(densityJSON){
        denINFO = normden(densityJSON)
        denPlot(chrMaxLen, densityJSON)
        $("#load").hide()
        $("#svg2").show()
    })

})

// Changing Density Block
$("#previous").click(
    function(){
        index = getIndex()
        if (index > 0) {
            densityBlock[index-1].click()
            $("#next").removeAttr("disabled")
        }
        else {
            $("#previous").attr("disabled", "")
        }    
    }
)

$("#next").click(
    function(){
        index = getIndex()
        if (index < denINFO.length-1) {
            densityBlock[index+1].click()
            $("#previous").removeAttr("disabled")
        }
        else {
            $("#next").attr("disabled", "")
        }    
    }
)

$("#dendownload").click(function(){
    var saveSvgAsSvg = svg2.paper.toString(),
        blob = new Blob([saveSvgAsSvg], { type: 'text/plain' })
    $("#dendownload").attr("href", window.URL.createObjectURL(blob))
})

// get index of an array
function getIndex(){
    var from = $("#js-input-from").val(),
        to = $("#js-input-to").val(),
        chr = $('#chrSelector').val();

    index = denINFO.findIndex(function(item, i){
        return item.start === from && item.chr === chr && item.end === to
    })

    return index
}

// draw a block
function chr_block(y, len, name){
    var chr_block = den.paper.rect(50, y, len, 10).attr({
        fill: "#e4e4e2",
        stroke: "#000",
        strokeWidth: 0.5
    })
    
    var t1 = den.paper.text(20, y+8, name).attr({
        'font-family': 'arial',
        'font-size': 10
    })

    return chr_block, t1

}

// normalize density value
function getMinMax(denJSON){
    var arr = []
    for (i=0 ; i<denJSON.length ; i++) {
        arr.push(denJSON[i].density)
    }

    max = Math.max.apply(null, arr)
    min = Math.min.apply(null, arr)

    mm = [min, max, max-min]

    return mm
}

function normden(denJSON){
    mm = getMinMax(denJSON)
    min = mm[0]
    max = mm[1]
    range = mm[2]
    for (x in denJSON) {
        x.scaleDen = 100*(x.density_value-min)/range
    }

    return denJSON
}

function density_block(x, y, len, chr, start, end, density_value){
    var fillColor = palette[Math.round(density_value-1)]
    var denBlock = den.paper.rect(x, y+0.3, len+1, 9.5).attr({
        fill: fillColor,
        stroke: 'none',
        cursor: 'pointer'
    }).mouseover(function(){
        den_value = den.paper.text(755, 30, density_value).attr({
            'font-family': 'arial',
            'font-size': 15,
            fill: 'orange',
        })
        pText = "chr" + chr + ": " + start + " - " + end
        position = den.paper.text(325, 30, pText).attr({
            'font-family': 'arial',
            'font-size': 15,
        })
        denBlock.attr({
            fill: fillColor,
            stroke: '#E83015',
            strokeWidth: 1.5,
            cursor: 'pointer'
        })
    }).mouseout(function(){
        den_value.remove()
        position.remove()
        denBlock.attr({
            fill: fillColor,
            stroke: 'none',
            cursor: 'pointer'
        })
    }).click(function(){
        $("#js-input-from").text(start);
        $("#js-input-to").text(end);
        $('#chrSelector').prop("value", chr)
        var gene_selector = $("#gene_selector").data("ionRangeSlider");
        $.getJSON("genelist for gene_selector", {"caseid": caseid, "start": start, "end": end, "chr": chr})
        .done(function(geneList){
            var geneValues = []
            for (i in geneList) {
                geneValues.push(i.name)
            }
            gene_selector.update({
                values: geneValues,
            })
        });
        $("#gene_selector").show()
    })

    return denBlock
}

function normChr(chrJSON){
    var max = 0, normChr = []
    for (i=0; i<chrJSON.length; i++) {
        if (chrJSON[i].chrLen > max) {
            max = chrJSON[i].chrLen
        };
    };

    for (i=0; i<chrJSON.length; i++) {
        normChr.push({"chr": chrJSON[i].chr, "len": 640*chrJSON[i].chrLen/max})
    }
    
    var len = normChr.length
    var svgHeight = 60 + len*20
        $("#svg2").attr("height", svgHeight)
        for (i=0; i<normChr.length ; i++) {
            chr = chr_block(20+20*(i+1), normChr[i].len, normChr[i].chr)
        }
    return max
    };

function denPlot(chrMaxLen, densityJSON){
    for (i=0; i<densityJSON.length; i++) {
        densityBlock[i] = "density_block" + i
        var xAxis = 50 + 640*densityJSON[i].start/chrMaxLen,
            len = 640*(densityJSON[i].end - densityJSON[i].start)/chrMaxLen
        
        densityBlock[i] = density_block(xAxis, 20+20*densityJSON[i].chr, len, densityJSON[i].chr, densityJSON[i].start, densityJSON[i].end, densityJSON[i].density)
    }
}