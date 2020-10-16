from django.test import Client, TestCase
from .models import User, Post, Like
import unittest
from django.core.exceptions import ValidationError

# Create your tests here.

class NetworkTest(TestCase):

    def setUp(self):
        
        #Create Users
        u1 = User.objects.create(username="u1", password="1234")
        u2 = User.objects.create(username="u2", password="1234")
        u3 = User.objects.create(username="u3", password="1234")

        #Create Posts
        p1 = Post.objects.create(user=u1, content="Hello World")
        p2 = Post.objects.create(user=u2, content="Hola Mundo")
        p3 = Post.objects.create(user=u3, content="Bonjour le monde")

    def test_created_posts(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")
        u3 = User.objects.get(username="u3")
        
        self.assertEqual(u1.posts.count(), 1)
        self.assertEqual(u2.posts.count(), 1)
        self.assertEqual(u3.posts.count(), 1)

    def test_like(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")
        p1 = Post.objects.get(user=u1)
        like = Like.objects.create(post=p1, user=u2)

        self.assertEqual(p1.likes.count(), 1)

    def test_valid_likes(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")
        p1 = Post.objects.get(user=u1)
        like = Like.objects.create(post=p1, user=u2)

        self.assertRaises(ValidationError)

    def test_followers(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")
        u2.following.add(u1)

        self.assertEqual(u1.followers.count(), 1)

    def test_following(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")
        u2.followers.add(u1)

        self.assertEqual(u1.following.count(), 1)

    def test_postsview(self):
        u1 = User.objects.get(username="u1")
        p1 = Post.objects.get(user=u1)

        c = Client()
        response = c.get("/posts")

        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
