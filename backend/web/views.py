
from json import JSONEncoder
from django.http import JsonResponse
from django.shortcuts import redirect, render, get_object_or_404
from django.db.models import Sum, Avg, Count, Max, Min, Count
from django.views.decorators.csrf import csrf_exempt
from web.models import User, Expense, Income, Token
import datetime
from web.models import PasswordResetCodes
from web.utils import grecaptcha_verify, random_code, PMMAIL
from dotenv import load_dotenv
from django.views.decorators.http import require_POST
import os

load_dotenv()
# Create your views here.

@csrf_exempt
@require_POST
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
@csrf_exempt

def login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        if not username or not password:
            return render(request, 'login.html', {'message': 'Username and password required.'})

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return render(request, 'login.html', {'message': 'User not found.'})

        if user.check_password(password):
            token = Token.objects.get(user=user)
            return JsonResponse({'message': 'Login successful.', 'token': token.key}, encoder=JSONEncoder)
        return render(request, 'login.html', {'message': 'Invalid password.'})

    # GET -> render form
    return render(request, 'login.html', {'message': ''})
        
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

def password_reset(request):
    context = {}
    return render(request, 'resetpassword.html', context)

def general_stats(request):
    this_token = request.GET['token']
    this_user = get_object_or_404(User, token__key=this_token)
    income  = Income.objects.filter(user=this_user).aggregate(sum_amount = Sum('amount'),
                             avg_amount = Avg('amount'),
                             count = Count('amount'))
    expense = Expense.objects.filter(user=this_user).aggregate(sum_amount = Sum('amount'),
                             avg_amount = Avg('amount'),
                                count = Count('amount'))
    context = {}
    context['expense'] = expense
    context['income'] = income
    return JsonResponse(context, encoder= JSONEncoder)

def query_income(request):
    this_token = request.GET['token']
    count = request.GET.get('count', 10)
    this_user = get_object_or_404(User, token__key=this_token)
    incomes = Income.objects.filter(user=this_user).values('date').annotate(total_amount=Sum('amount')).order_by('date')[:int(count)]
    data = list(incomes)
    for data_point in data:
        data_point['date'] = str(data_point['date'])
    return JsonResponse({'incomes': data}, encoder= JSONEncoder)

def query_expense(request):
    this_token = request.GET['token']
    count = request.GET.get('count', 10)
    this_user = get_object_or_404(User, token__key=this_token)
    expenses = Expense.objects.filter(user=this_user).values('date').annotate(total_amount=Sum('amount')).order_by('date')[:int(count)]
    data = list(expenses)
    for data_point in data:
        data_point['date'] = str(data_point['date'])
    return JsonResponse({'expenses': data}, encoder= JSONEncoder)
def expense_history(request):
    this_token = request.GET['token']
    this_user = get_object_or_404(User, token__key=this_token)
    expense_history = Expense.objects.filter(user=this_user).values().order_by('-date')
    data = list(expense_history)
    for data_point in data:
        data_point['date'] = str(data_point['date'])
    return JsonResponse({'expenses':data}, encoder=JSONEncoder)
def income_history(request):
    this_token = request.GET['token']
    this_user = get_object_or_404(User, token__key=this_token)
    income_history = Income.objects.filter(user=this_user).values().order_by('-date')
    data = list(income_history)
    for data_point in data:
        data_point['date'] = str(data_point['date'])
    return JsonResponse({'incomes':data}, encoder=JSONEncoder)

@csrf_exempt
def update_expense(request):
    token =  request.POST['token']
    expense_id = request.POST['expense_id']
    new_amount = request.POST['amount']
    new_text = request.POST['text']
    new_date = request.POST['date']
    this_user = get_object_or_404(User, token__key=token)
    old_expense = get_object_or_404(Expense, id=expense_id, user=this_user)
    old_expense.amount = new_amount
    old_expense.text = new_text
    old_expense.date = new_date
    old_expense.save()
    return JsonResponse({'status': 'success'})

@csrf_exempt
def update_income(request):
    token =  request.POST['token']
    income_id = request.POST['income_id']
    new_amount = request.POST['amount']
    new_text = request.POST['text']
    new_date = request.POST['date']
    this_user = get_object_or_404(User, token__key=token)
    old_income = get_object_or_404(Income, id=income_id, user=this_user)
    old_income.amount = new_amount
    old_income.text = new_text
    old_income.date = new_date
    old_income.save()
    return JsonResponse({'status': 'success'})
@csrf_exempt
@require_POST
def delete_expense(request):
    token = request.POST['token']
    expense_id = request.POST['expense_id']
    this_user = get_object_or_404(User, token__key=token)
    expense = get_object_or_404(Expense, id=expense_id, user=this_user)
    expense.delete()
    return JsonResponse({'status': 'success'}, encoder=JSONEncoder)

@csrf_exempt
@require_POST
def delete_income(request):
    token = request.POST['token']
    income_id = request.POST['income_id']
    this_user = get_object_or_404(User, token__key=token)
    income = get_object_or_404(Income, id=income_id, user=this_user)
    income.delete()
    return JsonResponse({'status': 'success'}, encoder=JSONEncoder)