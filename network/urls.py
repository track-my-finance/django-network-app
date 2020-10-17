
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("profile/<str:username>", views.profile, name="profile"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API Routes
    path("profile/<str:username>/follow", views.follow, name="follow"),
    path("profile/<str:username>/unfollow", views.unfollow, name="unfollow"),
    path("posts", views.posts, name="posts"),
    path("posts/<int:post_id>/like", views.like, name="like"),
    path("posts/<int:post_id>/dislike", views.dislike, name="dislike"),
    path("posts/<str:username>", views.user_posts, name="user_posts"),
]
