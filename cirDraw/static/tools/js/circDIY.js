// 若出现输入信息未显示，可能为错误输入被circDraw忽略

// declare jQuery function
$.fn.extend({          
    errorAfter:function(error) {            
          $(this).after("<span id='error' class='ml-3'></span>")
          $('#error').html(error).addClass('text-danger').show().fadeOut(1000, function(){
            $('#error').remove()
        })
     }      
}); 

$.fn.extend({
    alphaNumOnly: function(){
        $(this).on("keydown", function(e){
            var arr = [8,16,17,20,35,36,37,38,39,40,45,46];
            // Allow letters
            for(var i = 65; i <= 90; i++){
                arr.push(i);
            }
            // Allow number
            for(var t = 48; t <= 57; t++){
                arr.push(t);
            }
            if(jQuery.inArray(event.which, arr) === -1){
                event.preventDefault();
            }
        })
}})

$.fn.extend({
    numOnly: function(){
        $(this).on("keydown", function(e){
            var arr = [8,16,17,20,35,36,37,38,39,40,45,46];
            // Allow number
            for(var t = 48; t <= 57; t++){
                arr.push(t);
            }

            if(jQuery.inArray(event.which, arr) === -1){
                event.preventDefault();
            }
        })
}})

var svg = Snap("#svg");

var background = svg.paper.rect(0, 0, $("#svg").attr('width'), $("#svg").attr('height')).attr({
    fill: "#fff",
    stroke: "#f00",
    strokeWidth: 1
})

$('.alpha-num-only').alphaNumOnly()
$('.num-only').numOnly()

$('#exonAdd').click(function(){$('#exon').append(
    "\n<div class='input-group mb-3' id='exon'>\n"+
    "<input type='text' class='form-control alpha-num-only' placeholder='name' id='exonName'>\n"+
    "<input type='text' class='form-control num-only' placeholder='start' id='exonStart'>\n"+
    "<input type='text' class='form-control num-only' placeholder='end' id='exonEnd'>\n"+
    "<div class='input-group-append'>\n"+
    "<button class='btn btn-sm btn-outline-secondary' type='button' " + 'onclick="document.getElementById(' + "'exonAdd'" + ').click()">+</button>\n'+
    "<button class='btn btn-sm btn-outline-secondary' type='button' onclick='this.parentElement.parentElement.remove()'>-</button>\n"+
    "</div></div>"
).ready(function(){
    $('.alpha-num-only').alphaNumOnly()
    $('.num-only').numOnly()
})})

$('#modAdd').click(function(){$('#mod').append(
    "<div class='input-group mb-3' id='mod'>\n"+
    "<select class='custom-select' id='inputGroupSelect01'>\n"+
    "<option selected>Type</option>\n"+
    "<option value='m6A'>m6A</option>\n"+
    "<option value='m1C'>m1C</option>\n"+
    "<option value='m1A'>m1A</option>\n"+
    "<option value='SNP'>SNP</option>\n"+
    "</select>\n"+
    "<input type='text' class='form-control num-only' placeholder='site' id='modsite'>\n"+
    "<div class='input-group-append'>\n"+
    "<button class='btn btn-sm btn-outline-secondary' type='button' " + 'onclick="document.getElementById(' + "'modAdd'" + ').click()">+</button>\n'+
    "<button class='btn btn-sm btn-outline-secondary' type='button' onclick='this.parentElement.parentElement.remove()'>-</button>\n"+
    "</div></div>"
).ready(function(){
    $('.alpha-num-only').alphaNumOnly()
    $('.num-only').numOnly()
})})

$('#fAdd').click(function(){$('#f').append(
    "<div class='input-group mb-3' id='f'>\n"+
    "<select class='custom-select' id='inputGroupSelect01'>\n"+
    "<option selected>Type</option>\n"+
    "<option value='MRE'>MRE</option>\n"+
    "<option value='ORF'>ORF</option>\n"+
    "</select>\n"+
    "<input type='text' class='form-control num-only' placeholder='start' id='modstart'>\n"+
    "<input type='text' class='form-control num-only' placeholder='end' id='modend'>\n"+
    "<div class='input-group-append'>\n"+
    "<button class='btn btn-sm btn-outline-secondary' type='button' " + 'onclick="document.getElementById(' + "'fAdd'" + ').click()">+</button>\n'+
    "<button class='btn btn-sm btn-outline-secondary' type='button' onclick='this.parentElement.parentElement.remove()'>-</button>\n"+
    "</div></div>"
).ready(function(){
    $('.alpha-num-only').alphaNumOnly()
    $('.num-only').numOnly()
})})

var circList = [], exonList = [], modList = [], exonJSON = [], circJSON = []

