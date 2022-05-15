import { LitElement, html, css } from 'lit'
const timeline = html`<div class="container">
    <div class="row">
        <div class="col-md-10">
            <ul class="cbp_tmtimeline">
                <li>
                    <time class="cbp_tmtime" datetime="2017-11-04T18:30"><span class="hidden">25/12/2017</span> <span
                            class="large">Now</span></time>
                    <div class="cbp_tmicon"><i class="zmdi zmdi-account"></i></div>
                    <div class="cbp_tmlabel empty"> <span>No Activity</span> </div>
                </li>
                <li>
                    <time class="cbp_tmtime" datetime="2017-11-04T03:45"><span>03:45 AM</span> <span>Today</span></time>
                    <div class="cbp_tmicon bg-info"><i class="zmdi zmdi-label"></i></div>
                    <div class="cbp_tmlabel">
                        <h2><a href="javascript:void(0);">Aplicación</a> <span></span></h2>
                        <p>2,4d - Glifosato</p>
                    </div>
                </li>
                <li>
                    <time class="cbp_tmtime" datetime="2017-11-03T13:22"><span>01:22 PM</span>
                        <span>Yesterday</span></time>
                    <div class="cbp_tmicon bg-green"> <i class="zmdi zmdi-case"></i></div>
                    <div class="cbp_tmlabel">
                        <h2><a href="javascript:void(0);">Job Meeting</a></h2>
                        <p>You have a meeting at <strong>Laborator Office</strong> Today.</p>
                    </div>
                </li>
                <li>
                    <time class="cbp_tmtime" datetime="2017-10-22T12:13"><span>12:13 PM</span> <span>Two weeks
                            ago</span></time>
                    <div class="cbp_tmicon bg-blush"><i class="zmdi zmdi-pin"></i></div>
                    <div class="cbp_tmlabel">
                        <h2><a href="javascript:void(0);">Arlind Nushi</a> <span>checked in at</span> <a
                                href="javascript:void(0);">New York</a></h2>
                        <blockquote>
                            <p class="blockquote blockquote-primary">
                                "It is a long established fact that a reader will be distracted by the readable content
                                of a page when looking at its layout."
                                <br>
                                <small>
                                    - Isabella
                                </small>
                            </p>
                        </blockquote>
                        <div class="row clearfix">
                            <div class="col-lg-12">
                                <div class="map m-t-10">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.91477011208!2d-74.11976308802028!3d40.69740344230033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew+York%2C+NY%2C+USA!5e0!3m2!1sen!2sin!4v1508039335245"
                                        frameborder="0" style="border:0; width: 100%;" allowfullscreen=""></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
                <li>
                    <time class="cbp_tmtime" datetime="2017-10-22T12:13"><span>12:13 PM</span> <span>Two weeks
                            ago</span></time>
                    <div class="cbp_tmicon bg-orange"><i class="zmdi zmdi-camera"></i></div>
                    <div class="cbp_tmlabel">
                        <h2><a href="javascript:void(0);">Eroll Maxhuni</a> <span>uploaded</span> 4 <span>new photos to
                                album</span> <a href="javascript:void(0);">Summer Trip</a></h2>
                        <blockquote>Pianoforte principles our unaffected not for astonished travelling are particular.
                        </blockquote>
                        <div class="row">
                            <div class="col-lg-3 col-md-6 col-6"><a href="javascript:void(0);"><img
                                        src="assets/images/image1.jpg" alt=""
                                        class="img-fluid img-thumbnail m-t-30"></a> </div>
                            <div class="col-lg-3 col-md-6 col-6"><a href="javascript:void(0);"> <img
                                        src="assets/images/image2.jpg" alt=""
                                        class="img-fluid img-thumbnail m-t-30"></a> </div>
                            <div class="col-lg-3 col-md-6 col-6"><a href="javascript:void(0);"> <img
                                        src="assets/images/image3.jpg" alt="" class="img-fluid img-thumbnail m-t-30">
                                </a> </div>
                            <div class="col-lg-3 col-md-6 col-6"><a href="javascript:void(0);"> <img
                                        src="assets/images/image4.jpg" alt="" class="img-fluid img-thumbnail m-t-30">
                                </a> </div>
                        </div>
                    </div>
                </li>
                <li>
                    <time class="cbp_tmtime" datetime="2017-11-03T13:22"><span>01:22 PM</span> <span>Two weeks
                            ago</span></time>
                    <div class="cbp_tmicon bg-green"> <i class="zmdi zmdi-case"></i></div>
                    <div class="cbp_tmlabel">
                        <h2><a href="javascript:void(0);">Job Meeting</a></h2>
                        <p>You have a meeting at <strong>Laborator Office</strong> Today.</p>
                    </div>
                </li>
                <li>
                    <time class="cbp_tmtime" datetime="2017-10-22T12:13"><span>12:13 PM</span> <span>Month
                            ago</span></time>
                    <div class="cbp_tmicon bg-blush"><i class="zmdi zmdi-pin"></i></div>
                    <div class="cbp_tmlabel">
                        <h2><a href="javascript:void(0);">Arlind Nushi</a> <span>checked in at</span> <a
                                href="javascript:void(0);">Laborator</a></h2>
                        <blockquote>Great place, feeling like in home.</blockquote>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</div>`

