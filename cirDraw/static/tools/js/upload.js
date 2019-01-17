$(document).ready(function(){

    console.log("running")

    $('#resultbutton').hide()
    
    $('#aftersubmit').hide()

    $('#cancel').hide()
    
    $('#myfile').change(function () {
        var a = $('#myfile').val().toString().split('\\');
        console.log(a)
        $('#filename').text(a[a.length -1])
        $('#cancel').show().click(function(){
            $('#filename').text('');
            $('#cancel').hide()
        });
    });

    
    $('#uploadlabel').click(function(){
        $('#myfile').click()
    })
    var reportID
    $('#submit').click(function(){
        $.ajax({
            url: '/upload',
            type: 'POST',
            cache: false,
            data: new FormData($('#fileform')[0]),
            processData: false,
            contentType: false
        }).done(
            function(reportID) {$('#submitstatus').text('✓ Submitted');
                reportID = reportID[0]
        }).fail(
            function() {$('#processtip').text('Failed to upload, please check your connection and refreash.').css("color", "#CB4042")});
    
        $('#aftersubmit').show()
        $('#resultbutton').show()
        var sec = 0;
        intervalID_1 = setInterval(
            function(){
                $('#processtip').text('Processing time: '+ sec + 's')
                sec++;}, 1000);
        
        while (true) {
            intervalID_2 = setInterval($.getJSON("statusfile").done(function(processState){
                if (processState == true) {
                    clearInterval(intervalID_1)
                    $('#processtip').text('Processing Completed! Your report ID is ' + '<b><i>' + reportID + '</i></b>')
                    $('#resultbutton').removeAttr("disabled").attr("href", "www.circdraw.com/tools/"+ reportID)
                    clearInterval(intervalID_2)
                }
            }), 5000)
        }
    })
});