$('#addcirc').click(function(){
    var circName = $('#circName').val(),circStart = parseInt($('#circStart').val()), circEnd = parseInt($('#circEnd').val())
    var exons = [],
        mods = [],
        fs = []
    $('#exon input').each(function(i,e){
        if (e.value != ""){
            exons.push(e.value)
        }
    });

    $('#mod').children('div').children().each(function(i,e){
        if (e.value != "" && e.value != undefined && e.value != "Type"){
            mods.push(e.value)
        }
    });

    $('#f').children('div').children().each(function(i,e){
        if (e.value != "" && e.value != undefined && e.value != "Type"){
            fs.push(e.value)
        }
    });
    // 1. 检查circ信息是否有空
    console.log("exons: " + exons + "\n",
    "mods: " + mods + "\n",
    "fs: " + fs + "\n",)
    var ifCircFilled = (circName != "" && $('#circStart').val() != "" && $('#circEnd').val() != ""),
    // 2. 检查exon信息是否有空
        ifExonFilled = (exons.length%3) == 0 && exons.length > 0,
        ifModFilled = ((mods.length%2) == 0),
        ifFFilled = ((fs.length%3) == 0),
    // 3. 检查是否满足start<end
        ifCircSE = circStart < circEnd || !(circStart == "" && circEnd == ""),
        ifExonSE = (function(){var condition = true
            for (i=0;i<exons.length/3;i++){
                if (parseInt(exons[3*i+1]) > parseInt(exons[3*i+2])) {
                    condition = false
                }
            }
            return condition})(),
        ifFSE = (function(){var condition = true
            for (i=0;i<mods.length/3;i++){
                if (parseInt(mods[3*i+1]) > parseInt(mods[3*i+2])) {
                    condition = false
                }
            }
            return condition})(),
        // 4. 检查exon是否有重叠区域
        ifOverlap = (function(){
        for (i=0;i<exons.length/3;i++) {
            condition = false
            start = parseInt(exons[3*i+1])
            end = parseInt(exons[3*i+2])
            for (t=0;t<exons.length/3;t++) {
                comp = parseInt(exons[3*t+1])
                if (start < comp && comp < end){
                    condition = true
                }
            }
            return condition
        }})(),

        // 5. 检查circ的start和end是否与exon匹配
        ifExonInCirc = (function(){
            condition = true
            for (i=0;i<exons.length/3;i++){
                if (parseInt(exons[3*i+1]) < circStart || parseInt(exons[3*i+2]) > circEnd) {
                    condition = false
                }
            }
            return condition
        })(),

        ifModInCirc = (function(){
            condition = true
            for (i=0;i<mods.length/2;i++){
                if ( mods[2*i+1] < circStart || mods[2*i+1] > circEnd){
                    condition = false
                }
            }
            return condition
        })(),

        ifFInCirc = (function(){
            condition = true
            start = parseInt(circStart)
            end = parseInt(circEnd)
            for (i=0;i<fs.length/3;i++){
                if ( fs[3*i+1] < circStart || fs[3*i+2] > circEnd){
                    condition = false
                }
            }
            return condition
        })()

        console.log(
            "circfilled: ", ifCircFilled + "\n",
            "exonfilled: ", ifExonFilled + "\n",
            "modfilled: ",  ifModFilled + "\n",
            "Ffilled: ", ifFFilled + "\n",
            "circSE: ", ifCircSE + "\n",
            "exonSE: ", ifExonSE + "\n",
            "fSE: ", ifFSE + "\n",
            "!overlap: ", !ifOverlap + "\n",
            "exonInCirc: ", ifExonInCirc + "\n",
            "modInCirc: ", ifModInCirc + "\n",
            "FInCirc: ", ifFInCirc + "\n"
        )

    var condition = ifCircFilled && ifExonFilled && ifModFilled && ifFFilled && ifCircSE && ifExonSE && ifFSE && !ifOverlap && ifExonInCirc && ifModInCirc && ifFInCirc

    if (condition) {
        if ($('#addcirc').text() == 'Done') {
            $('#addcirc').text('Add Gene')
        }
        $('#addcirc').parent().parent().after("<div><p class='d-inline-block'>circRNA: " + "<b>" + circName + "   " + circStart + " - " + circEnd + "</b>" + 
        "</p>\n" + "<p class='d-inline-block ml-1' style='cursor: pointer;' id='delete" + circName + "'><u>Delete</u></p>"+
        "<p class='d-inline-block ml-1' style='cursor: pointer;' id='edit" + circName + "'><u>Edit</u></p></div>")
        
        // updata circRNA

        circList.push({'name': circName, 'start': parseInt(circStart), 'end': parseInt(circEnd)})
        let seencircNames = {}
        circList = circList.filter(function(e) {
            if (e.name in seencircNames) {
                return false;
            } else {
                seencircNames[e.name] = true;
                return true;
            }
        })

        console.log(circList)

        console.log(exons)

        for (i=0;i<exons.length/3;i++){
            exonList.push({'name':exons[3*i], 'start':parseInt(exons[3*i+1]), 'end':parseInt(exons[3*i+2])})
        }

        console.log("exonList not filtered: ", exonList)

        // check if duplicates
        let seenexonNames = {}, seenexonStart = {}, seenexonEnd = {}
        exonList = exonList.filter(function(e) {
            if (e.start in seenexonStart && e.end in seenexonEnd) {
                return false;
            } else {
                seenexonNames[e.name] = true;
                seenexonStart[e.start] = true;
                seenexonEnd[e.end] = true;
                return true;
            }
        })

        console.log("exonList filtered: ", exonList)

        for (i=0;i<mods.length/2;i++){
            modList.push({'type': mods[2*i], 'start': parseInt(mods[2*i+1]), 'end': parseInt(mods[2*i+1])+1})
        }
        
        for (i=0;i<fs.length/3;i++){
            modList.push({'type': fs[3*i], 'start': parseInt(fs[3*i+1]), 'end': parseInt(fs[3*i+2])})
        }
        let seenmodNames = {}, seenmodStart = {}, seenmodEnd = {}
        modList = modList.filter(function(e) {
            if (e.start in seenmodStart && e.end in seenmodEnd) {
                return false;
            } else {
                seenmodNames[e.name] = true;
                seenmodStart[e.start] = true;
                seenmodEnd[e.end] = true;
                return true;
            }
        })

        console.log(modList)


        console.log(exonList)

        // generate exonJSON
        exonJSON = (function(){
            var exons = []
            for (i=0;i<exonList.length;i++) {
                var exon = $.extend([], exonList[i])
                exon.mod = []
                for (t=0;t<modList.length;t++){
                    if (modList[t].start >= exon.start && modList[t].end <= exon.end){
                        exon.mod.push(modList[t])
                    }
                }
                exons.push(exon)
        }
            return exons
    })()

        console.log(exonJSON)

        // generate circJSON
        
        circJSON = (function(){
            var circs = []
            for (i=0;i<circList.length;i++){
                var circ = circList[i]
                circ.exon = []
                for (t=0;t<exonJSON.length;t++){
                    if (exonJSON[t].start >= circ.start && exonJSON[t].end <= circ.end){
                        circ.exon.push(exonJSON[t])
                    }
                }
                circs.push(circ)
            }
            return circs
        })()

        console.log(circJSON)

        // if click edit & delete
        $("#delete" + circName).click(function(){
            $(this).parent().remove()
            circList = circList.filter(function(i){if (i.name != circName){return i}})

            let deleteCirc = circJSON.filter(function(i){if (i.name == circName){return i}})[0]
            console.log(deleteCirc)
            let exon = (function(){var exon = [];for(i=0;i<deleteCirc.exon.length;i++){exon.push(deleteCirc.exon[i].name)} return exon })()
            let mod = (function(){
                    var mod = [];
                    for(i=0;i<deleteCirc.exon.length;i++){
                        mod.concat(deleteCirc.exon[i].mod)}
                    return mod })()
            console.log("delete exon list:", exon)
            exonList = exonList.filter(function(i){if (($.inArray(i.name, exon) === -1)){return i}})
            console.log("After delete exonList: ", exonList)
            let seenmodTypes = {}, seenmodStart = {}, seenmodEnd = {}
            modList = modList.filter(function(e) {
            if (e.type in seenmodTypes && e.start in seenmodStart && e.end in seenmodEnd) {
                return false;
            } else {
                seenmodTypes[e.type] = true;
                seenmodStart[e.start] = true;
                seenmodEnd[e.end] = true;
                return true;
            }
        })

            circJSON = circJSON.filter(function(i){if (i.name != circName){return i}})

            redraw()
        })

        $("#edit" + circName).click(function(){
            $('#addcirc').text('Done')
            editCirc = circJSON.filter(function(i){if (i.name == circName){return i}})[0]
            console.log("editCirc: ", editCirc)
            $("#delete" + circName).click()
            console.log("Edit Status, after delete, exonList: ", exonList)
            $('#circName').val(editCirc.name)
            $('#circStart').val(editCirc.start)
            $('#circEnd').val(editCirc.end)

            console.log($('#circName').val())
            $('#exon div').siblings('div').slice(1).remove()

            for (i=0;i<editCirc.exon.length;i++) {
                setExon = $('#exon div').siblings('div input').slice(i*3,i*3+3)
                setExon[0].value = editCirc.exon[i].name
                setExon[1].value = editCirc.exon[i].start
                setExon[2].value = editCirc.exon[i].end

                for (t=0;t<editCirc.exon[i].mod.length;t++){
                    console.log("modName: ", editCirc.exon.mod[t].name, " Type: ", typeof(editCirc.exon.mod[t].name))
                    if ($.inArray(editCirc.exon.mod[t].name, ['m6A', 'm1A', 'M1C', 'SNP']) !== -1){
                        $('#mod div').children('select')[t].value = editCirc.exon[i].mod[t].name
                        $('#mod div').children('input')[t].value = editCirc.exon[i].mod[t].start
                        $('#modAdd').click()
                    }
                    else if ($.inArray(editCirc.exon[i].mod[t].name in ['MRE', 'ORF']) !== -1){
                        $('#f div').children('select')[t].value = editCirc.exon[i].mod[t].name
                        $('#f div').children('input')[t*2].value = editCirc.exon[i].mod[t].start
                        $('#f div').children('input')[t*2+1].value = editCirc.exon[i].mod[t].end
                        $('#modAdd').click()
                    }
                }

                if (i < editCirc.exon.length - 1) {
                    $('#exonAdd').click()
                }
            }
        })




        // when finish click
            // reset all the blank
        $('#exon div').siblings('div').slice(1).remove()
        $('#exon div').children('input').each(function(i,e){e.value = ""})

        $('#mod div').siblings('div').slice(1).remove()
        $('#mod div').children('input').each(function(i,e){e.value = ""})
        $('#mod div').children('select').val("Type")

        $('#f div').siblings('div').slice(1).remove()
        $('#f div').children('input').each(function(i,e){e.value = ""})
        $('#f div').children('select').val("Type")

        $('#circInput').children('input').each(function(i,e){e.value = ""})

        redraw()
            }
    else if ( (ifCircFilled && ifExonFilled && ifModFilled && ifFFilled) == false ) {
        $('#addcirc').errorAfter('Incomplete input')
    }
    else if ( (ifCircSE && ifExonSE && ifFSE) == false ) {
        $('#addcirc').errorAfter('Error: start > end')
    }
    else if ( (!ifOverlap) == false ) {
        $('#addcirc').errorAfter('Error: Exon Overlap')
    }
    else if ( (ifExonInCirc && ifModInCirc && ifFInCirc) == false ) {
        $('#addcirc').errorAfter('Error: Out of range')
    }
        
})

