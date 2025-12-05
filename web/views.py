
from json import JSONEncoder
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.db.models import Sum, Avg, Count, Max, Min, Count
from django.views.decorators.csrf import csrf_exempt
from web.models import User, Expense, Income, Token
import datetime
from web.models import PasswordResetCodes
from web.utils import grecaptcha_verify, random_code, PMMAIL
from dotenv import load_dotenv
import os

load_dotenv()
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

def register(request):
    recaptcha_site_key = os.getenv('RECAPTCHA_SITE_KEY')
    
    if 'code' not in request.GET and request.method == 'POST':
        if not grecaptcha_verify(request):
            context = {'message': 'reCAPTCHA verification failed. Please try again.', 'RECAPTCHA_SITE_KEY': recaptcha_site_key}
            return render(request, 'register.html', context)
        if User.objects.filter(email=request.POST['email']).exists():
            context = {'message': 'Email already registered.', 'RECAPTCHA_SITE_KEY': recaptcha_site_key}
            return render(request, 'register.html', context)
        if not User.objects.filter(username = request.POST['username']).exists():
            code = random_code(28)
            now = datetime.datetime.now()
            email = request.POST['email']
            username = request.POST['username']
            password = request.POST['password']
            temporary_code = PasswordResetCodes(email = email,
                                                username = username,
                                                password = password,
                                                code = code,
                                                time = now)
            temporary_code.save()
            print(f"http://localhost:8009/register/?code={code}&email={email}")
            message = PMMAIL(api_key = os.getenv('POST_MARK_API_TOKEN'),
                             subject = "Account Registered.",
                             sender = "mehr@mehr.com",
                             to= email,
                             text_body = "Use the following link to complete your registration: http://localhost:8009/register/?code={}&email={} . This link will expire in 30 minutes.".format(code, email),
                             tag = "create_account")
            message.send()
            context = {'message': 'A confirmation email has been sent to your email address. Please check your inbox.'}
            return render(request, 'login.html', context)
        else:
            context = {'message': 'Username already taken.', 'RECAPTCHA_SITE_KEY': recaptcha_site_key}
            return render(request, 'register.html', context)
    elif 'code' in request.GET:
        code = request.GET['code']
        email = request.GET['email']
        if PasswordResetCodes.objects.filter(code=code, email=email).exists():
            temp_code_entry = PasswordResetCodes.objects.get(code=code, email=email)
            new_user = User.objects.create_user(username=temp_code_entry.username,
                                                email=temp_code_entry.email,
                                                password=temp_code_entry.password)
            token = Token.objects.create(key=random_code(40), user=new_user)
            new_user.save()
            temp_code_entry.delete()
            context = {'message': f'Registration complete. You can now log in. The token associated with your accoutn is {token.key}'}
            return render(request, 'login.html', context)
        else:
            context = {'message': 'Invalid code or email. Please try again.', 'RECAPTCHA_SITE_KEY': recaptcha_site_key}
            return render(request, 'register.html', context)
    else:
        context = {'message': '', 'RECAPTCHA_SITE_KEY': recaptcha_site_key}
        return render(request, 'register.html', context)
    
def index(request):
    context = {}
    return render(request, 'index.html', context)

def login(request):
    context = {}
    return render(request, 'login.html', context)
def password_reset(request):
    context = {}
    return render(request, 'resetpassword.html', context)

def general_stats(request):
    this_token = request.GET['token']
    this_user = User.objects.get(token__key=this_token)
    income  = Income.objects.filter(user=this_user).aggregate(sum_amout = Sum('amount'),
                             avg_amount = Avg('amount'),
                             count = Count('amount'))
    expense = Expense.objects.filter(user=this_user).aggregate(sum_amout = Sum('amount'),
                             avg_amount = Avg('amount'),
                                count = Count('amount'))
    context = {}
    context['expense'] = expense
    context['income'] = income
    return JsonResponse(context, encoder= JSONEncoder)