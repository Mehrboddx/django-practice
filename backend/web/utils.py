from django.http import HttpResponse
from django.conf import settings
import random
import string
from dotenv import load_dotenv
import os
import datetime
import requests

load_dotenv()
def grecaptcha_verify(request):  # Add this import at the top of utils.py
    
    recaptcha_response = request.POST.get('g-recaptcha-response')
    data = {
        'secret': os.getenv('RECAPTCHA_SECRET_KEY'),
        'response': recaptcha_response
    }
    r = requests.post('https://www.google.com/recaptcha/api/siteverify', data=data)  # Changed from request.post
    result = r.json()
    return result.get('success', False)

def random_code(length=8):
    letters_and_digits = string.ascii_letters + string.digits
    return ''.join(random.choice(letters_and_digits) for i in range(length))

class PMMAIL:
    """Placeholder for Postmark email sending"""
    def __init__(self, api_key, subject, sender, to, text_body, tag=None):
        self.api_key = api_key
        self.subject = subject
        self.sender = sender
        self.to = to
        self.text_body = text_body
        self.tag = tag
    
    def send(self):
        """Placeholder send method - prints email details"""
        print("=" * 60)
        print("📧 Email would be sent:")
        print(f"  From: {self.sender}")
        print(f"  To: {self.to}")
        print(f"  Subject: {self.subject}")
        print(f"  Tag: {self.tag}")
        print(f"  Body: {self.text_body[:100]}...")
        print("=" * 60)
        return True