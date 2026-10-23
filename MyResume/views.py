from django.shortcuts import render

def home_view(request):
    return render(request, 'index.html')

def view_404(request):
    return render(request, '404.html')
