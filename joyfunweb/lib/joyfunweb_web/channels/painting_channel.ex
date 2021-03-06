defmodule JoyfunwebWeb.PaintingChannel do
  use Phoenix.Channel
  def join("painting:"<>room_number,%{"user_name" => username},socket) do
    send(self,:after_join)
    {:ok,assign(socket,:username,username)}
  end
  
  def handle_in("sending",%{"message" => msg},socket) do
    broadcast! socket, "echo", %{message: "<strong>#{socket.assigns.username}:</strong>"<>msg<>"<br/>"}
    {:noreply, socket}
  end

  def handle_in("paint:drawGrid",_msg,socket) do
    broadcast! socket, "painting:Grid", %{color: "lightgray", stepx: 10, stepy: 10}
    {:noreply, socket}
  end

  def handle_in("paint:clearGrid",_msg,socket) do
    broadcast! socket, "painting:Grid", %{color: "#ffffff", stepx: 10, stepy: 10}
    {:noreply, socket}
  end

  def handle_in("paint:"<>type,%{"color" => color,"startX" =>startX, "startY" =>startY,"endX"=>endX,"endY"=>endY, "fillColor" =>fillColor },socket) do
    broadcast! socket, "painting:"<>type, %{color: color, startX: startX, startY: startY,endX: endX, endY: endY,LineWidth: 0.5,fillColor: fillColor }
    {:noreply, socket}
  end

  def handle_in(msg,_msg,socket) do
    broadcast! socket, msg, %{}
    {:noreply, socket}
  end

  def handle_info(:after_join,socket) do
    username = socket.assigns.username
    broadcast! socket, "echo", %{message: "<strong>#{username}</strong> join the room,welcome!<br/>"}
    {:noreply,socket}
  end
end
