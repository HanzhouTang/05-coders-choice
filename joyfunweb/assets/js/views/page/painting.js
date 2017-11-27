import Main from '../main';
import { Socket } from "phoenix";
var $ = require('jquery');
export default class Painting extends Main {
  constructor(){
    super();
    this.canvas = $("#canvas")[0];
    this.canvas_height = this.canvas.height;
    this.canvas_width = this.canvas.width;
    //console.log(this.canvas.height);
    this.context = this.canvas.getContext('2d');
    this.doneJobs=[];//store finished painting
    this.tempJobs={};//store temp painting
    this.room_number = $("#room_number").data("roomNumber");
    this.user_name = $("#room_number").data("userName");
    this.channel = this.join_channel();
    this.local = {};// the position when mouse down
    this.dragging = false; // if already pressed the mouse down
    this.drawing = this.drawStraightLine;
    this.defaultFillStyle = "cornflowerblue";
    this.defaultStrokeStyle = "navy";
    this.defaultLineWidth = 0.5;
    this.setupEventHandlers(this.channel);
  }
  
 setupEventHandlers(channel){
  $("#sending").click(function(){
    channel.push("sending",{message: $("#chatting_input").val()});
    $("#chatting_input").val("");
  })
  this.SetupDrawGridHandler(channel)();
  this.SetupMouseDownHandler(channel);
  this.SetupMouseMoveHandler(channel);
  this.SetupMouseUpHandler(channel);
  this.SetupChannelEventsHandler(channel);
 }
  
  SetupMouseDownHandler(channel){ //need add channel later
     let that= this;
     this.canvas.onmousedown = function(e){
          that.local=that.windowToCanvas(e.clientX, e.clientY);
          e.preventDefault(); // prevent cursor change
          that.dragging = true;
     }
  }

  SetupChannelEventsHandler(channel){
    channel.on("echo", e =>{$("#board").append(e.message)});
    this.SetupChannelDrawGridHandler(channel);
    this.SetupChannelDrawStraightLineHandler(channel);
  }

  SetupChannelDrawGridHandler(channel){
    let drawGrid = this.drawGrid;
    let canvas_width=this.canvas_width;
    let canvas_height=this.canvas_height;
    let context = this.context;
    channel.on("painting:Grid",e =>{
      drawGrid(context, canvas_width,canvas_height,e.color, parseInt(e.stepx), parseInt(e.stepy));
    })
  }


  //drawStraightLine(start,end,lineWidth,strokeStyle,fillStyle)
  SetupChannelDrawStraightLineHandler(channel){
    let drawStraightLine = this.drawStraightLine;
    let canvas_width=this.canvas_width;
    let canvas_height=this.canvas_height;
    let context = this.context;
    let defaultFillStyle = this.defaultFillStyle;
    let doneJobs = this.doneJobs;//store finished painting
    let tempJobs = this.tempJobs;//store temp painting
    let restoreDrawingSurface= this.restoreDrawingSurface;
    let that =this;
    channel.on("painting:StraightLineDone",e =>{
      doneJobs.push({action: "DrawStraightLine",start:{x: e.startX,y:e.startY},end:{x: e.endX,y: e.endY},strokeColor: e.color,fillColor: "black"});
      tempJobs["DrawStraightLine"] = null;
      restoreDrawingSurface.call(that);
    })
                 
    channel.on("painting:StraightLineTemp", e =>{
      tempJobs["DrawStraightLine"] = {action: "DrawStraightLine",start:{x: e.startX,y:e.startY},end:{x: e.endX,y: e.endY},strokeColor: e.color,fillColor: "balck"};
      restoreDrawingSurface.call(that);
    }) // can get an effect if set temp to done
  }


  TakeAction(command){
      if(command.action=="DrawStraightLine"){
        this.drawStraightLine(this.context,command.start,command.end,0.5,command.strokeColor,command.fillColor);
      }
  }

  restoreDrawingSurface() {
    let context = this.context;
    let doneJobs = this.doneJobs;
    let tempJobs = this.tempJobs;
    let canvas_width = this.canvas_width;
    let canvas_height = this.canvas_height;
    context.clearRect(0, 0, canvas_width, canvas_height);
    console.log(doneJobs.length);
    for (let command of doneJobs){
      this.TakeAction(command);
    }
    if(tempJobs["DrawStraightLine"])
    this.TakeAction(tempJobs["DrawStraightLine"]);
    
 }

  SetupMouseMoveHandler(channel){
    let that =this;
    this.canvas.onmousemove = function(e){
      if (that.dragging) {
          e.preventDefault(); // prevent selections
          let loc = that.windowToCanvas(e.clientX, e.clientY);
          channel.push("paint:straightLineTemp",{color: that.defaultStrokeStyle,startX: that.local.x,startY: that.local.y,endX: loc.x,endY: loc.y});
      }
    }
  }

  SetupMouseUpHandler(channel){
    let that = this;
    this.canvas.onmouseup = function(e){
      let loc = that.windowToCanvas(e.clientX, e.clientY);
      channel.push("paint:straightLineDone",{color: that.defaultStrokeStyle,startX: that.local.x,startY: that.local.y,endX: loc.x,endY: loc.y});
      that.dragging = false;
    }
  }

  SetupDrawGridHandler(channel){
    let is_click =false;
    return function(){
      $("#draw_grid").click(
        () => {
          if(is_click==false){
            //draw 
            $("#draw_grid").text("ClearGrid");
            $("#draw_grid").removeClass("btn-info").addClass("btn-danger");
            channel.push("paint:drawGrid",{});
          }
          else {
            // clear draw
            $("#draw_grid").text("DrawGrid");
            $("#draw_grid").removeClass("btn-danger").addClass("btn-info");
            channel.push("paint:clearGrid",{});
          }
          is_click = !is_click;
        }
      );
    }
  }
 

  join_channel(){
    let socket = new Socket("/socket",{logger: Painting.my_logger});
    socket.connect();
    let channel = socket.channel("painting:"+this.room_number,{user_name: this.user_name});
    channel.join();
    return channel;
  }
  
  windowToCanvas(x,y){
    let canvas = this.canvas;
    let bbox = canvas.getBoundingClientRect();
    let canvas_width = this.canvas_width;
    let canvas_height = this.canvas_height;
    return { x: x - bbox.left * (canvas_width  / bbox.width),
             y: y - bbox.top  * (canvas_height / bbox.height) };
  }
  
  drawGrid(context, canvas_width,canvas_height,color, stepx, stepy) {
    context.strokeStyle = color;
    context.lineWidth = 0.5;
 
    for (var i = stepx + 0.5; i < canvas_width; i += stepx) {
       context.beginPath();
       context.moveTo(i, 0);
       context.lineTo(i, context.canvas.height);
       context.stroke();
    }
    for (var i = stepy + 0.5; i < canvas_height; i += stepy) {
       context.beginPath();
       context.moveTo(0, i);
       context.lineTo(context.canvas.width, i);
       context.stroke();
    }
 }

 drawStraightLine(context,start,end,lineWidth,strokeStyle,fillStyle) {
  context.save();
  context.fillStyle=fillStyle;
  context.strokeStyle = strokeStyle;
  context.lineWidth=lineWidth
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.restore();
}

  mount() {
    super.mount();
    console.log("painting load")
  }

  unmount() {
    super.unmount();
  }
  static my_logger(kind,msg,data){
    console.log("Socket event: "+ kind+":"+msg,data);
  }

  


}