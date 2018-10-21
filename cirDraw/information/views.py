from django.shortcuts import render
# Create your views here.

def about(request):
	context = {}
	return render(request, 'information/about.html', context)

def manual(request):
	context = {}
	return render(request, 'information/manual.html', context)
