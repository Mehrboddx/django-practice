
from json import JSONEncoder
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from web.models import User, Expense, Income, Token
import datetime
# Create your views here.
@csrf_exempt
def submit_expense(request):
    token = request.POST['token']
    this_user = User.objects.get(token__key=token)
    if "date" not in request.POST:
        date = datetime.date.today()
    else:
        date = request.POST['date']
    Expense.objects.create(user = this_user,
                           amount = request.POST['amount'],
                           text = request.POST['text'], 
                           date = date)

    return JsonResponse({'status': 'success'}, encoder= JSONEncoder)
@csrf_exempt
def submit_income(request):
    token = request.POST['token']
    this_user = User.objects.get(token__key=token)
    if "date" not in request.POST:
        date = datetime.date.today()
    else:
        date = request.POST['date']
    Income.objects.create(user = this_user,
                           amount = request.POST['amount'],
                           text = request.POST['text'], 
                           date = date)

    return JsonResponse({'status': 'success'}, encoder= JSONEncoder)