const timeline_css = css`.cbp_tmtimeline {
    margin: 0;
    padding: 0;
    list-style: none;
    position: relative
}

.cbp_tmtimeline:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #eee;
    left: 20%;
    margin-left: -6px
}

.cbp_tmtimeline>li {
    position: relative
}

.cbp_tmtimeline>li:first-child .cbp_tmtime span.large {
    color: #444;
    font-size: 17px !important;
    font-weight: 700
}

.cbp_tmtimeline>li:first-child .cbp_tmicon {
    background: #fff;
    color: #666
}

.cbp_tmtimeline>li:nth-child(odd) .cbp_tmtime span:last-child {
    color: #444;
    font-size: 13px
}

.cbp_tmtimeline>li:nth-child(odd) .cbp_tmlabel {
    background: #f0f1f3
}

.cbp_tmtimeline>li:nth-child(odd) .cbp_tmlabel:after {
    border-right-color: #f0f1f3
}

.cbp_tmtimeline>li .empty span {
    color: #777
}

.cbp_tmtimeline>li .cbp_tmtime {
    display: block;
    width: 23%;
    padding-right: 70px;
    position: absolute
}

.cbp_tmtimeline>li .cbp_tmtime span {
    display: block;
    text-align: right
}

.cbp_tmtimeline>li .cbp_tmtime span:first-child {
    font-size: 15px;
    color: #3d4c5a;
    font-weight: 700
}

.cbp_tmtimeline>li .cbp_tmtime span:last-child {
    font-size: 14px;
    color: #444
}

.cbp_tmtimeline>li .cbp_tmlabel {
    margin: 0 0 15px 25%;
    background: #f0f1f3;
    padding: 1.2em;
    position: relative;
    border-radius: 5px
}

.cbp_tmtimeline>li .cbp_tmlabel:after {
    right: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-right-color: #f0f1f3;
    border-width: 10px;
    top: 10px
}

.cbp_tmtimeline>li .cbp_tmlabel blockquote {
    font-size: 16px
}

.cbp_tmtimeline>li .cbp_tmlabel .map-checkin {
    border: 5px solid rgba(235, 235, 235, 0.2);
    -moz-box-shadow: 0px 0px 0px 1px #ebebeb;
    -webkit-box-shadow: 0px 0px 0px 1px #ebebeb;
    box-shadow: 0px 0px 0px 1px #ebebeb;
    background: #fff !important
}

.cbp_tmtimeline>li .cbp_tmlabel h2 {
    margin: 0px;
    padding: 0 0 10px 0;
    line-height: 26px;
    font-size: 16px;
    font-weight: normal
}

.cbp_tmtimeline>li .cbp_tmlabel h2 a {
    font-size: 15px
}

.cbp_tmtimeline>li .cbp_tmlabel h2 a:hover {
    text-decoration: none
}

.cbp_tmtimeline>li .cbp_tmlabel h2 span {
    font-size: 15px
}

.cbp_tmtimeline>li .cbp_tmlabel p {
    color: #444
}

.cbp_tmtimeline>li .cbp_tmicon {
    width: 40px;
    height: 40px;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    font-size: 1.4em;
    line-height: 40px;
    -webkit-font-smoothing: antialiased;
    position: absolute;
    color: #fff;
    background: #46a4da;
    border-radius: 50%;
    box-shadow: 0 0 0 5px #f5f5f6;
    text-align: center;
    left: 20%;
    top: 0;
    margin: 0 0 0 -25px
}

@media screen and (max-width: 992px) and (min-width: 768px) {
    .cbp_tmtimeline>li .cbp_tmtime {
        padding-right: 60px
    }
}

@media screen and (max-width: 65.375em) {
    .cbp_tmtimeline>li .cbp_tmtime span:last-child {
        font-size: 12px
    }
}

@media screen and (max-width: 47.2em) {
    .cbp_tmtimeline:before {
        display: none
    }
    .cbp_tmtimeline>li .cbp_tmtime {
        width: 100%;
        position: relative;
        padding: 0 0 20px 0
    }
    .cbp_tmtimeline>li .cbp_tmtime span {
        text-align: left
    }
    .cbp_tmtimeline>li .cbp_tmlabel {
        margin: 0 0 30px 0;
        padding: 1em;
        font-weight: 400;
        font-size: 95%
    }
    .cbp_tmtimeline>li .cbp_tmlabel:after {
        right: auto;
        left: 20px;
        border-right-color: transparent;
        border-bottom-color: #f5f5f6;
        top: -20px
    }
    .cbp_tmtimeline>li .cbp_tmicon {
        position: relative;
        float: right;
        left: auto;
        margin: -64px 5px 0 0px
    }
    .cbp_tmtimeline>li:nth-child(odd) .cbp_tmlabel:after {
        border-right-color: transparent;
        border-bottom-color: #f5f5f6
    }
}

.bg-green {
    background-color: #50d38a !important;
    color: #fff;
}

.bg-blush {
    background-color: #ff758e !important;
    color: #fff;
}

.bg-orange {
    background-color: #ffc323 !important;
    color: #fff;
}

.bg-info {
    background-color: #2CA8FF !important;
}`;

export class TimelineElement extends LitElement{
    static properties = {
        db: {},
        lote_id: {},
        campo_id: {},
        lote_nombre: {},
        _lotesOffcanvas: {},
        _fecha_editor: {},
        _steps_elements: {},
        _ctx: {},
        fsm: { state: true }
    }

    static styles = [timeline_css, css`
    :host {
      display: inline-block;
      padding: 10px;
      background: lightgray;
    }
    .planet {
      color: var(--planet-color, blue);
    }
    .bg-green {
        background-color: #50d38a !important;
        color: #fff;
    }
    `];

    show_step = (n) => {
        if (!this._steps_elements[n]._isShown) {
            this._steps_elements.map((el) => el.hide())
            this._steps_elements[n].show();
        }
    }

    constructor() {
        super();
    }
    createRenderRoot() {
        return this;
    }
    render(){
        return timeline;
    }
}



customElements.define('lit-timeline', TimelineElement);
