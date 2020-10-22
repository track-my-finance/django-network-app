from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.exceptions import ValidationError
from django.db.models.signals import m2m_changed
from django.dispatch import receiver



class User(AbstractUser):
    image = models.ImageField(upload_to="users/", default="site/default.jpg")
    following = models.ManyToManyField("User", blank=True, related_name="followers")
    

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "username": self.user.username,
            "image": self.user.image.url,
            "timestamp": self.timestamp.strftime(f"%b %d %Y, %I:%M %p"),
            "content": self.content,
            "likes": self.likes.count()
        }


class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")

    class Meta:
        unique_together = ["post", "user"]

@receiver(m2m_changed, sender=User.following.through)
def validate_following(sender, **kwargs):
    instance = kwargs.pop('instance', None)
    pk_set = kwargs.pop('pk_set', None)
    action = kwargs.pop('action', None)
    if action == "pre_add":
        if instance.pk in pk_set:
            raise ValidationError("Can't follow yourself")