var geneList = []
var colorList = ["#92C9FF", "#8FD16F", "#108757", "#0B3A42", "#FF404A", "#5CA0F2", "#FF881D"]

$('#addgene').click(function(){
    var geneName = $('#geneName').val(),
        geneStart = $('#geneStart').val(),
        geneEnd = $('#geneEnd').val()
    var condition = (geneName != "" && geneStart != "" && geneEnd != "")
    if (condition) {
        if ($('#addgene').text() == 'Done') {
            $('#addgene').text('Add Gene')
        }
        geneList.push({'Name': geneName, 'start': parseInt(geneStart), 'end': parseInt(geneEnd)})
        $('#geneName').val("")
        $('#geneStart').val("")
        $('#geneEnd').val("")
        $('#addgene').parent().parent().after("<div><p class='d-inline-block'>Gene: " + "<b>" + geneName + "   " + geneStart + " - " + geneEnd + "</b>" + "</p>\n" + 
        "<p style='cursor: pointer;' class='ml-1 d-inline-block' id='delete" + geneName + "'><u>Delete</u></p>"+
        "<p style='cursor: pointer;' class='ml-1 d-inline-block' id='edit" + geneName + "'><u>Edit</u></p></div>")
        $('#edit' + geneName).click(function(){
            if ($('#addgene').text() != 'Done') {
                $('#addgene').text('Done')
                $('#geneName').val(geneName)
                $('#geneStart').val(geneStart)
                $('#geneEnd').val(geneEnd)
                $('#edit' + geneName).parent().remove()
                geneList = geneList.filter(function(i){
                    if (i.Name != geneName) {
                        return i
                    }
                })
            }
        })
        $('#delete' + geneName).click(function(){
            $(this).parent().remove()
            geneList = geneList.filter(function(i){
                if (i.Name != geneName) {
                    return i
                }
            })
            redraw()
        })
    }
    else {
        $('#addgene').after("<span id='error' class='ml-3'></span>")
        $('#error').html("Missing Info").addClass('text-danger').show().fadeOut(1000, function(){
            $('#error').remove()
        })
    }

    console.log(geneList)
    redraw()

})

