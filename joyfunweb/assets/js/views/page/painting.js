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
    this.tool = "straightLine";
    this.defaultFillStyle = "cornflowerblue";
    this.defaultStrokeStyle = "navy";
    this.defaultLineWidth = 0.5;
    this.IsdrawGrid = false;
    this.manageToolMove={};
    this.manageToolUp={};

    this.manageToolMove["straightLine"]={};
    this.manageToolMove["straightLine"]["message"]="paint:StraightLineTemp";
    this.manageToolMove["straightLine"]["func"]=null;
    this.manageToolUp["straightLine"]={};
    this.manageToolUp["straightLine"]["message"]="paint:StraightLineDone";
    this.manageToolUp["straightLine"]["func"]=null;

    this.manageToolMove["pencil"]={};
    this.manageToolMove["pencil"]["message"]="paint:StraightLineDone";
    this.manageToolMove["pencil"]["func"]=this.HandlePencilMove;
    this.manageToolUp["pencil"]={};
    this.manageToolUp["pencil"]["message"]="paint:StraightLineDone";
    this.manageToolUp["pencil"]["func"]=null;

    this.manageToolMove["circle"]={};
    this.manageToolMove["circle"]["message"]="paint:CircleTemp";
    this.manageToolMove["circle"]["func"]=null;
    this.manageToolUp["circle"]={};
    this.manageToolUp["circle"]["message"]="paint:CircleDone";
    this.manageToolUp["circle"]["func"]=null;

    this.manageToolMove["rectangle"]={};
    this.manageToolMove["rectangle"]["message"]="paint:RectangleTemp";
    this.manageToolMove["rectangle"]["func"]=null;
    this.manageToolUp["rectangle"]={};
    this.manageToolUp["rectangle"]["message"]="paint:RectangleDone";
    this.manageToolUp["rectangle"]["func"]=null;



    this.setupEventHandlers(this.channel);
    //this.drawCircle(this.context,{x:0,y:0},{x:100,y:100},this.defaultLineWidth,this.defaultStrokeStyle,this.defaultFillStyle);
    //this.drawStraightLine(this.context,{x:0,y:0},{x:100,y:100},2.0,"black",this.defaultFillStyle);
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
  this.SetupClearHandler(channel)
  this.SetupToolsSelectHandler();
  this.SetupColorSelectHandler();
 }
  
  

  SetupChannelEventsHandler(channel){
    channel.on("echo", e =>{$("#board").append(e.message)});
    this.SetupChannelDrawGridHandler(channel);
    this.SetupChannelDrawStraightLineHandler(channel);
    this.SetupChannelDrawCircleHandler(channel);
    this.SetupChannelDrawRectangleHandler(channel);
  }

  SetupChannelDrawGridHandler(channel){
    let that =this;
    channel.on("painting:Grid",e =>{
      
      if(e.color!="#ffffff"){
        
        that.IsdrawGrid = true;
        }
      else{
         that.IsdrawGrid = false;
        }
        that.restoreDrawingSurface()
    })
  }


  SetupToolsSelectHandler(){
    let that =this;
    $(".tools").click(
      function(){
          $(".tools").removeClass("btn-warning").addClass("btn-info");
          that.tool =$(this).data("tool");
          $(this).removeClass("btn-info").addClass("btn-warning");
      }
    )
  }


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
      console.log("doneJobs size: "+ doneJobs.length);
      restoreDrawingSurface.call(that);
    })
                 
    channel.on("painting:StraightLineTemp", e =>{
      tempJobs["DrawStraightLine"] = {action: "DrawStraightLine",start:{x: e.startX,y:e.startY},end:{x: e.endX,y: e.endY},strokeColor: e.color,fillColor: "balck"};
      restoreDrawingSurface.call(that);
    }) // can get an effect if set temp to done
  }

  SetupColorSelectHandler(){
    let that = this;
    $("#fillStyleSelect").change(
      function(){
        that.defaultFillStyle = $(this).val();
      }
    )
    $("#strokeStyleSelect").change(
      function(){
        that.defaultStrokeStyle = $(this).val();
      }
    )
  }

  SetupClearHandler(channel){
    let that =this;
    $("#clear").click(
      function(){
        channel.push("Clear",{});
      }
    )
    channel.on("Clear", e =>{
      that.tempJobs["DrawStraightLine"] = null;
      that.tempJobs["DrawCircle"] = null;
      that.tempJobs["DrawRectangle"] = null;
      that.doneJobs.splice(0,that.doneJobs.length);;
      that.restoreDrawingSurface();
    })
  }

  SetupChannelDrawCircleHandler(channel){
    let drawStraightLine = this.drawStraightLine;
    let canvas_width=this.canvas_width;
    let canvas_height=this.canvas_height;
    let context = this.context;
    let defaultFillStyle = this.defaultFillStyle;
    let doneJobs = this.doneJobs;//store finished painting
    let tempJobs = this.tempJobs;//store temp painting
    let restoreDrawingSurface= this.restoreDrawingSurface;
    let that =this;
    channel.on("painting:CircleDone",e =>{
      doneJobs.push({action: "DrawCircle",start:{x: e.startX,y:e.startY},end:{x: e.endX,y: e.endY},strokeColor: e.color,fillColor: e.fillColor});
      tempJobs["DrawCircle"] = null;
      restoreDrawingSurface.call(that);
    })
                 
    channel.on("painting:CircleTemp", e =>{
      tempJobs["DrawCircle"] = {action: "DrawCircle",start:{x: e.startX,y:e.startY},end:{x: e.endX,y: e.endY},strokeColor: e.color,fillColor: e.fillColor};
      restoreDrawingSurface.call(that);
    }) // can get an effect if set temp to done
  }


  
  SetupChannelDrawRectangleHandler(channel){
    let drawStraightLine = this.drawStraightLine;
    let canvas_width=this.canvas_width;
    let canvas_height=this.canvas_height;
    let context = this.context;
    let defaultFillStyle = this.defaultFillStyle;
    let doneJobs = this.doneJobs;//store finished painting
    let tempJobs = this.tempJobs;//store temp painting
    let restoreDrawingSurface= this.restoreDrawingSurface;
    let that =this;
    channel.on("painting:RectangleDone",e =>{
      doneJobs.push({action: "DrawRectangle",start:{x: e.startX,y:e.startY},end:{x: e.endX,y: e.endY},strokeColor: e.color,fillColor: e.fillColor});
      tempJobs["DrawRectangle"] = null;
      restoreDrawingSurface.call(that);
    })
                 
    channel.on("painting:RectangleTemp", e =>{
      tempJobs["DrawRectangle"] = {action: "DrawRectangle",start:{x: e.startX,y:e.startY},end:{x: e.endX,y: e.endY},strokeColor: e.color,fillColor: e.fillColor};
      restoreDrawingSurface.call(that);
    }) // can get an effect if set temp to done
  }


  TakeAction(command){
      if(command.action=="DrawStraightLine"){
        this.drawStraightLine(this.context,command.start,command.end,0.5,command.strokeColor,command.fillColor);
      }
      else if(command.action=="DrawCircle"){
        this.drawCircle(this.context,command.start,command.end,0.5,command.strokeColor,command.fillColor);
      }
      else if(command.action=="DrawRectangle"){
        this.drawRectangle(this.context,command.start,command.end,0.5,command.strokeColor,command.fillColor);
      }
  }

  restoreDrawingSurface() {
    let context = this.context;
    let doneJobs = this.doneJobs;
    let tempJobs = this.tempJobs;
    let canvas_width = this.canvas_width;
    let canvas_height = this.canvas_height;
    context.clearRect(0, 0, canvas_width, canvas_height);
    console.log("length: "+ doneJobs.length);
    if(this.IsdrawGrid){
    this.drawGrid(context, canvas_width,canvas_height,'lightgray', 10, 10);}
    for (let command of doneJobs){
      this.TakeAction(command);
    }
    
    if(tempJobs["DrawStraightLine"])
    this.TakeAction(tempJobs["DrawStraightLine"]);
    if(tempJobs["DrawCircle"])
    this.TakeAction(tempJobs["DrawCircle"]);
    if(tempJobs["DrawRectangle"])
    this.TakeAction(tempJobs["DrawRectangle"]);
    
 }


  HandlePencilMove(loc){
    this.local = loc;
  }

  SetupMouseDownHandler(channel){ 
     let that= this;
     this.canvas.onmousedown = function(e){
          that.local=that.windowToCanvas(e.clientX, e.clientY);
          e.preventDefault(); // prevent cursor change
          that.dragging = true;
     }
  }

  SetupMouseMoveHandler(channel){
    let that =this;
    this.canvas.onmousemove = function(e){
      let message = that.manageToolMove[that.tool]["message"];
      let func = that.manageToolMove[that.tool]["func"];
      if (that.dragging) {
          e.preventDefault(); // prevent selections
          let loc = that.windowToCanvas(e.clientX, e.clientY);
          channel.push(message,{color: that.defaultStrokeStyle,startX: that.local.x,startY: that.local.y,endX: loc.x,endY: loc.y,fillColor: that.defaultFillStyle});
          if(func) {func.call(that,loc);}
      }
    }
  }

  SetupMouseUpHandler(channel){
    let that = this;
    this.canvas.onmouseup = function(e){
      let message = that.manageToolUp[that.tool]["message"];
      let func = that.manageToolUp[that.tool]["func"];
      let loc = that.windowToCanvas(e.clientX, e.clientY);
      channel.push(message,{color: that.defaultStrokeStyle,startX: that.local.x,startY: that.local.y,
        endX: loc.x,endY: loc.y,fillColor: that.defaultFillStyle});
      that.dragging = false;
      if(func){func.call(that,loc);}
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

 drawCircle(context,start,end,lineWidth,strokeStyle,fillStyle){
  context.save();
  context.fillStyle=fillStyle;
  context.strokeStyle = strokeStyle;
  context.lineWidth=lineWidth
  let radius = Math.sqrt((start.x-end.x)*(start.x-end.x)+(start.y-end.y)*(start.y-end.y));
  context.beginPath();
  context.arc(start.x, start.y, radius, 0, Math.PI*2, false); 
  context.stroke();
  context.fill();
  context.restore();
 }

 drawRectangle(context,start,end,lineWidth,strokeStyle,fillStyle){
  context.save();
  context.fillStyle=fillStyle;
  context.strokeStyle = strokeStyle;
  context.lineWidth=lineWidth
  let width = Math.abs(start.x-end.x);
  let height = Math.abs(start.y-end.y);
  let temp ={};
  temp.x = Math.min(start.x,end.x);
  temp.y = Math.min(start.y,end.y);
  context.strokeRect(temp.x, temp.y,width, height);
  context.fillRect(temp.x, temp.y, width, height);
  context.restore();
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
   // console.log("Socket event: "+ kind+":"+msg,data);
  }

  


}