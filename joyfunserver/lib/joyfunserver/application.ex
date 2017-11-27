defmodule Joyfunserver.Application do

  @moduledoc false
  @name __MODULE__
  
  use Application

  def start(_type, _args) do
    import Supervisor.Spec, warn: false
    children = [
      worker(Server,[])
    ]

    opts = [strategy: :simple_one_for_one, name: @name]
    Agent.start_link(fn -> 0 end, name: :"Joyfunserver.Agent")
    Agent.start_link(fn ->MapSet.new end ,name: :"Joyfunserver.MapSet.Agent")
    Supervisor.start_link(children, opts)
  end

  def removePlayer(room_number,player_id) do
  map = Agent.get(:"Joyfunserver.MapSet.Agent",&(&1))
  if MapSet.member?(map, room_number) do 
  Server.removePlayer(room_number,player_id)
  end 
  end
  
  def getChannelName(room_number) do 
  map = Agent.get(:"Joyfunserver.MapSet.Agent",&(&1))
   if MapSet.member?(map, room_number) do 
   Server.getChannelName(room_number)
   else 
   :room_not_existing
   end
  end 

  def addPlayer(room_number,password,player_id) do
   map = Agent.get(:"Joyfunserver.MapSet.Agent",&(&1))
   if MapSet.member?(map, room_number) do 
   Server.addPlayer(room_number,password,player_id)
   else 
   :room_not_existing
   end
  end

  def createNewRoom({room_number,password,player_number,game_type}) do
    Agent.update(:"Joyfunserver.MapSet.Agent",fn map -> MapSet.put(map,room_number) end)
    Supervisor.start_child(@name,[{room_number,password,player_number,game_type}])
  end
  def getRoomNumber() do
    Agent.get_and_update(:"Joyfunserver.Agent",fn count ->{"#{count}",count+1} end)
  end
end