function redraw(){
    if (circList.length == 0 && geneList.length == 0){
        svg.clear()
        var background = svg.paper.rect(0, 0, $("#svg").attr('width'), $("#svg").attr('height')).attr({
            fill: "#fff",
            stroke: "#f00",
            strokeWidth: 1
        })
    }
    else{
    svg.clear()
    var background = svg.paper.rect(0, 0, $("#svg").attr('width'), $("#svg").attr('height')).attr({
        fill: "#fff",
        stroke: "#f00",
        strokeWidth: 1
    })
    var chr_skeleton = svg.paper.line(50, 450, 750, 450).attr({
        stroke: "#000",
        strokeWidth: 1
    });

    var scStart, scEnd, drawArc = [], exons = []

    if (exonList.length == 0 || circList.length == 0) {
        gmm = getMinMax(geneList)
        scStart = gmm[0]
        scEnd = gmm[1]
    }
    else if (geneList.length == 0) {
        cmm = getMinMax(circList)
        emm = getMinMax(exonList)
        mm = cmm.concat(emm)
        scStart = Math.min.apply(null,mm)
        scEnd = Math.max.apply(null,mm)
    }
    else {
        cmm = getMinMax(circList)
        gmm = getMinMax(geneList)
        emm = getMinMax(exonList)
        mm = gmm.concat(emm).concat(cmm)
        scStart = Math.min.apply(null,mm)
        scEnd = Math.max.apply(null,mm)
    }

    console.log("start: " + scStart + " end: " + scEnd)

    range = scEnd - scStart
    var colorIndex = 0
    for (i=0;i<geneList.length;i++) {
        console.log(geneList[i])
        x = 50 + 700 * (geneList[i].start - scStart) / range
        end = 50 + 700 * (geneList[i].end - scStart) / range
        len = end-x
        console.log(x, end, len)
        gene_block(x, len, colorList[colorIndex], geneList[i].name)
        colorIndex += 1
    }

    console.log(exonJSON)

    for (r = 0; r < exonJSON.length; r++) {
        scaleStart = 50 + 700 * (exonJSON[r].start - scStart) / range
        scaleEnd = 50 + 700 * (exonJSON[r].end - scStart) / range
        scaleLen = scaleEnd - scaleStart
        //console.log("scale start: ", scaleStart, ", scale end: ", scaleEnd, ", scale len: ", scaleLen)
        colorIndex += 1
        if (colorIndex < 100) {
            //console.log(exonJSON[i].name)
            exon_block(scaleStart, scaleLen, colorList[colorIndex], exonJSON[r].name)
            exons[r] = {
                "start": exonJSON[r].start,
                "end": exonJSON[r].end,
                "color": colorList[colorIndex],
                "mod": exonJSON[r].mod
            }
            console.log(exons[r])
        } else {
            colorIndex = 0
            exon_block(scaleStart, scaleLen, colorList[colorIndex], exonJSON[r].name)
        }
    }

    console.log(exons)

    for (i=0;i<circList.length;i++){
        s = circList[i].start
        e = circList[i].end
        drawArc[i] = []
        for (t=0;t<exons.length;t++){
            if (exons[t].start >= s && exons[t].end <= e) {
                drawArc[i].push(exons[t])
            }
        }
    }
    console.log(drawArc)
    for (u=0;u<circList.length;u++){
        x = 50 + 700 * (circList[u].start - scStart) / range
        end = 50 + 700 * (circList[u].end - scStart) / range
        console.log(drawArc[u])
        arc(x, end, drawArc[u])
    }
}

}

// make sure of correct input format

/*
$("#circStart, #circEnd, .exonStart, .exonEnd, #modsite, #modstart, #modend, #geneStart, #geneEnd").keypress(function (e) {
    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
        return false;
   }
  });

$("#geneName, .exonName, #circName").keypress(function (e) {
    if (e.which != 8 && e.which != 0 && (e.which < 48 && 57< e.which < 65 &&  e.which != 186 && e.which != 189 && e.which != 190)) {
        return false;
    }
});*/

// 65-90, 48-57, 189, 186, 190


//----------------------------------------- Functions For Drawing --------------------------------------

// draw an junction block
function junction_block(x, color){
    var junction_block = svg.paper.rect(x, 445, 2, 10).attr({
        fill: color,
        stroke: 'none',
    });

    return junction_block
}

