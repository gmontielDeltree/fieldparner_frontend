window.customElements.define('audio-recorder',
  class AudioRecorder extends HTMLElement{
    constructor(){
      super();
    }

    connectedCallback(){
      const shadowRoot = this.attachShadow({mode: 'open'});

      const linkElem = document.createElement('link');
      linkElem.setAttribute('rel', 'stylesheet');
      linkElem.setAttribute('href', 'assets/reroot/bootstrap-5.1.3-dist/css/bootstrap.min.css');

      // Attach the created element to the shadow dom
      shadowRoot.appendChild(linkElem);

      shadowRoot.appendChild(this.style);
      shadowRoot.appendChild(this.content);
      
      this.mediaRecorder = undefined;

      let startStopButton = this.shadowRoot.querySelector('#start-stop');
      startStopButton.addEventListener('click', (event) => {
        if(this.mediaRecorder && this.mediaRecorder.state === 'recording'){
          this.stop();
        }else{
          this.start();
        }
      });
    }

    get style(){
      let style = document.createElement('style');
      style.innerHTML = `
        .stop{
          background-color: red;
        }
      `;
      return style;
    }

    // Contenido Inicial
    get content(){
      let content = document.createElement('div');
      content.innerHTML = `
      <button type="button" id="start-stop" class="btn btn-success">Grabar un Audio</button>
      `;
      return content;
    }

    // Evento Start
    start(){
      let startStopButton = this.shadowRoot.querySelector('#start-stop');


      let audioChunks = [];

      const constraints = {
        audio: true,
        video: false
      };

      // .aac  audio/aac
      // .mp3  audio/mpeg
      // .oga  audio/ogg
      // .opus audio/opus
      // .wav  audio/wav
      // .weba audio/webm
      const options = {
        type: 'audio/ogg'
      }
        
      navigator.mediaDevices.getUserMedia(constraints)
        .then( (stream) => {
          this.mediaRecorder = new MediaRecorder(stream);
          this.mediaRecorder.addEventListener('dataavailable', (event) => {
            audioChunks.push(event.data);
          });
          this.mediaRecorder.addEventListener('stop', (event) => {
            this.saveRecording(new Blob(audioChunks, options));
          });
          this.mediaRecorder.start();
          startStopButton.innerHTML = 'Detener Grabación';
          startStopButton.classList.remove('btn-success');
          startStopButton.classList.add('btn-danger');
        })
        .catch( (error) => {
          alert("No se tienen permisos para grabar")
          console.error(`navigator.getUserMedia error: ${error}`);
        });
    }

    // Evento Stop
    stop(){
      let startStopButton = this.shadowRoot.querySelector('#start-stop');
      startStopButton.innerHTML = 'Grabar un Audio';
      startStopButton.classList.remove('btn-danger');
      startStopButton.classList.add('btn-success');
      this.mediaRecorder.stop();
    }

    saveRecording(audioBlob){
      let blobUrl = URL.createObjectURL(audioBlob);
      
      let div = document.createElement("div");

      div.classList.add("row")

      
      let audio = document.createElement('audio');
      audio.setAttribute('src', blobUrl);
      audio.setAttribute('controls', '');
      audio.classList.add('my-2');
      audio.classList.add('col-8');

      audio.classList.add('nota-audio');
      div.append(audio);

      let a = document.createElement('button');
      a.innerText = "Borrar"
      a.classList.add("btn");
      a.classList.add("btn-danger");
      a.classList.add("col-2");
      a.addEventListener("click",(e)=>{
        audio.remove();
        a.remove();
      })

      div.append(a);
      //a.setAttribute('href', blobUrl);
      //a.setAttribute('download', `recording-${new Date().toISOString()}.oga`);
      //a.innerText = 'Download';
      this.shadowRoot.append(div);
    }
  }
);
