from django.db import models
from django.contrib.auth.models import User

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