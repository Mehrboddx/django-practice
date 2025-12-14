from django.urls import path
from . import views

urlpatterns = [
    path('submit/expense/', views.submit_expense, name='submit_expense'),
    path('submit/income/', views.submit_income, name='submit_income'),
    path('register/', views.register, name='register'),
    path('', views.index, name='index'),
    path('login/', views.login, name='login'),
    path('resetpassword/', views.password_reset, name='password_reset'),
    path('q/general_stats/', views.general_stats, name='general_stats'),
    path('q/income/', views.query_income, name='query_income'),
    path('q/expense/', views.query_expense, name='query_expense'),
    path('q/expense_history/', views.expense_history, name='expense_history'),
    path('q/income_history/', views.income_history, name='income_history'),
    path('update_expense/', views.update_expense, name='update_expense'),
    path('update_income/', views.update_income, name='update_income'),
    path('delete_expense/', views.delete_expense, name='delete_expense'),
    path('delete_income/', views.delete_income, name='delete_income'),
]

