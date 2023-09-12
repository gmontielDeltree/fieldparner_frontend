import { LitElement,html } from 'lit';
import { customElement,property } from 'lit/decorators.js';
import "./msc-image-uploader-main/mjs/wc-msc-image-uploader"

@customElement("fp-image-uploader")
export class FPImageUploader extends LitElement{

	@property()
	sologallery : boolean = false

	@property()
	images : string[] = []

	images_to_placeholder = (images : string[]) => {
		return images.map((m)=>{
			return {src:"/attachments?file="+ m,other:"xxx",filename:m}
		})
	}

	// placeholder="${JSON.stringify(this.images_to_placeholder(this.images))}"

	render(){
		return html`<msc-image-uploader class=${this.sologallery ? "msc-image-uploader--blank-trigger":""} style=${this.sologallery ? "--remove-button-display:none":"--remove-button-display:block"}
			webservice='{"url":"/attachments","params":{},"header":{},"withCredentials":false,"timeout":30000}'
			fieldname="file"
			placeholder="${JSON.stringify(this.images_to_placeholder(this.images))}"
			@msc-image-uploader-pick=${(e)=>console.log("PICK",e,e.detail,e.target.uploadInfo, e.target.placeholder)}
			@msc-image-uploader-click=${(e)=>{
				console.log("CLICK ON",e.detail.filename)
				// Abrir una galeria donde se vea la imagen fullscreen
			}}
			@msc-image-uploader-upload-done=${(e)=>{
				e.preventDefault()
				let ui  =  e.target.uploadInfo
				console.log("DONE",e,e.detail,ui, e.target.placeholder)
				this.dispatchEvent(new CustomEvent("upload-done",{detail:(ui[ui.length-1]).filename,bubbles:true,composed:true}))
				}}	
			@msc-image-uploader-remove=${(e)=>{
				// Que elemento removi?
				// Ahora
				let arrayOne = this.images_to_placeholder(this.images)
				// antes
				let arrayTwo = e.target.uploadInfo
				const results = arrayOne.filter(({ src: id1 }) => !arrayTwo.some(({ src: id2 }) => id2 === id1));
				const filename_removed = results[0].filename
				console.log("REMOVED File", filename_removed)
				this.dispatchEvent(new CustomEvent("uploader-remove",{detail:filename_removed}))
				}
			}	
			@msc-image-uploader-error=${(e)=>console.log("ERROR",e)}	
		></msc-image-uploader>`
	}
}