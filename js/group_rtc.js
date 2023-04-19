//declare all relevant parameters
const APP_ID = "629a3405322b475a9202e4470881665e"

let uid = sessionStorage.getItem('uid')
if(!uid){
    uid = String(Math.floor(Math.random()*1000));
    sessionStorage.setItem('uid',uid)
}

let token = null; //for serious project
let client;

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let groupId = urlParams.get('group')

if(!groupId){
    groupId = 'main'
}
 let localTracks = []
 let remoteUsers = {}

 //initialization of Agora using ids, token if available and uid
 let joingroupInit = async()=> {
    client = AgoraRTC.createClient({mode:'rtc',codec:'vp8'})
    await client.join(APP_ID,groupId,token,uid)
    client.on('user-published',handleUserPublished)
    client.on('user-left',handleUserLeft)
    joinStream()
 }

 let joinStream = async() => {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    //video quality can be set by putting inside the bracket
    /*({},{encoderConfig:{
        width:{min:640,ideal:1920,max:1920},
       height:{min:480,ideal:1080,max:1080},
    }}) */

    let player = `<div class="video__container" id="user-container-${uid}"><div class="video__player" id="user-${uid}"></div></div>`
    document.getElementById('streams__container').insertAdjacentHTML('beforeend',player);
    document.getElementById(`user-container-${uid}`).addEventListener('click',expandVideoFrame)

    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[0],localTracks[1]])// [0] is audio and [1] is video
    //only you can see yourself now
 }

 //publish your video, audio etc to the RTC group core
let handleUserPublished = async(user,mediaType)=>{
    
    remoteUsers[user.uid] = user 
    await client.subscribe(user,mediaType)
    //autheticate the new user
    let player = document.getElementById(`user-container-${user.uid}`)
    if(player===null){ //to avoid duplicate
        player = `<div class="video__container" id="user-container-${user.uid}">
        <div class="video__player" id="user-${user.uid}"></div></div>`
        //append a screen view the the group
        document.getElementById('streams__container').insertAdjacentHTML('beforeend',player)
        document.getElementById(`user-container-${user.uid}`).addEventListener('click',expandVideoFrame)
    }
    if(displayFrame.style.display){
        player.style.height = '100px'
        player.style.width = '100px'
    }
    if(mediaType==='video'){
        user.videoTrack.play(`user-${user.uid}`)
    }
    if(mediaType==='audio'){
        user.audioTrack.play()
    }
}

//when use leaves to delete session and resdjust designs to default
let handleUserLeft = async (user) =>{
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()

    if(userInDisplayFrame === `user-container-${user.uid}`){
        displayFrame.style.display = null

        let videoFrames = document.getElementsByClassName('video__container')
        for(let i=0;videoFrames.length > i; i++){
            videoFrames[i].style.height = '300px'
            videoFrames[i].style.width = '300px'
        }
    }
}

    //Toggle Cameraa with button code
    let toggleCamera = async (e)=>{
        let button = e.currentTarget
        if(localTracks[1].muted){
            await localTracks[1].setMuted(false)
            button.classList.add('active')
        }else{
            await localTracks[1].setMuted(true)
            button.classList.remove('active')
        }
    }

    document.getElementById('camera-btn').addEventListener('click',toggleCamera)

 joingroupInit()