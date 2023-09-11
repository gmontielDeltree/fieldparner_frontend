import { LitElement,html } from 'lit';
import { customElement,property } from 'lit/decorators.js';
import "./msc-image-uploader-main/mjs/wc-msc-image-uploader"

@customElement("fp-image-uploader")
export class FPImageUploader extends LitElement{

	@property()
	images : string[] = []

	images_to_placeholder = (images : string[]) => {
		return images.map((m)=>{
			return {src:m,other:"xxx"}
		})
	}

	render(){
		return html`<msc-image-uploader 
			webservice='{"url":"https://httpdump.app/dumps/7e1cb68d-f995-4939-93c2-6164b591d163","params":{},"header":{},"withCredentials":false,"timeout":30000}'
			placeholder="${JSON.stringify(this.images_to_placeholder(this.images))}"
			@msc-image-uploader-pick=${(e)=>console.log("PICK",e)}	
			@msc-image-uploader-upload-done=${(e)=>console.log("DONE",e)}	
			@msc-image-uploader-remove=${(e)=>console.log("REMOVE",e)}	
			@msc-image-uploader-error=${(e)=>console.log("ERROR",e)}	
		></msc-image-uploader>`
	}
}