// draw an exon
function exon_block(x, len, color, name){

    var exon_name
    var display = false

    var exon_block = svg.paper.rect(x, 447, len, 6).attr({
        fill: color,
        stroke: 'none',
        cursor: 'pointer'
    }).click(function(){
        if (display == true) {
            exon_name.remove();
            display = false ;}
        else if (display == false) {
            exon_name = svg.paper.text(x, 465, name).attr({
                'font-family': 'arial',
                'font-size': 10,
                'cursor': 'pointer'})
                .drag(); 
            display = true;}
        }).mouseover(function(){
            Snap.animate(0, 1.5, function (val) {
                exon_block.attr({
                    stroke: '#33A6B8',
                    strokeWidth: val,
                });
            }, 200);
        }).mouseout(function(){
            Snap.animate(1.5, 0, function (val) {
                exon_block.attr({
                    stroke: '#33A6B8',
                    strokeWidth: val,
                });
            }, 200);
        })
    
    return exon_block
}

// draw a gene
function gene_block(x, len, color, name){

    var gene_name
    var display = false

    var gene_block = svg.paper.rect(x, 449, len, 3).attr({
        fill: color,
        stroke: 'none',
        cursor: 'pointer'
    }).click(function(){
        if (display == true) {
            gene_name.remove();
            display = false ;}
        else if (display == false) {
            gene_name = svg.paper.text(x, 465, name).attr({
                'font-family': 'arial',
                'font-size': 10,
                'cursor': 'pointer'})
                .drag();
            display = true;}
        }).mouseover(function(){
            Snap.animate(0, 1.5, function (val) {
                gene_block.attr({
                    stroke: '#33A6B8',
                    strokeWidth: val,
                });
            }, 200);
        }).mouseout(function(){
            Snap.animate(1.5, 0, function (val) {
                gene_block.attr({
                    stroke: '#33A6B8',
                    strokeWidth: val,
                });
            }, 200);
        })
    
    return gene_block
}

// calculate the range of an array
function getRange(arr) {
    var range = 0
    for (var i=0 ; i<arr.length ; i++) {
        range += parseInt(arr[i].end) - parseInt(arr[i].start) 
    }
    return range;
}

// calculate the min and max value of an array
function getMinMax(exonJSON){
    if (exonJSON.length == 0){
        return null
    }
    else {
    var arr = []
    for (i=0 ; i<exonJSON.length ; i++) {
        arr.push(exonJSON[i].start)
        arr.push(exonJSON[i].end)
    }

    max = Math.max.apply(null, arr)
    min = Math.min.apply(null, arr)

    mm = [min, max]

    return mm
    }
}

// draw the epigenetic legned
function legendText(x, y, text, color) {
    legText = svg.paper.text(x, y, text).attr({
        fill: color,
        'font-size': 13,
        'font-family': 'arial'
    })

    return legText
}

function drawLegend(epiList) {

    var y = 20,
        step_y = 15,
        epi = []

    function range(start, step, times) {
        var list = []
        for (i = 0; i < times; i++) {
            y = start + step * i
            list.push(y)
        }
        return list
    }

    function m6A(y) {
        trig = triangelOnCircle(20, y, 0, 0, 5, '#E98B2A')
        triText = legendText(30, y + 8, "m6A", '#E98B2A')
        return svg.group(trig, triText)
    }

    function m1A(y) {
        circle = svg.paper.circle(20, y, 3).attr({
            fill: '#64363C',
            stroke: '#64363C',
            "cursor": "pointer"
        })
        circleText = legendText(30, y + 2, "m1A", '#64363C')
        return svg.group(circle, circleText)
    }

    function m1C(y) {
        square = rectOnCircle(20, y, 0, 5, 0, '#E16B8C')
        squareText = legendText(30, y + 8, "m1C", '#E16B8C')
        return svg.group(square, squareText)
    }

    function MRE(y) {
        MRE = svg.paper.rect(17, y, 7, 7).attr({
            fill: '#6D2E5B',
            stroke: '#000',
            strokeWidth: 0.5
        })
        MREText = legendText(30, y + 8, "MRE", '#6D2E5B')
        return svg.group(MRE, MREText)
    }

    function ORF(y) {
        ORF = svg.paper.rect(17, y, 7, 7).attr({
            fill: '#516E41',
            stroke: '#000',
            strokeWidth: 0.5
        })
        ORFText = legendText(30, y + 8, "ORF")
        return svg.group(ORF, ORFText)
    }

    function SNP(y) {
        arrow = arrowOnCircle(20, y, 0, 0)
        arrowText = legendText(30, y + 8, "SNP", '#000')
        return svg.group(arrow, arrowText)
    }

    var yList = range(20, 15, epiList.length)
    console.log(yList)

    for (i = 0; i < epiList.length; i++) {
        if (epiList[i] == 'm6A') {
            epi.push(m6A(yList[i]))
        }
        if (epiList[i] == 'm1A') {
            epi.push(m1A(yList[i] + 5))
        }
        if (epiList[i] == 'm1C') {
            epi.push(m1C(yList[i]))
        }
        if (epiList[i] == 'ORF') {
            epi.push(ORF(yList[i]))
        }
        if (epiList[i] == 'MRE') {
            epi.push(MRE(yList[i]))
        }
        if (epiList[i] == 'SNP') {
            epi.push(SNP(yList[i]))
        }
    }

    console.log(epi[0])
    var legend = epi[0]

    for (i = 1; i < epi.length; i++) {
        legend = svg.group(legend, epi[i])
    }

    return legend
}

// text at its center cordinate (x,y)
function textCenter(centerX, centerY, text, fontSize, color) {
    cText = svg.paper.text(centerX, centerY, text).attr({
        "font-family": "arial",
        "font-size": fontSize,
    })
    textW = cText.getBBox().w
    textH = cText.getBBox().h
    cText.remove()
    cText = svg.paper.text(centerX-textW/2, centerY+textH/2, text).attr({
        "font-family": "arial",
        "font-size": fontSize,
        fill: color
    })

    return cText
}

