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
let roomId = urlParams.get('room')

if(!roomId){
    roomId = 'main'
}
 let localTracks = []
 let remoteUsers = {}

 //initialization of Agora using ids, token if available and uid
 let joinRoomInit = async()=> {
    client = AgoraRTC.createClient({mode:'rtc',codec:'vp8'})
    await client.join(APP_ID,roomId,token,uid)
    client.on('user-published',handleUserPublished)
    joinStream()
 }

 let joinStream = async() => {
    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()
    let player = `<div class="video__container" id="user-container-${uid}">
    <div class="video__player" id="user-${uid}"></div></div>`
    document.getElementById('streams__container').insertAdjacentHTML('beforeend',player)
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
    }
    if(mediaType==='video'){
        user.videoTrack.play(`user-${user.uid}`)
    }
    if(mediaType==='audio'){
        user.audioTrack.play()
    }
}

 joinRoomInit()