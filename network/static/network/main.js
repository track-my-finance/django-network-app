document.addEventListener('DOMContentLoaded', () => {
    
    const profile_icon = document.querySelector('#profile-icon');
    const profile_options = document.querySelector('#profile-panel');
    profile_options.style.animationPlayState = 'paused';

    //Trigger Menu
    profile_icon.addEventListener('click', () => {
        profile_options.style.animationPlayState = 'running';
    })

    //Restart Animation
    document.addEventListener('click', (event) => {
        if(event.target.id !== 'profile-panel' && event.target.tagName !== 'A' && event.target.id !== 'profile-icon'){
            profile_options.style.animation = 'none';
            profile_options.offsetHeight;
            profile_options.style.animation = null; 
            profile_options.style.animationPlayState = 'paused';
        }
    })
})