// Adding animation for epi-tag on circRNA
function epiAnimate(epi, name, color, centerX, centerY, exonJSON) {
    var c = epi.getBBox()
    epi.mouseover(function(){
        epi.animate({
            transform: 's1.5,' + c.cx + ',' + c.cy
        }, 200)
        text = textCenter(centerX, centerY, name, 15, color)})
    .mouseout(function(){
        epi.animate({
            transform: 's1,' + c.cx + ',' + c.cy
        }, 200)
        text.remove()})
    .click(function(){openNewTab(exonJSON[i]['mod'][t].link)})
}

// Draw circRNA when clicking the arc
function drawCircRNA(exonJSON){
    var modCirc = [], circle = [], realStart = getMinMax(exonJSON)[0], realEnd = getMinMax(exonJSON)[1]
    var startAngle = 180, endAngle = 180, centerX = 400, centerY = 140
    var range = getRange(exonJSON),
        modType = []

    // circRNA background
    var arcBackGround = svg.paper.rect(0,0,800,250).attr({
        stroke: "none",
        fill: "#fff"
    });

    // circRNA ID
    circText = "chr" + $('#chr').val() + ": " + realStart + " - " + realEnd
    circName = textCenter(centerX, centerY-110, circText, 15, "#000")

    // draw epi mod of circRNA
    for (i=0;i<exonJSON.length;i++) {
        circle[i] = 'circExon' + i;
        modCirc[i] = 'modCirc' + i;
        modCirc[i] = []
        endAngle += 360*(exonJSON[i].end - exonJSON[i].start)/range
        console.log(centerX, centerY, startAngle, endAngle)
        for (t=0;t<exonJSON[i]['mod'].length;t++) {
            if ($.inArray(exonJSON[i]['mod'][t]['type'], modType) === -1) {
                modType.push(exonJSON[i]['mod'][t]['type'])
            }
            modCirc[i][t] += "mod" + t;
            modStartAngle = startAngle + 360*(exonJSON[i]['mod'][t].start - exonJSON[i].start)/range
            modEndAngle = startAngle + 360*(exonJSON[i]['mod'][t].end - exonJSON[i].start)/range
            if (exonJSON[i]['mod'][t].type == 'm6A') {
                var m6A = triTagOnCircle(centerX, centerY, 85, 180+modStartAngle)
                epiAnimate(m6A, 'm6A', '#E98B2A', centerX, centerY, exonJSON)
                modCirc[i][t] = m6A
                }
            if (exonJSON[i]['mod'][t].type == 'm1C') {
                var m1C = squareTagOnCircle(centerX, centerY, 85, 180+modStartAngle)
                epiAnimate(m1C, 'm1C', '#E16B8C', centerX, centerY, exonJSON)
                modCirc[i][t] = m1C
            }
            if (exonJSON[i]['mod'][t].type == 'm1A') {
                var m1A = circleTagOnCircle(centerX, centerY, 85, 180+modStartAngle, '#64363C')
                epiAnimate(m1A, 'm1A', '#64363C', centerX, centerY, exonJSON)
                modCirc[i][t] = m1A
                }
            if (exonJSON[i]['mod'][t].type == 'SNP') {
                var SNP = arrowOnCircle(centerX, centerY, 85, 180+modStartAngle)
                epiAnimate(SNP, 'SNP', '#000', centerX, centerY, exonJSON)
                modCirc[i][t] = SNP
                }
            if (exonJSON[i]['mod'][t].type == 'MRE') {
                modPath = describeArc(centerX, centerY, 70, modStartAngle, modEndAngle)
                var MRE = svg.paper.path(modPath).attr({
                    stroke: '#6D2E5B',
                    strokeWidth: 5,
                    fill: 'none',
                    "cursor": "pointer"
                }).mouseover(function(){
                    Snap.animate(5, 6.5, function (val) {
                        MRE.attr({
                            stroke: '#6D2E5B',
                            strokeWidth: val,
                            cursor: 'pointer'
                        });
                    }, 200);
                    text = textCenter(centerX, centerY, "MRE", 15, '#6D2E5B')
                }).mouseout(function(){
                    Snap.animate(6.5, 5, function (val) {
                        MRE.attr({
                            stroke: '#6D2E5B',
                            strokeWidth: val,
                            cursor: 'pointer'
                        });
                    }, 200);
                    text.remove()
                }).click(function(){openNewTab(exonJSON[i]['mod'][t].link)})
                modCirc[i][t] = MRE
            }
            if (exonJSON[i]['mod'][t].type == 'ORF') {
                modPath = describeArc(centerX, centerY, 63, modStartAngle, modEndAngle)
                var ORF = svg.paper.path(modPath).attr({
                    stroke: '#516E41',
                    strokeWidth: 5,
                    fill: 'none',
                    "cursor": "pointer"
                }).mouseover(function(){
                    Snap.animate(5, 6.5, function (val) {
                        ORF.attr({
                            stroke: '#516E41',
                            strokeWidth: val,
                            cursor: 'pointer'
                        });
                    }, 200);
                    text = text = textCenter(centerX, centerY, "ORF", 15, '#516E41')
                }).mouseout(function(){
                    Snap.animate(6.5, 5, function (val) {
                        ORF.attr({
                            stroke: '#516E41',
                            strokeWidth: val,
                            cursor: 'pointer'
                        });
                    }, 200);
                    text.remove()
                }).click(function(){openNewTab(exonJSON[i]['mod'][t].link)})
                modCirc[i][t] = ORF
            }
        //console.log(i, t, modCirc[i][t])
        }
        if (endAngle - startAngle == 360) {
            circle[i] = svg.paper.circle(centerX, centerY, 80).attr({
                stroke: exonJSON[i].color,
                strokeWidth: 10,
                fill: 'none'
            })
        }
        else {
        p = describeArc(centerX, centerY, 80, startAngle, endAngle)
        startAngle = endAngle
        circle[i] = svg.paper.path(p).attr({
            stroke: exonJSON[i].color,
            strokeWidth: 10,
            fill: 'none'
        })}
    }

    var juncX = centerX-2, juncY = centerY+75
    junction_point1 = svg.paper.rect(juncX-2.3, juncY, 4, 10).attr({
        fill: "#00AA90",
        stroke: "#000",
        strokeWidth: 0.2,
    })
    junction_point2 = svg.paper.rect(juncX+2.3, juncY, 4, 10).attr({
        fill: "#D0104C",
        stroke: "#000",
        strokeWidth: 0.2
    })

    // draw legend
    console.log("Legend Info: ", modType)
    legend = drawLegend(modType)

    // group everything together
    var group
    if (legend == undefined) {
        group = svg.group(arcBackGround, circName)
    }
    else {
        group = svg.group(arcBackGround, circName, legend)
    }

    for (i=0;i<modCirc.length;i++) {
        for (t=0;t<modCirc[i].length;t++){
        var cx = group
        group = svg.group(cx, modCirc[i][t])
    }}

    for (i=0;i<circle.length;i++) {
        var cc = group
        group = svg.group(cc, circle[i])
    }

    return svg.group(group, junction_point1, junction_point2)
}

