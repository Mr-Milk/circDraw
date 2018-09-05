from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.


def index(request):
	context = {}
	return render(request, 'tools/index.html', context)

def tools(request):
	context = {}
	return render(request, 'tools/tools.html', context)


def display(request):
	result = ["There is None."]
	if request.method == "POST":
		form = UploadFileForm(request.POST, request.FILES)
		#if form.is_valid():
		data_raw_file = request.FILES['upload_file']
		header, result = handle_uploaded_file(data_raw_file)
	context = {}
	return render(request, 'tools/tools.html', context)