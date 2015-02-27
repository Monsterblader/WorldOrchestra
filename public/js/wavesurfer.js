/* wavesurfer.js v 1.0.19 @license CC-BY 3.0 */
var WaveSurfer={defaultParams:{height:128,waveColor:"#999",progressColor:"#555",cursorColor:"#333",cursorWidth:1,skipLength:2,minPxPerSec:20,pixelRatio:window.devicePixelRatio,fillParent:!0,scrollParent:!1,hideScrollbar:!1,audioContext:null,container:null,dragSelection:!0,loopSelection:!0,audioRate:1,interact:!0,splitChannels:!1,renderer:"Canvas",backend:"WebAudio",mediaType:"audio"},init:function(e){if(this.params=WaveSurfer.util.extend({},this.defaultParams,e),this.container="string"==typeof e.container?document.querySelector(this.params.container):this.params.container,!this.container)throw new Error("Container element not found");if(this.mediaContainer="undefined"==typeof this.params.mediaContainer?this.container:"string"==typeof this.params.mediaContainer?document.querySelector(this.params.mediaContainer):this.params.mediaContainer,!this.mediaContainer)throw new Error("Media Container element not found");this.savedVolume=0,this.isMuted=!1,this.createDrawer(),this.createBackend()},createDrawer:function(){var e=this;this.drawer=Object.create(WaveSurfer.Drawer[this.params.renderer]),this.drawer.init(this.container,this.params),this.drawer.on("redraw",function(){e.drawBuffer(),e.drawer.progress(e.backend.getPlayedPercents())}),this.drawer.on("click",function(t,i){setTimeout(function(){e.seekTo(i)},0)}),this.drawer.on("scroll",function(t){e.fireEvent("scroll",t)})},createBackend:function(){var e=this;this.backend&&this.backend.destroy(),"AudioElement"==this.params.backend&&(this.params.backend="MediaElement"),"WebAudio"!=this.params.backend||WaveSurfer.WebAudio.supportsWebAudio()||(this.params.backend="MediaElement"),this.backend=Object.create(WaveSurfer[this.params.backend]),this.backend.init(this.params),this.backend.on("finish",function(){e.fireEvent("finish")}),this.backend.on("audioprocess",function(t){e.fireEvent("audioprocess",t)})},restartAnimationLoop:function(){var e=this,t=window.requestAnimationFrame||window.webkitRequestAnimationFrame,i=function(){e.backend.isPaused()||(e.drawer.progress(e.backend.getPlayedPercents()),t(i))};i()},getDuration:function(){return this.backend.getDuration()},getCurrentTime:function(){return this.backend.getCurrentTime()},play:function(e,t){this.backend.play(e,t),this.restartAnimationLoop(),this.fireEvent("play")},pause:function(){this.backend.pause(),this.fireEvent("pause")},playPause:function(){this.backend.isPaused()?this.play():this.pause()},skipBackward:function(e){this.skip(-e||-this.params.skipLength)},skipForward:function(e){this.skip(e||this.params.skipLength)},skip:function(e){var t=this.getCurrentTime()||0,i=this.getDuration()||1;t=Math.max(0,Math.min(i,t+(e||0))),this.seekAndCenter(t/i)},seekAndCenter:function(e){this.seekTo(e),this.drawer.recenter(e)},seekTo:function(e){var t=this.backend.isPaused(),i=this.params.scrollParent;t&&(this.params.scrollParent=!1),this.backend.seekTo(e*this.getDuration()),this.drawer.progress(this.backend.getPlayedPercents()),t||(this.backend.pause(),this.backend.play()),this.params.scrollParent=i,this.fireEvent("seek",e)},stop:function(){this.pause(),this.seekTo(0),this.drawer.progress(0)},setVolume:function(e){this.backend.setVolume(e)},setPlaybackRate:function(e){this.backend.setPlaybackRate(e)},toggleMute:function(){this.isMuted?(this.backend.setVolume(this.savedVolume),this.isMuted=!1):(this.savedVolume=this.backend.getVolume(),this.backend.setVolume(0),this.isMuted=!0)},toggleScroll:function(){this.params.scrollParent=!this.params.scrollParent,this.drawBuffer()},toggleInteraction:function(){this.params.interact=!this.params.interact},drawBuffer:function(){var e=Math.round(this.getDuration()*this.params.minPxPerSec*this.params.pixelRatio),t=this.drawer.getWidth(),i=e;this.params.fillParent&&(!this.params.scrollParent||t>e)&&(i=t);var r=this.backend.getPeaks(i);this.drawer.drawPeaks(r,i),this.fireEvent("redraw",r,i)},loadArrayBuffer:function(e){var t=this;this.backend.decodeArrayBuffer(e,function(e){t.loadDecodedBuffer(e)},function(){t.fireEvent("error","Error decoding audiobuffer")})},loadDecodedBuffer:function(e){this.empty(),this.backend.load(e),this.drawBuffer(),this.fireEvent("ready")},loadBlob:function(e){var t=this,i=new FileReader;i.addEventListener("progress",function(e){t.onProgress(e)}),i.addEventListener("load",function(e){t.empty(),t.loadArrayBuffer(e.target.result)}),i.addEventListener("error",function(){t.fireEvent("error","Error reading file")}),i.readAsArrayBuffer(e)},load:function(e,t){switch(this.params.backend){case"WebAudio":return this.loadBuffer(e);case"MediaElement":return this.loadMediaElement(e,t)}},loadBuffer:function(e){return this.empty(),this.downloadArrayBuffer(e,this.loadArrayBuffer.bind(this))},loadMediaElement:function(e,t){this.empty(),this.backend.load(e,this.mediaContainer,t),this.backend.once("canplay",function(){this.drawBuffer(),this.fireEvent("ready")}.bind(this)),this.backend.once("error",function(e){this.fireEvent("error",e)}.bind(this)),!t&&this.backend.supportsWebAudio()&&this.downloadArrayBuffer(e,function(e){this.backend.decodeArrayBuffer(e,function(e){this.backend.buffer=e,this.drawBuffer()}.bind(this))}.bind(this))},downloadArrayBuffer:function(e,t){var i=this,r=WaveSurfer.util.ajax({url:e,responseType:"arraybuffer"});return r.on("progress",function(e){i.onProgress(e)}),r.on("success",t),r.on("error",function(e){i.fireEvent("error","XHR error: "+e.target.statusText)}),r},onProgress:function(e){if(e.lengthComputable)var t=e.loaded/e.total;else t=e.loaded/(e.loaded+1e6);this.fireEvent("loading",Math.round(100*t),e.target)},exportPCM:function(e,t,i){e=e||1024,t=t||1e4,i=i||!1;var r=this.backend.getPeaks(e,t),s=[].map.call(r,function(e){return Math.round(e*t)/t}),a=JSON.stringify(s);return i||window.open("data:application/json;charset=utf-8,"+encodeURIComponent(a)),a},empty:function(){this.backend.isPaused()||(this.stop(),this.backend.disconnectSource()),this.drawer.progress(0),this.drawer.setWidth(0),this.drawer.drawPeaks({length:this.drawer.getWidth()},0)},destroy:function(){this.fireEvent("destroy"),this.unAll(),this.backend.destroy(),this.drawer.destroy()}};WaveSurfer.create=function(e){var t=Object.create(WaveSurfer);return t.init(e),t},WaveSurfer.util={extend:function(e){var t=Array.prototype.slice.call(arguments,1);return t.forEach(function(t){Object.keys(t).forEach(function(i){e[i]=t[i]})}),e},getId:function(){return"wavesurfer_"+Math.random().toString(32).substring(2)},ajax:function(e){var t=Object.create(WaveSurfer.Observer),i=new XMLHttpRequest,r=!1;return i.open(e.method||"GET",e.url,!0),i.responseType=e.responseType||"json",i.addEventListener("progress",function(e){t.fireEvent("progress",e),e.lengthComputable&&e.loaded==e.total&&(r=!0)}),i.addEventListener("load",function(e){r||t.fireEvent("progress",e),t.fireEvent("load",e),200==i.status||206==i.status?t.fireEvent("success",i.response,e):t.fireEvent("error",e)}),i.addEventListener("error",function(e){t.fireEvent("error",e)}),i.send(),t.xhr=i,t}},WaveSurfer.Observer={on:function(e,t){this.handlers||(this.handlers={});var i=this.handlers[e];i||(i=this.handlers[e]=[]),i.push(t)},un:function(e,t){if(this.handlers){var i=this.handlers[e];if(i)if(t)for(var r=i.length-1;r>=0;r--)i[r]==t&&i.splice(r,1);else i.length=0}},unAll:function(){this.handlers=null},once:function(e,t){var i=this,r=function(){t.apply(this,arguments),setTimeout(function(){i.un(e,r)},0)};this.on(e,r)},fireEvent:function(e){if(this.handlers){var t=this.handlers[e],i=Array.prototype.slice.call(arguments,1);t&&t.forEach(function(e){e.apply(null,i)})}}},WaveSurfer.util.extend(WaveSurfer,WaveSurfer.Observer),WaveSurfer.WebAudio={scriptBufferSize:256,fftSize:128,PLAYING_STATE:0,PAUSED_STATE:1,FINISHED_STATE:2,supportsWebAudio:function(){return!(!window.AudioContext&&!window.webkitAudioContext)},getAudioContext:function(){return WaveSurfer.WebAudio.audioContext||(WaveSurfer.WebAudio.audioContext=new(window.AudioContext||window.webkitAudioContext)),WaveSurfer.WebAudio.audioContext},getOfflineAudioContext:function(e){return WaveSurfer.WebAudio.offlineAudioContext||(WaveSurfer.WebAudio.offlineAudioContext=new(window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,2,e)),WaveSurfer.WebAudio.offlineAudioContext},init:function(e){this.params=e,this.ac=e.audioContext||this.getAudioContext(),this.lastPlay=this.ac.currentTime,this.startPosition=0,this.scheduledPause=null,this.states=[Object.create(WaveSurfer.WebAudio.state.playing),Object.create(WaveSurfer.WebAudio.state.paused),Object.create(WaveSurfer.WebAudio.state.finished)],this.setState(this.PAUSED_STATE),this.createVolumeNode(),this.createScriptNode(),this.createAnalyserNode(),this.setPlaybackRate(this.params.audioRate)},disconnectFilters:function(){this.filters&&(this.filters.forEach(function(e){e&&e.disconnect()}),this.filters=null)},setState:function(e){this.state!==this.states[e]&&(this.state=this.states[e],this.state.init.call(this))},setFilter:function(){this.setFilters([].slice.call(arguments))},setFilters:function(e){this.disconnectFilters(),e&&e.length?(this.filters=e,e.reduce(function(e,t){return e.connect(t),t},this.analyser).connect(this.gainNode)):this.analyser.connect(this.gainNode)},createScriptNode:function(){var e=this,t=this.scriptBufferSize;this.scriptNode=this.ac.createScriptProcessor?this.ac.createScriptProcessor(t):this.ac.createJavaScriptNode(t),this.scriptNode.connect(this.ac.destination),this.scriptNode.onaudioprocess=function(){var t=e.getCurrentTime();e.buffer&&t>e.getDuration()?e.setState(e.FINISHED_STATE):e.buffer&&t>=e.scheduledPause?e.setState(e.PAUSED_STATE):e.state===e.states[e.PLAYING_STATE]&&e.fireEvent("audioprocess",t)}},createAnalyserNode:function(){this.analyser=this.ac.createAnalyser(),this.analyser.fftSize=this.fftSize,this.analyserData=new Uint8Array(this.analyser.frequencyBinCount),this.analyser.connect(this.gainNode)},createVolumeNode:function(){this.gainNode=this.ac.createGain?this.ac.createGain():this.ac.createGainNode(),this.gainNode.connect(this.ac.destination)},setVolume:function(e){this.gainNode.gain.value=e},getVolume:function(){return this.gainNode.gain.value},decodeArrayBuffer:function(e,t,i){this.offlineAc||(this.offlineAc=this.getOfflineAudioContext(this.ac?this.ac.sampleRate:44100)),this.offlineAc.decodeAudioData(e,function(e){t(e)}.bind(this),i)},getPeaks:function(e){for(var t=this.buffer.length/e,i=~~(t/10)||1,r=this.buffer.numberOfChannels,s=[],a=[],n=0;r>n;n++)for(var o=s[n]=[],h=this.buffer.getChannelData(n),u=0;e>u;u++){for(var c=~~(u*t),d=~~(c+t),l=0,f=c;d>f;f+=i){var p=h[f];p>l?l=p:-p>l&&(l=-p)}o[u]=l,(0==n||l>a[u])&&(a[u]=l)}return this.params.splitChannels?s:a},getPlayedPercents:function(){return this.state.getPlayedPercents.call(this)},disconnectSource:function(){this.source&&this.source.disconnect()},waveform:function(){return this.analyser.getByteTimeDomainData(this.analyserData),this.analyserData},destroy:function(){this.isPaused()||this.pause(),this.unAll(),this.buffer=null,this.disconnectFilters(),this.disconnectSource(),this.gainNode.disconnect(),this.scriptNode.disconnect(),this.analyser.disconnect()},load:function(e){this.startPosition=0,this.lastPlay=this.ac.currentTime,this.buffer=e,this.createSource()},createSource:function(){this.disconnectSource(),this.source=this.ac.createBufferSource(),this.source.start=this.source.start||this.source.noteGrainOn,this.source.stop=this.source.stop||this.source.noteOff,this.source.playbackRate.value=this.playbackRate,this.source.buffer=this.buffer,this.source.connect(this.analyser)},isPaused:function(){return this.state!==this.states[this.PLAYING_STATE]},getDuration:function(){return this.buffer?this.buffer.duration:0},seekTo:function(e,t){return this.scheduledPause=null,null==e&&(e=this.getCurrentTime(),e>=this.getDuration()&&(e=0)),null==t&&(t=this.getDuration()),this.startPosition=e,this.lastPlay=this.ac.currentTime,this.state===this.states[this.FINISHED_STATE]&&this.setState(this.PAUSED_STATE),{start:e,end:t}},getPlayedTime:function(){return(this.ac.currentTime-this.lastPlay)*this.playbackRate},play:function(e,t){this.createSource();var i=this.seekTo(e,t);e=i.start,t=i.end,this.scheduledPause=t,this.source.start(0,e,t-e),this.setState(this.PLAYING_STATE)},pause:function(){this.scheduledPause=null,this.startPosition+=this.getPlayedTime(),this.source&&this.source.stop(0),this.setState(this.PAUSED_STATE)},getCurrentTime:function(){return this.state.getCurrentTime.call(this)},setPlaybackRate:function(e){e=e||1,this.isPaused()?this.playbackRate=e:(this.pause(),this.playbackRate=e,this.play())}},WaveSurfer.WebAudio.state={},WaveSurfer.WebAudio.state.playing={init:function(){},getPlayedPercents:function(){var e=this.getDuration();return this.getCurrentTime()/e||0},getCurrentTime:function(){return this.startPosition+this.getPlayedTime()}},WaveSurfer.WebAudio.state.paused={init:function(){},getPlayedPercents:function(){var e=this.getDuration();return this.getCurrentTime()/e||0},getCurrentTime:function(){return this.startPosition}},WaveSurfer.WebAudio.state.finished={init:function(){this.fireEvent("finish")},getPlayedPercents:function(){return 1},getCurrentTime:function(){return this.getDuration()}},WaveSurfer.util.extend(WaveSurfer.WebAudio,WaveSurfer.Observer),WaveSurfer.MediaElement=Object.create(WaveSurfer.WebAudio),WaveSurfer.util.extend(WaveSurfer.MediaElement,{init:function(e){this.params=e,this.media={currentTime:0,duration:0,paused:!0,playbackRate:1,play:function(){},pause:function(){}},this.mediaType=e.mediaType.toLowerCase(),this.elementPosition=e.elementPosition},load:function(e,t,i){var r=this,s=document.createElement(this.mediaType);s.controls=!1,s.autoplay=!1,s.preload="auto",s.src=e,s.addEventListener("error",function(){r.fireEvent("error","Error loading media element")}),s.addEventListener("canplay",function(){r.fireEvent("canplay")}),s.addEventListener("ended",function(){r.fireEvent("finish")}),s.addEventListener("timeupdate",function(){r.fireEvent("audioprocess",r.getCurrentTime())});var a=t.querySelector(this.mediaType);a&&t.removeChild(a),t.appendChild(s),this.media=s,this.peaks=i,this.onPlayEnd=null,this.setPlaybackRate(this.playbackRate)},isPaused:function(){return this.media.paused},getDuration:function(){var e=this.media.duration;return e>=1/0&&(e=this.media.seekable.end()),e},getCurrentTime:function(){return this.media.currentTime},getPlayedPercents:function(){return this.getCurrentTime()/this.getDuration()||0},setPlaybackRate:function(e){this.playbackRate=e||1,this.media.playbackRate=this.playbackRate},seekTo:function(e){null!=e&&(this.media.currentTime=e),this.clearPlayEnd()},play:function(e,t){this.seekTo(e),this.media.play(),t&&this.setPlayEnd(t)},pause:function(){this.media.pause(),this.clearPlayEnd()},setPlayEnd:function(e){var t=this;this.onPlayEnd=function(i){i>=e&&(t.pause(),t.seekTo(e))},this.on("audioprocess",this.onPlayEnd)},clearPlayEnd:function(){this.onPlayEnd&&(this.un("audioprocess",this.onPlayEnd),this.onPlayEnd=null)},getPeaks:function(e){return this.buffer?WaveSurfer.WebAudio.getPeaks.call(this,e):this.peaks||[]},getVolume:function(){return this.media.volume},setVolume:function(e){this.media.volume=e},destroy:function(){this.pause(),this.unAll(),this.media.parentNode&&this.media.parentNode.removeChild(this.media),this.media=null}}),WaveSurfer.AudioElement=WaveSurfer.MediaElement,WaveSurfer.Drawer={init:function(e,t){this.container=e,this.params=t,this.width=0,this.height=t.height*this.params.pixelRatio,this.lastPos=0,this.createWrapper(),this.createElements()},createWrapper:function(){this.wrapper=this.container.appendChild(document.createElement("wave")),this.style(this.wrapper,{display:"block",position:"relative",userSelect:"none",webkitUserSelect:"none",height:this.params.height+"px"}),(this.params.fillParent||this.params.scrollParent)&&this.style(this.wrapper,{width:"100%",overflowX:this.params.hideScrollbar?"hidden":"auto",overflowY:"hidden"}),this.setupWrapperEvents()},handleEvent:function(e){e.preventDefault();var t=this.wrapper.getBoundingClientRect();return(e.clientX-t.left+this.wrapper.scrollLeft)/this.wrapper.scrollWidth||0},setupWrapperEvents:function(){var e=this;this.wrapper.addEventListener("click",function(t){var i=e.wrapper.offsetHeight-e.wrapper.clientHeight;if(0!=i){var r=e.wrapper.getBoundingClientRect();if(t.clientY>=r.bottom-i)return}e.params.interact&&e.fireEvent("click",t,e.handleEvent(t))}),this.wrapper.addEventListener("scroll",function(t){e.fireEvent("scroll",t)})},drawPeaks:function(e,t){this.resetScroll(),this.setWidth(t),this.drawWave(e)},style:function(e,t){return Object.keys(t).forEach(function(i){e.style[i]!=t[i]&&(e.style[i]=t[i])}),e},resetScroll:function(){null!==this.wrapper&&(this.wrapper.scrollLeft=0)},recenter:function(e){var t=this.wrapper.scrollWidth*e;this.recenterOnPosition(t,!0)},recenterOnPosition:function(e,t){var i=this.wrapper.scrollLeft,r=~~(this.wrapper.clientWidth/2),s=e-r,a=s-i,n=this.wrapper.scrollWidth-this.wrapper.clientWidth;if(0!=n){if(!t&&a>=-r&&r>a){var o=5;a=Math.max(-o,Math.min(o,a)),s=i+a}s=Math.max(0,Math.min(n,s)),s!=i&&(this.wrapper.scrollLeft=s)}},getWidth:function(){return Math.round(this.container.clientWidth*this.params.pixelRatio)},setWidth:function(e){e!=this.width&&(this.width=e,this.params.fillParent||this.params.scrollParent?this.style(this.wrapper,{width:""}):this.style(this.wrapper,{width:~~(this.width/this.params.pixelRatio)+"px"}),this.updateSize())},setHeight:function(e){e!=this.height&&(this.height=e,this.style(this.wrapper,{height:~~(this.height/this.params.pixelRatio)+"px"}),this.updateSize())},progress:function(e){var t=1/this.params.pixelRatio,i=Math.round(e*this.width)*t;if(i<this.lastPos||i-this.lastPos>=t){if(this.lastPos=i,this.params.scrollParent){var r=~~(this.wrapper.scrollWidth*e);this.recenterOnPosition(r)}this.updateProgress(e)}},destroy:function(){this.unAll(),this.wrapper&&(this.container.removeChild(this.wrapper),this.wrapper=null)},createElements:function(){},updateSize:function(){},drawWave:function(){},clearWave:function(){},updateProgress:function(){}},WaveSurfer.util.extend(WaveSurfer.Drawer,WaveSurfer.Observer),WaveSurfer.Drawer.Canvas=Object.create(WaveSurfer.Drawer),WaveSurfer.util.extend(WaveSurfer.Drawer.Canvas,{createElements:function(){var e=this.wrapper.appendChild(this.style(document.createElement("canvas"),{position:"absolute",zIndex:1}));if(this.waveCc=e.getContext("2d"),this.progressWave=this.wrapper.appendChild(this.style(document.createElement("wave"),{position:"absolute",zIndex:2,overflow:"hidden",width:"0",boxSizing:"border-box",borderRightStyle:"solid",borderRightWidth:this.params.cursorWidth+"px",borderRightColor:this.params.cursorColor})),this.params.waveColor!=this.params.progressColor){var t=this.progressWave.appendChild(document.createElement("canvas"));this.progressCc=t.getContext("2d")}},updateSize:function(){var e=Math.round(this.width/this.params.pixelRatio);this.waveCc.canvas.width=this.width,this.waveCc.canvas.height=this.height,this.style(this.waveCc.canvas,{width:e+"px"}),this.progressCc&&(this.progressCc.canvas.width=this.width,this.progressCc.canvas.height=this.height,this.style(this.progressCc.canvas,{width:e+"px"})),this.clearWave()},clearWave:function(){this.waveCc.clearRect(0,0,this.width,this.height),this.progressCc&&this.progressCc.clearRect(0,0,this.width,this.height)},drawWave:function(e,t){if(e[0]instanceof Array){var i=e;if(this.params.splitChannels)return this.setHeight(i.length*this.params.height*this.params.pixelRatio),void i.forEach(this.drawWave,this);e=i[0]}var r=.5/this.params.pixelRatio,s=this.params.height*this.params.pixelRatio,a=s*t||0,n=s/2,o=e.length,h=1;this.params.fillParent&&this.width!=o&&(h=this.width/o),this.waveCc.fillStyle=this.params.waveColor,this.progressCc&&(this.progressCc.fillStyle=this.params.progressColor),[this.waveCc,this.progressCc].forEach(function(t){if(t){t.beginPath(),t.moveTo(r,n+a);for(var i=0;o>i;i++){var s=Math.round(e[i]*n);t.lineTo(i*h+r,n+s+a)}t.lineTo(this.width+r,n+a),t.moveTo(r,n+a);for(var i=0;o>i;i++){var s=Math.round(e[i]*n);t.lineTo(i*h+r,n-s+a)}t.lineTo(this.width+r,n+a),t.closePath(),t.fill(),t.fillRect(0,n+a-r,this.width,r)}},this)},updateProgress:function(e){var t=Math.round(this.width*e)/this.params.pixelRatio;this.style(this.progressWave,{width:t+"px"})}});
// sourceMappingURL=wavesurfer-js-map.json
