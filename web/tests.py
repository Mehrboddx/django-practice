from django.test import TestCase, Client
from django.contrib.auth.models import User
from .models import Token
# Create your tests here.

class PostTests(TestCase):
    def setUp(self):
        # Create users and tokens exactly like your real DB
        self.user = User.objects.create_user(username="mehrboddx", password="pass123")
        self.token = Token.objects.create(key="1234567", user=self.user)
    def test_post_request(self):
        client = Client()
        response = client.post('/submit/expense/', {
            'token':'1234567',
            'amount': '1001',
            'text': 'Social Lunch'
        })
        self.assertEqual(response.status_code, 200)