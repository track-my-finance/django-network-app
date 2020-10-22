

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
                const article = `
                    <article class="border p-2">
                        <span class="float-right"><em>${post.timestamp}</em></span>
                        <span><img src="${post.image}" style="width: 40px; height: 40px;" class="rounded-circle"><a href="/profile/${post.username}"><strong class="text-primary ml-3">${post.username}</strong></a></span>
                        <p style="white-space: pre-line;">
                        ${post.content}
                        </p>
                        <span class="d-flex justify-content-end" translate="no">
                            <strong>${post.likes}</strong>
                            <div class="pretty p-icon p-toggle p-plain ml-2">
                                <input type="checkbox" />
                                <div style="font-size: 30px; color: red;" class="state p-off">
                                    <i class="far fa-heart"></i>
                                </div>
                                <div style="font-size: 30px; color: red;" class="state p-on">
                                    <i class="fas fa-heart"></i>
                                </div>
                            </div>
                        <span>
                    </article>
                `
                document.querySelector('#posts-window').innerHTML += (article);
            })
        }
    })
}

let temp_post;

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
        const link = document.createElement('a');
        const article = `
            <article class="border p-2 posts">
                <span class="float-right"><em>${post.timestamp}</em></span>
                <span><img src="${post.image}" style="width: 40px; height: 40px;" class="rounded-circle"><a href="/profile/${post.username}"><strong class="text-primary ml-3">${post.username}</strong></a></span>
                <p style="white-space: pre-line;">
                    ${post.content}
                </p>
                <span class="d-flex justify-content-end">
                    ${post.likes}
                    <button type="button" class="btn btn-primary" data-toggle="button" aria-pressed="false" autocomplete="off">
                        Like
                    </button>
                <span>
            </article>
        `
        document.querySelector('#posts-window').innerHTML = article + document.querySelector('#posts-window').innerHTML;
    });
    return false;
}