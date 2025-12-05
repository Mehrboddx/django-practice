from datetime import datetime
from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

class PasswordResetCodes(models.Model):
    code = models.CharField(max_length=50, unique=True)
    email = models.CharField(max_length=254)
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=128)
    time = models.DateTimeField()

    

class Token(models.Model):
    key = models.CharField(max_length=40, primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.user.username
# Create your models here.
class Expense(models.Model):
    text = models.CharField(max_length=255)
    date = models.DateField()
    amount = models.BigIntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.date} - {self.amount}"

class Income(models.Model):
    text = models.CharField(max_length=255)
    date = models.DateField()
    amount = models.BigIntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    def __str__(self):
        return f"{self.date} - {self.amount}"