// CORE FUNCTION! draw the arc and its circRNA
function arc(start, end, exonJSON){
    console.log("Call Functino arc")
    console.log("print exonJSON", exonJSON)
    var rx = (end-start)/2,
        ry = rx/2,
        startBlock = junction_block(start, "#00AA90"),
        endBlock = junction_block(end, "#D0104C"),
        realStart = getMinMax(exonJSON)[0],
        realEnd = getMinMax(exonJSON)[1],
        display = false,
        circ

    var path = "M" + (start+1) + " 443A" +  rx + " " + ry + " 0 0 1 " + (end+1) + " 443"
    var c = svg.paper.path(path).attr({
        stroke: "#000",
        strokeWidth: 1,
        fill:'none',
        cursor: 'pointer'
    });
    console.log('Drawing Arc: ' + c)

    c.click(function(){
        if (display == false) {
            var x = svg.select("g")
            if (x != null) {
                x.remove()
            }
            circ = drawCircRNA(exonJSON)
            display = true
        }

        else if (display == true) {
            circ.remove()
            display = false
        }
    }).mouseover(function(){
        Snap.animate(1, 6, function (val) {
            c.attr({
                stroke: "#33A6B8",
                strokeWidth: val,
            });
        }, 200);
        startBlock.attr({
            stroke: "#33A6B8",
            strokeWidth: 1
        });
        endBlock.attr({
            stroke: "#33A6B8",
            strokeWidth: 1
        });
        startText = textCenter(start, 470, realStart, 10, '#000')

        endText = textCenter(end, 470, realEnd, 10, '#000')
    }).mouseout(function(){
        Snap.animate(6, 1, function (val) {
            c.attr({
                stroke: "#33A6B8",
                strokeWidth: val,
            });
        }, 200, function(){c.attr({
                stroke: "#000",
                strokeWidth: 1,
                fill:'none',
            });})
        startBlock.attr({
            fill: "#00AA90",
            stroke: "none"
        });
        endBlock.attr({
            fill: "#D0104C",
            stroke: "none"
        })
        startText.remove();
        endText.remove()
    })
    return c
}

// draw an sector
// from an answer in stackflow
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

function describeArc(x, y, radius, startAngle, endAngle){

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;       
}

function backSplicing(exonJSON, arcJSON){
    var exonList = []
    var mm = getMinMax(exonJSON)
    var range = mm[1] - mm[0]
    var colorIndex = 0
    for (i=0;i<exonJSON.length;i++){
        scaleStart = 50+700*(exonJSON[i].start-mm[0])/range
        scaleEnd = 50+700*(exonJSON[i].end-mm[0])/range
        scaleLen = scaleEnd - scaleStart
        if (exonJSON[i].type == "exon") {
            if (colorIndex<7) {
                exon_block(scaleStart, scaleLen, colorList[colorIndex], exonJSON[i].name)
                exonList[i] = {"chr": parseInt($('#chrSelector').val()),
                                "start": exonJSON[i].start,
                                "end": exonJSON[i].end,
                                "circid": "chr" + parseInt($('#chrSelector').val()) + ": " + exonJSON[i].start + "-" + exonJSON[i].end,
                                "color": colorList[colorIndex],
                                "mod": exonJSON[i].mod,
                                "source": exonJSON[i].source,
                                "detail": exonJSON[i].detail}
                colorIndex += 1
            }
            else {
                colorIndex = 0
                exon_block(scaleStart, scaleLen, colorList[colorIndex], exonJSON[i].name)
                exonList[i] = {"chr": parseInt($('#chrSelector').val()),
                                "start": exonJSON[i].start,
                                "end": exonJSON[i].end,
                                "circid": "chr" + parseInt($('#chrSelector').val()) + ": " + exonJSON[i].start + "-" + exonJSON[i].end,
                                "color": colorList[colorIndex],
                                "mod": exonJSON[i].mod,
                                "source": exonJSON[i].source,
                                "detail": exonJSON[i].detail}
                colorIndex += 1
            }
        }
        else if (exonJSON[i].type == "gene") {
            gene_block(scaleStart, scaleLen, geneColor[geneColorIndex], exonJSON[i].name)
        }

    }

    console.log("arc num: ", arcJSON.length)

    for (i=0;i<arcJSON.length;i++) {
        arcStart = arcJSON[i].start
        arcEnd = arcJSON[i].end
        console.log("exonlist len: ", exonList.length)
        for (t=0;t<exonList.length;t++) {
            if (exonList[t].start >= arcStart && exonList[t].end <= arcEnd) {
                drawArc.push(exonList[t])
            }
            else {
                x = 1
            }
        }
    }

    console.log(drawArc)

    for (i=0;i<arcJSON.length;i++) {
        scaleArcStart = 50+700*(arcStart-mm[0])/range
        scaleArcEnd = 50+700*(arcEnd-mm[0])/range
        console.log(1)
        arc(scaleArcStart, scaleArcEnd, drawArc)
    }

    return drawArc
}; 

