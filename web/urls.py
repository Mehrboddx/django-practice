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

]

