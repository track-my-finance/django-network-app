const article = (post) => {
    return `
        <article class="border p-2">
        <span class="float-right"><em>${post.timestamp}</em></span>
        <span><img src="${post.image}" style="width: 40px; height: 40px;" class="rounded-circle"><a href="/profile/${post.username}"><strong class="text-primary ml-3">${post.username}</strong></a></span>
        <p style="white-space: pre-line;">
            ${post.content}
        </p>
        <span class="d-flex justify-content-end">
            <strong id="like-count-${post.id}" class="mt-auto mb-auto mr-2">${post.likes}</strong>
            <div style="color:red; font-size:30px; margin-right: 5px;" class="pretty p-icon p-toggle p-plain">
                <input id="like-button-${post.id}" onclick=like(${post.id}) type="checkbox" />
                <div class="state p-off">
                    <i class="far fa-heart"></i>
                </div>
                <div class="state p-on p-info-o">
                    <i class="fas fa-heart"></i>
                </div>
            </div>
        <span>
    </article>
    `
}

document.addEventListener('DOMContentLoaded', () => {
    
    const profile_icon = document.querySelector('#profile-icon');
    const profile_options = document.querySelector('#profile-panel');
    profile_options.style.animationPlayState = 'paused';

    //Trigger Menu
    profile_icon.addEventListener('click', () => {
        profile_options.style.animationPlayState = 'running';
    });

    //Restart Animation
    document.addEventListener('click', (event) => {
        if(event.target.id !== 'profile-panel' && event.target.tagName !== 'A' && event.target.id !== 'profile-icon'){
            reset_animation();
        }
    });
    
    document.querySelector('#post-submit').onsubmit = () => {
        console.log(submit_post());
        return false;
    }

    load_posts();
});

function reset_animation(){
    const profile_options = document.querySelector('#profile-panel');
    profile_options.style.animation = 'none';
    profile_options.offsetHeight;
    profile_options.style.animation = null; 
    profile_options.style.animationPlayState = 'paused';
}

function load_posts(){
    document.querySelector('#posts-window').innerHTML = '';
    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        
        if (posts.length === 0){
            document.querySelector('#posts-window').innerHTML = 'Nothing to show';
        }
        else{
            posts.forEach(post => {
                document.querySelector('#posts-window').innerHTML += article(post);
            });

            format_liked_posts(posts);
        }
    })
}

function format_liked_posts(posts){
    posts.forEach(post => {
        const user = localStorage.getItem('user');
        console.log(post.like_users);
        const length = post.like_users.filter(element => element === user).length;
        const like_button = document.querySelector(`#like-button-${post.id}`);
        if(length > 0){
            like_button.checked = true;
        }
    })
}

function like(id){
    const like_button = document.querySelector(`#like-button-${id}`);
    let like_count = document.querySelector(`#like-count-${id}`);
    if (like_button.checked){
        fetch(`/posts/${id}/like`, {method: 'POST'})
        .then(response => response.json())
        .then(result => {
            like_count.innerHTML = result.likes;
        });
    }
    else{
        fetch(`/posts/${id}/dislike`, {method: 'POST'})
        .then(response => response.json())
        .then(result => {
            like_count.innerHTML = result.likes;
        });
    }
}

function submit_post(){
    fetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
            content: `${document.querySelector('#post-content').value}`
        })
    })
    .then(response => response.json())
    .then(post => {
        document.querySelector('#post-content').value = '';
        document.querySelector('#posts-window').innerHTML = article(post) + document.querySelector('#posts-window').innerHTML;
    });
    return false;
}