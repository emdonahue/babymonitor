// https://shanetully.com/2014/09/a-dead-simple-webrtc-example/
// src/webrtc
//another example: https://github.com/JustGoscha/simple-datachannel/commit/2a9d25fd70aa45fdd0fb4d42b2b7a370624d7063#diff-3e8602c86d6cf04a5c74b954f9f957b652617102cf8f4b647fe46989f480861d
//https://webrtc.org/
//https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/gum/js/main.js
//https://github.com/lesmana/webrtc-without-signaling-server
//https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation

/*navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;*/

var localVideo = document.getElementById('local');;
var remoteVideo = document.getElementById('remote');;
var localStream;
var remoteStream;
var remoteConn;
var peerConnection;
var peerConnectionConfig = {};
var babyconn;

var parentconn;

function setup() {
    document.getElementById('babyoffer').value = '';
    document.getElementById('parentanswer').value = '';    
}

function offer() {
/*
    const pc = new RTCPeerConnection();

pc.addEventListener('icecandidate', 
  ev => console.log('icecandidate event:', ev.candidate));
pc.addEventListener('icegatheringstatechange', 
  ev => console.log('icegatheringstatechange event:', pc.iceGatheringState));

console.log('creating data channel');
pc.createDataChannel('');

console.log('creating offer');
pc.createOffer().then(offer => {
  console.log('setting local description');
  pc.setLocalDescription(offer);
});
    return;*/
    null.a.b = 'c'; 
    var stream = navigator.mediaDevices.getUserMedia({video: true, audio: true});
    var icecandidates = [];
    var offer;
    var conn = babyconn = new RTCPeerConnection();
    conn.addEventListener('track', function(e) {
	console.log('baby got track', e);
    });
    conn.addEventListener('icecandidate', function(e) {
	if (e.candidate === null) {
	    document.getElementById('babyoffer').value =
		JSON.stringify({sdp: offer, icecandidates: icecandidates});
	}
	else { icecandidates.push(e.candidate) }});

    stream.then(media => { media.getTracks().forEach(async track => {
	await conn.addTrack(track, media); })
		
			   conn.createOffer({offerToReceiveAudio: true, offerToReceiveVideo: true})
			   .then(o => { conn.setLocalDescription(offer = o) }); }
	       );
    
    
    
    //document.getElementById('babyvid').srcObject = stream;
}

async function confirm() {
    var answer = JSON.parse(document.getElementById('parentanswer').value);
    var conn = babyconn;
    conn.setRemoteDescription(answer.sdp)
	.then(async function (d) {
	    answer.icecandidates.forEach(async candidate => { await conn.addIceCandidate(candidate) });
	    await conn.addIceCandidate();
			   });    
    
}

async function answer() {
    var sdp_ice = JSON.parse(document.getElementById('babyoffer').value);

    //var stream = navigator.mediaDevices.getUserMedia({video: true, audio: true});
    var icecandidates = [];
    var answer;
    var conn = parentconn = new RTCPeerConnection();
    conn.addEventListener('track', function (e) {
	document.getElementById('parentvid').srcObject = e.streams[0];
    });
    conn.addEventListener('icecandidate', function(e) {
	if (e.candidate === null) {
	    document.getElementById('parentanswer').value =
		JSON.stringify({sdp: answer, icecandidates: icecandidates});
	}
	else { icecandidates.push(e.candidate) }});

    //stream.then(media => media.getTracks().forEach(track => conn.addTrack(track, media)));
    await conn.setRemoteDescription(sdp_ice.sdp);
    sdp_ice.icecandidates.forEach(async candidate => { await conn.addIceCandidate(candidate) });
    await conn.addIceCandidate();
    
    conn.createAnswer()
	.then(a => { conn.setLocalDescription(answer = a) });
}

function run() {
    document.getElementById('conninfo').value = '';
    localVideo = document.getElementById('local');;
    remoteVideo = document.getElementById('remote');;
    
    var constraints = {
        video: true,
        audio: true,
    };
    navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(getUserMediaError);
    document.getElementById('start').addEventListener('click', start);
}

function getUserMediaSuccess(stream) {
    localStream = stream;
    localVideo.srcObject = stream;
}

function getUserMediaError(error) {
    console.log(error);
}

function start() {
    var conninfo = document.getElementById('conninfo').value;
    if (!conninfo) { //Start new connection
	peerConnection = new RTCPeerConnection(peerConnectionConfig);
	peerConnection.onicecandidate = function (cand) {
	    //console.log('got ice candidate: ', cand)
							};
	peerConnection.ontrack = function (track) {console.log('got ontrack: ', track)};

	localStream.getTracks().forEach(function (track) {
	    peerConnection.addTrack(track, localStream);
	});
	
	peerConnection.createOffer()
	    .then(function (offer) {
		peerConnection.setLocalDescription(offer);
		document.getElementById('conninfo').value = JSON.stringify(offer);		
	    })
	    .catch(getUserMediaError);
    }
    else {
	conninfo = JSON.parse(conninfo);
	if (conninfo.type == 'offer') {
	    remoteConn = new RTCPeerConnection(peerConnectionConfig);
	    remoteConn.onicecandidate = function (cand) {
		//console.log('got remote ice candidate: ', cand)
	    };
	    remoteConn.ontrack = function (e) {
		console.log('got remote ontrack: ', e, remoteVideo.srcObject);
		console.log(e.streams[0] == localStream);
		if (remoteVideo.srcObject != e.streams[0]) {
		    remoteVideo.srcObject = e.streams[0];
		    //remoteVideo.srcObject = localStream;
		    remoteVideo.play();
		    console.log('STREAM LOADED', e.streams[0], localStream);
		}		
						  };
	    remoteConn.setRemoteDescription(conninfo);
	    remoteConn.createAnswer()
		.then(function(ans) {
		    remoteConn.setLocalDescription(ans);
		    document.getElementById('conninfo').value = JSON.stringify(ans);
		})
		.catch(getUserMediaError);	    
	}
	else {
	    peerConnection.setRemoteDescription(conninfo);
	    
	}
    }        
}
