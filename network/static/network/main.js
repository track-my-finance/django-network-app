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
    fetch('/posts')
    .then(response => response.json())
    .then(posts => {
        
        if (posts.length === 0){
            document.querySelector('#posts-window').innerHTML = 'Nothing to show';
        }
        else{
            posts.forEach(post => {
                const link = document.createElement('a');
                link.innerHTML = `
                    <article class="border p-2">
                        <span class="float-right"><em>${post.timestamp}</em></span>
                        <span><img src="${post.user.image.url}" style="width: 40px; height: 40px;" class="rounded-circle"><strong class="text-primary ml-3">${post.user.username}</strong></span>
                        <p>
                            ${post.content}
                        </p>
                    </article>
                `
            })
        }
    })
}

function submit_post(){
    fetch('/posts')
}