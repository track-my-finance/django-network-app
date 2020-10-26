from django.test import Client, TestCase
from .models import User, Post, Like
import unittest, json
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.db import transaction
from django.db.utils import IntegrityError

# Create your tests here.

class NetworkTest(TestCase):

    def setUp(self):
        
        #Create Users
        u1 = User.objects.create(username="u1")
        u1.set_password("1234")
        u1.save()
        u2 = User.objects.create(username="u2")
        u2.set_password("1234")
        u2.save()
        u3 = User.objects.create(username="u3")
        u3.set_password("1234")
        u3.save()

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

    def test_valid_like(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")
        p1 = Post.objects.get(user=u1)
        like = Like.objects.create(post=p1, user=u2)

        self.assertEqual(p1.likes.count(), 1)

    def test_invalid_likes(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")
        p1 = Post.objects.get(user=u1)
        like = Like.objects.create(post=p1, user=u2)

        with self.assertRaises(IntegrityError):
            Like.objects.create(post=p1, user=u2)

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

    def test_invalid_follow(self):
        u1 = User.objects.get(username="u1")
        with self.assertRaises(ValidationError):
            u1.followers.add(u1)


    def test_postsview(self):
        u1 = User.objects.get(username="u1")
        p1 = Post.objects.get(user=u1)

        c = Client()
        response = c.get("/posts")

        self.assertEqual(response.status_code, 200)

    def test_valid_userpage(self):
        u1 = User.objects.get(username="u1")

        c = Client()
        response = c.get(f"/profile/{u1.username}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context["profile"], u1)

    def test_invalid_userpage(self):
        c = Client()
        response = c.get(f"/profile/randomuser")

        self.assertEqual(response.status_code, 404)

    def test_userposts(self):
        u1 = User.objects.get(username="u1")
        posts = u1.posts.all()

        c = Client()
        response = c.get(f"/posts/{u1.username}")
        expected = JsonResponse([post.serialize() for post in posts], safe=False)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, expected.content)

    def test_nouserposts(self):
        u1 = User.objects.get(username="u1")
        posts = u1.posts.all()

        c = Client()
        response = c.get(f"/posts/{u1.username}")

        self.assertEqual(response.status_code, 200)

    def test_likeview(self):
        u1 = User.objects.get(username="u1")
        p2 = Post.objects.get(id=2)

        c = Client()
        c.login(username="u1", password="1234")
        response = c.post(f"/posts/{p2.id}/like")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(p2.likes.count(), 1)

    def test_invalid_likeview(self):
        u1 = User.objects.get(username="u1")
        p2 = Post.objects.get(id=2)
        Like.objects.create(user=u1, post=p2)

        c = Client()
        c.login(username="u1", password="1234")
        response = c.post(f"/posts/{p2.id}/like")

        self.assertEqual(response.status_code, 400)

    def test_dislikeview(self):
        u1 = User.objects.get(username="u1")
        p2 = Post.objects.get(id=2)
        Like.objects.create(user=u1, post=p2)

        c = Client()
        c.login(username="u1", password="1234")
        response = c.post(f"/posts/{p2.id}/dislike")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(p2.likes.count(), 0)

    def test_invalid_dislikeview(self):
        u1 = User.objects.get(username="u1")
        p2 = Post.objects.get(id=2)

        c = Client()
        c.login(username="u1", password="1234")
        response = c.post(f"/posts/{p2.id}/dislike")

        self.assertEqual(response.status_code, 400)

    def test_followview(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")

        c = Client()
        c.login(username="u1", password="1234")
        response = c.post(f"/profile/{u2.username}/follow")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(u1.following.count(), 1)
        self.assertEqual(u2.followers.count(), 1)

    def test_unfollowview(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")
        u1.following.add(u2)

        c = Client()
        c.login(username="u1", password="1234")
        response = c.post(f"/profile/{u2.username}/unfollow")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(u1.following.count(), 0)
        self.assertEqual(u2.followers.count(), 0)

    def test_invalid_followview(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")
        u1.following.add(u2)

        c = Client()
        c.login(username="u1", password="1234")
        response = c.post(f"/profile/{u2.username}/follow")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(u1.following.count(), 1)
        self.assertEqual(u2.followers.count(), 1)

    def test_invalid_unfollowview(self):
        u1 = User.objects.get(username="u1")
        u2 = User.objects.get(username="u2")

        c = Client()
        c.login(username="u1", password="1234")
        response = c.post(f"/profile/{u2.username}/unfollow")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(u1.following.count(), 0)
        self.assertEqual(u2.followers.count(), 0)

    def test_postview(self):
        u1 = User.objects.get(username="u1")
        
        c = Client()
        c.login(username="u1", password="1234")
        response = c.post("/posts", json.dumps({"content": "Hello World"}), content_type="application/json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(u1.posts.count(), 2)

if __name__ == "__main__":
    unittest.main()
