const article = (post, animation = "") => {
    let isChecked = "";
    let isEditable = "";
    const user = localStorage.getItem('user');
    const length = post.like_users.filter(element => element === user).length;
    if(length > 0){
        isChecked = "checked";
    }

    if (post.username === user){
        isEditable = `
            <button id="edit-${post.id}" class="btn btn-outline-primary mr-3" onclick="convert_to_textbox('${post.id}')">Edit</button>
        `
    }

    return `
        <article class="border p-2 ${animation}">
        <span class="float-right"><em>${post.timestamp}</em></span>
        <span><img src="${post.image}" style="width: 40px; height: 40px;" class="rounded-circle"><a href="/profile/${post.username}"><strong class="text-primary ml-3">${post.username}</strong></a></span>
        <p id="content-${post.id}" style="white-space: pre-line;">
            ${post.content}
        </p>
        <span class="d-flex justify-content-end">
            ${isEditable}
            <strong id="like-count-${post.id}" class="mt-auto mb-auto mr-2">${post.likes}</strong>
            <div style="color:red; font-size:30px; margin-right: 5px;" class="pretty p-icon p-toggle p-plain">
                <input id="like-button-${post.id}" onclick=like(${post.id}) type="checkbox" ${isChecked}/>
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
    try{
        const newest_button = document.querySelector('#newest-btn');
        const following_button = document.querySelector('#following-btn');
        newest_button.addEventListener('click', () => {
            newest_button.classList.add('active');
            following_button.classList.remove('active');
            document.querySelector('#title').innerHTML = 'Newest';
            document.querySelector('#post-submit').style.display = 'block';
            load_posts();
        });
        following_button.addEventListener('click', () => {
            following_button.classList.add('active');
            newest_button.classList.remove('active');
            document.querySelector('#title').innerHTML = 'Following';
            document.querySelector('#post-submit').style.display = 'none';
            load_posts("/following");
        })
    }catch{}

    if(localStorage.getItem('user') !== "" && window.location.pathname === "/"){
        document.querySelector('#post-submit').style.display = "block";
        document.querySelector('#post-submit').onsubmit = () => {
            console.log(submit_post());
            return false;
        }
    } else if (window.location.pathname === "/") {
        document.querySelector('#post-submit').style.display = "none";
    }

    if (window.location.pathname.split("/")[1] === 'profile'){
        try{
            const follow_button = document.querySelector('#follow-button');
            follow_button.addEventListener('click', () => {
                if (follow_button.innerHTML === 'Follow'){
                    follow(window.location.pathname.split("/")[2]);
                    follow_button.className = 'btn btn-secondary float-right';
                    follow_button.innerHTML = 'Unfollow';
                } else if (follow_button.innerHTML === 'Unfollow'){
                    unfollow(window.location.pathname.split("/")[2]);
                    follow_button.className = 'btn btn-primary float-right';
                    follow_button.innerHTML = 'Follow';
                }
            })
        }
        catch{}
        load_posts("/" + window.location.pathname.split("/")[2]);
    }
    else{
        load_posts();
    }

});

let list = new Array();
let pageList = new Array();
let currentPage = 1;
let numberPerPage = 10;
let numberOfPages = 0;

function getNumberOfPages() {
    return Math.ceil(list.length / numberPerPage);
}

function nextPage() {
    currentPage += 1;
    loadList();
}

function previousPage() {
    currentPage -= 1;
    loadList();
}

function firstPage() {
    currentPage = 1;
    loadList();
}

function lastPage() {
    currentPage = numberOfPages;
    loadList();
}

function loadList() {
    var begin = ((currentPage - 1) * numberPerPage);
    var end = begin + numberPerPage;

    pageList = list.slice(begin, end);
    drawList();
    check();
}

function drawList() {
    document.getElementById("posts-window").innerHTML = "";
    for (r = 0; r < pageList.length; r++) {
        document.getElementById("posts-window").innerHTML += pageList[r];
    }
    document.getElementById("page-number").innerHTML = currentPage;
}

function check() {
    document.getElementById("next").disabled = currentPage == numberOfPages ? true : false;
    document.getElementById("previous").disabled = currentPage == 1 ? true : false;
    document.getElementById("first").disabled = currentPage == 1 ? true : false;
    document.getElementById("last").disabled = currentPage == numberOfPages ? true : false;
}

function load_posts(user_route = ""){
    document.querySelector('#posts-window').innerHTML = '';
    fetch(`/posts${user_route}`)
    .then(response => response.json())
    .then(posts => {
        currentPage = 1;
        if (posts.length === 0){
            document.querySelector('#posts-window').innerHTML = 'Nothing to show';
        }
        else{
            list = [];
            posts.forEach(post => {
                list.push(article(post))
            });
            numberOfPages = getNumberOfPages();
            loadList();
        }
    })
}

function format_liked_posts(posts){
    posts.forEach(post => {
        const user = localStorage.getItem('user');
        const length = post.like_users.filter(element => element === user).length;
        const like_button = document.querySelector(`#like-button-${post.id}`);
        if(length > 0){
            like_button.checked = true;
        }
    })
}

function format_disabledlike_posts(posts){
    posts.forEach(post => {
        const like_button = document.querySelector(`#like-button-${post.id}`);
        like_button.disabled = true;
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

function follow(username){
    fetch(`/profile/${username}/follow`, {method: 'POST'});
}

function unfollow(username){
    fetch(`/profile/${username}/unfollow`, {method: 'POST'});
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
        document.querySelector('#posts-window').innerHTML = article(post, "posts") + document.querySelector('#posts-window').innerHTML;
    });
    return false;
}

function convert_to_textbox(post_id){
    content = document.getElementById(`content-${post_id}`).innerHTML.trim();
    document.getElementById(`edit-${post_id}`).parentElement.parentElement.innerHTML = `
        <form id="edit-submit-${post_id}">
            <textarea id="post-content-${post_id}" style="height:130px;" class="form-control">${content}</textarea>
            <input type="submit" class="btn btn-primary" value="Save">
        </form>
    `;
    document.getElementById(`post-content-${post_id}`).value = content;
    document.getElementById(`edit-submit-${post_id}`).onsubmit = () => {
        edit_post(post_id);
        return false;
    }
}

function edit_post(post_id){
    fetch(`/posts/edit/${post_id}`, {
        method: 'POST',
        body: JSON.stringify({
            content: `${document.querySelector(`#post-content-${post_id}`).value}`
        })
    })
    .then(response => response.json())
    .then(post => {
        document.querySelector(`#post-content-${post_id}`).parentElement.parentElement.innerHTML = article(post);
    });
    return false;
}