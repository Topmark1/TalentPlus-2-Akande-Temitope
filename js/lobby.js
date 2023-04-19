
//activating the form
let form = document.getElementById('lobby__form')

//get the name from form to display on the video page
let displayName = localStorage.getItem('display_name')
if(displayName){
    form.name.value = displayName
}

    form.addEventListener('submit',(e)=>{
        e.preventDefault()

        localStorage.setItem('display_name',e.target.name.value)

        let inviteCode = e.target.room.value
        if(!inviteCode){
            inviteCode = String(Math.floor(Math.random()*1000))
        }
        window.location = `group.html?room=${inviteCode}`
    })