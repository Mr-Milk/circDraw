$(document).ready(function(){

    $('#fileupload').on('submit', function(event){
        console.log('hello');
        var formData = new FormData($('#fileform')[0]);
            setTimeout(function(){
                $.ajax({
                    xhr: function(e){
                        var xhr = new window.XMLHttpRequest();
                        xhr.upload.addEventLister('process', function(e){
                            if (e.lengthComputable) {
                                var percent = Math.round((e.loaded / e.total) * 100)
                                $('#bar').attr('aria-valuenow', percent).css('width', percent + '%').text(percent + '%')
                            };
                        });

                        return xhr;
                    },
                    beforeSend: function (xhr) {
                                xhr.setRequestHeader("Content-Type", "multipart/form-data");
                                $("#loading").html("<p>loading...</p>");
                            },
                    type: 'POST',
                    url: "upload&save/",
                    data: formData,
                    processData: false,
                    contentType: false,
                    cache: false,
                    success: function(cid){
                        alert(caseid.cid); 
                        var filename = $('#fileform').prop("files")['name'];
                        $('#uploadname').text(filename);
                        var caseID = new STRING(caseid[cid])
                        var myURL = document.URL
                        window.location.href = myURL + "?id=" + caseID;
                    },
                    error: function(ts) { alert(ts.responseText) }
                });
            }, 3000);
        console.log('done');
        event.preventDefault();
        });
});

console.log("running")

$('#cancel').hide()

$('#myfile').change(function () {
    var a = $('#myfile').val().toString().split('\\');
    console.log(a)
    $('#filename').text(a[a.length -1])
    $('#cancel').show().click(function(){
        $('#filename').text('');
        $('#cancel').hide()
    })
    $('#myfile').val() = ''
});

$('#aftersubmit').hide()
$('#submit').click(function(){
    var sec = 0;
    var timer = setInterval(function(){
    $('#aftersubmit').innerHTML('Processing time: '+ sec + 's')
    sec++;
    if (sec < 0) {
        clearInterval(timer);
    }
}, 1000);
})

$.ajax({
    url: 'check if the file is finished uploaded',
    method: get,
    success: function(){
        $('#submitstatus').innerHTML('sumbitted')
    }
})

$.ajax({
    url: 'check if the file is finished processing',
    method: get,
    success: function(){
        $('#aftersubmit').innerHTML('Completed!')
        $('#result').attr({
            'href': 'where to go?'
        })
    }
})