// get the cordinate triangle around circle
function triCord(centerX, centerY, r, triDegree, triHeight, triType) {
    rad_triDegree = (triDegree-270)*Math.PI/180
    side = Math.sqrt((r + triHeight)**2 + triHeight**2)
    rad_deviateDegree = Math.atan(Math.sqrt(triType)*triHeight/side)

    x1 = centerX + (r)*Math.cos(rad_triDegree)
    y1 = centerY + (r)*Math.sin(rad_triDegree)
    x2 = centerX + (side)*Math.cos(rad_triDegree+rad_deviateDegree)
    y2 = centerY + (side)*Math.sin(rad_triDegree+rad_deviateDegree)
    x3 = centerX + (side)*Math.cos(rad_triDegree-rad_deviateDegree)
    y3 = centerY + (side)*Math.sin(rad_triDegree-rad_deviateDegree)
    x4 = centerX + (r + 2*triHeight)*Math.cos(rad_triDegree)
    y4 = centerY + (r + 2*triHeight)*Math.sin(rad_triDegree)

    return [x1, y1, x2, y2, x3, y3, x4, y4]
}
 
// get the cordinate of a stick
function stickCord(centerX, centerY, r, Degree, Height) {
    rad_Degree = (Degree-270)*Math.PI/180
    x1 = centerX + (r)*Math.cos(rad_Degree)
    y1 = centerY + (r)*Math.sin(rad_Degree)
    x2 = centerX + (r+Height)*Math.cos(rad_Degree)
    y2 = centerY + (r+Height)*Math.sin(rad_Degree)

    return [x1, y1, x2, y2]
}

function triangelOnCircle(centerX, centerY, r, triDegree, triHeight, color){
    cords = triCord(centerX, centerY, r, triDegree, triHeight, 1/3)
    triangele = svg.paper.polygon(cords[0], cords[1], cords[2], cords[3], cords[4], cords[5]).attr({
        stroke: color,
        fill: color,
        "cursor": "pointer",
    })

    return triangele
}

function rhoOnCircle(centerX, centerY, r, rhoDegree, rhoHalfHeight, color){
    cords = triCord(centerX, centerY, r, rhoDegree, rhoHalfHeight, 1)
    rho = svg.paper.polygon(cords[0], cords[1], cords[2], cords[3], cords[6], cords[7], cords[4], cords[5]).attr({
        stroke: color,
        fill: color,
        "cursor": "pointer",
    })

    return rho
}

function arrowOnCircle(centerX, centerY, r, Degree){
    tri = triangelOnCircle(centerX, centerY, r+1, Degree, 1, "#000")
    cords = stickCord(centerX, centerY, r, Degree, 10)
    arrowLine = svg.paper.line(cords[0], cords[1], cords[2], cords[3]).attr({
        stroke: "#000",
        strokeWidth: 0.5
    })
    arrow = svg.group(arrowLine, tri)

    return arrow
}

function circleTagOnCircle(centerX, centerY, r, Degree, color) {
    cords = stickCord(centerX, centerY, r, Degree, 5)
    line = svg.paper.line(cords[0], cords[1], cords[2], cords[3]).attr({
        stroke: color,
        strokeWidth: 1
    })
    circle = svg.paper.circle(cords[2], cords[3], 2).attr({
        fill: color,
        stroke: color,
        "cursor": "pointer"
    })
    circTag = svg.group(circle, line)

    return circTag

}

function triTagOnCircle(centerX, centerY, r, Degree) {
    cords = stickCord(centerX, centerY, r, Degree, 10)
    line = svg.paper.line(cords[0], cords[1], cords[2], cords[3]).attr({
        stroke: "#E98B2A",
        strokeWidth: 1
    })
    tri = triangelOnCircle(centerX, centerY, r+10, Degree, 4.5, "#E98B2A")
    triTag = svg.group(tri, line)

    return triTag

}

function squareTagOnCircle(centerX, centerY, r, Degree) {
    cords = stickCord(centerX, centerY, r, Degree, 5)
    line = svg.paper.line(cords[0], cords[1], cords[2], cords[3]).attr({
        stroke: "#E16B8C",
        strokeWidth: 1
    })
    square = rhoOnCircle(centerX, centerY, r+5, Degree, 2.5, "#E16B8C")
    squareTag = svg.group(square, line)

    return squareTag
}

function rectOnCircle(centerX, centerY, r, a, degree, color) {
    rad_Degree = Snap.rad(degree - 270)
    r += 1
    x = r * Math.cos(rad_Degree) + centerX
    y = r * Math.sin(rad_Degree) + centerY
    rect = svg.paper.rect(x, y, a, a).attr({
        fill: color,
        stroke: color,
        "cursor": "pointer"
    })

    matrix = new Snap.Matrix()
    angle = 45 + degree
    matrix.rotate(angle, x, y)

    rect.transform(matrix)

    return rect
}

function openNewTab(link) {
    window.open(link, "_blank")
}