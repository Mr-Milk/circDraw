// var file = document.getElementById('fileBox').files[0]; //Files[0] = 1st file
// var reader = new FileReader();
// reader.readAsText(file, 'UTF-8');
// reader.onload = shipOff;
// //reader.onloadstart = ...
// //reader.onprogress = ... <-- Allows you to update a progress bar.
// //reader.onabort = ...
// //reader.onerror = ...
// //reader.onloadend = ...


// function shipOff(event) {
//     var result = event.target.result;
//     var fileName = document.getElementById('my-file-selector').files[0].name; //Should be 'picture.jpg'
//     $.post('/tools/save/', { data: result, name: fileName }, continueSubmission);
// }