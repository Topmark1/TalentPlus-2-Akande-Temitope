//declare all relevant parameters
const APP_ID = "629a3405322b475a9202e4470881665e"

let uid = sessionStorage.getItem('uid')
if(!uid){
    uid = String(Math.floor(Math.random()*1000));
    sessionStorage.setItem('uid',uid)
}

let token = null; //for serious project
let client;

//setting up for real time messaging
let rtmClient;
let channel;

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
let groupId = urlParams.get('group')

//name of member
let displayName = localStorage.getItem
if(!displayName){
    window.location = 'index.html'
}

if(!groupId){
    groupId = 'main'
}
 let localTracks = []
 let remoteUsers = {}

 let localScreenTracks;
 let sharingScreen = false;

 //initialization of Agora using ids, token if available and uid
 let joingroupInit = async()=> {
    rtmClient = await AgoraRTM.createInstance(APP_ID)
    await rtmClient.login({uid,token})

    //display name
    await rtmClient.addOrUpdateLocalUserAttributes({'name':displayName})

    //crating a chat channel and joining
    channel = await rtmClient.createChannel(groupId)
    await channel.join()

    channel.on('MemberJoined',handleMemberJoined)
    channel.on('MemberLeft',handleMemberLeft)
    channel.on('ChannelMessage',handleChannelMessage)

    getMembers()
    addBotMessageToDom(`Welcome to the room ${displayName}! 👋`)

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

 //setting up normal video recovery after using screen mode
 let switchToCamera = async ()=>{
    player = `<div class="video__container" id="user-container-${uid}">
    <div class="video__player" id="user-${uid}"></div></div>`

    displayFrame.insertAdjacentHTML('beforeend',player)
    await localTracks[0].setMuted(true)
    await localTracks[1].setMuted(true)
    document.getElementById('mic-btn').classList.remove('active')
    document.getElementById('screen-btn').classList.remove('active')

    localTracks[1].play(`user-${uid}`)
    await client.publish([localTracks[1]])
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

        let videoFrames = document.getElementById(`user-container-${user.uid}`)
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

    //Toggle Microphone audio with button code
    let toggleAudio = async (e)=>{
        let button = e.currentTarget
        if(localTracks[0].muted){
            await localTracks[0].setMuted(false)
            button.classList.add('active')
        }else{
            await localTracks[0].setMuted(true)
            button.classList.remove('active')
        }
    }
    document.getElementById('mic-btn').addEventListener('click',toggleAudio)

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

    //Screen sharing Videos
    let toggleScreen = async (e)=>{
            let screenB = e.currentTarget
            let cameraB = document.getElementById('camera-btn')

            if(!sharingScreen)
            {
            sharingScreen = true
            screenB.classList.add('active')
            cameraB.classList.remove('active')
            cameraB.style.display = 'none'

            localScreenTracks = await AgoraRTC.createScreenVideoTrack()
            document.getElementById(`user-container-${uid}`).remove()
            displayFrame.style.display = 'block'

            let player = `<div class="video__container" id="user-container-${uid}"><div class="video__player" id="user-${uid}"></div></div>`

            displayFrame.insertAdjacentHTML('beforeend',player)
            document.getElementById(`user-container-${uid}`).addEventListener('click',expandVideoFrame)

            userIdInDisplayFrame = `user-container-$
            {uid}`
            localScreenTracks.play(`user-${uid}`)
            
            await client.unpublish([localTracks[1]])
            await client.publish([localScreenTracks])

            let videoFrames = document.getElementsByClassName('video__container')
            for(let i = 0; videoFrames.length >i ; i++){
                if(videoFrames[i].id !=userIdInDisplayFrame){
                videoFrames[i].style.height='100px'
                videoFrames[i].style.width='100px'
              } }

            }else{
                sharingScreen = false
                cameraB.style.display = 'block'
                document.getElementById(`user-container-${uid}`).remove()
                await client.unpublish([localScreenTracks])

                switchToCamera()
            }        
        }
    document.getElementById('screen-btn').addEventListener('click',toggleScreen)

 joingroupInit()