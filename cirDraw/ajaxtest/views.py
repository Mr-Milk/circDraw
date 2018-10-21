from django.shortcuts import render

# Create your views here.

def index(request):
	context = {}
	return render(request, 'ajaxtest/index.html', context)

def json(request):
	context = {}
	return render(request, 'ajaxtest/ajax2.html', context)

def external(request):
	context = {}
	return render(request, 'ajaxtest/ajax3.html', context)