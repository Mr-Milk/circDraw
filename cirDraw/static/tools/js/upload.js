$(document).ready(function(){

    console.log("running")
    
    $('#myfile').change(function () {
        $("#processtip").text('')
        var a = $('#myfile').val().toString().split('\\');
        console.log(a)
        $('#filename').text(a[a.length -1])
        $('#cancel').show().click(function(){
            $('#filename').text('');
            $('#cancel').hide()
        });
    });


    $('#submit').click(function(e){
        e.preventDefault();
        //e.stopPropagation();
        var formdata = new FormData(),
            parameters = {"FileType": $("#software").val(),
                    "Species": $("#species").val(),
                    "expvalue": $("#expvalue").val(),
                    "denvalue": $("#denvalue").val()}

        formdata.append('file', $('#fileform')[0])
        formdata.append('parameters', parameters)
       $.ajax({
            url: '/upload',
            type: 'POST',
            cache: false,
            dataType: "json",
            data: formdata,
            processData: false,
            contentType: false
        })
        .done(
            function(reportID) {$('#submit').text('✓ Submitted');
                var reportID = reportID[0]
                $('#resultbutton').show()
                var sec = 0;
                intervalID_1 = setInterval(
                    function(){
                        $('#processtip').text('Processing time: '+ sec + 's')
                        sec++;}, 1000);

                $.getJSON("statusfile").done(function(processState){
                    if (processState == true) {
                        clearInterval(intervalID_1)
                        $('#processtip').text('Processing Completed! Your report ID is ' + '<b><i>' + reportID + '</i></b>')
                        $('#resultbutton').removeAttr("disabled").attr("href", "www.circdraw.com/tools/"+ reportID)
                    }

                    if (processState == false) {
                        clearInterval(intervalID_1)
                        $('#processtip').text('Processing Failed!')
                    }
                })
            }).fail(
                function(){
                    if ($('#myfile').val() === "") {
                        $('#processtip').text('Please choose a file to upload.').css("color", "#CB4042")
                    }
                    else {
                    $('#processtip').text('Failed to upload, please check your connection and refreash.').css("color", "#CB4042")}
                        }
                    )
                
})})