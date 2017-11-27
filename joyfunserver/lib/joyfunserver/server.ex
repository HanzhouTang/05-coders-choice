defmodule State do
  defstruct(
    room_number: "",
    password:    "",
    game_type:   "",
    number_of_player: 0,
    players:    []
  )
end

defmodule Server do
  use GenServer
  def start_link({room_number,password,player_number,game_type}) do
    state = %State{
      room_number: room_number,
      password:    password,
      number_of_player: player_number,
      game_type: game_type
    }
    GenServer.start_link(__MODULE__,state,name: String.to_atom(room_number))
  end
  

  def addPlayer(room_number,password,player_id) do
    GenServer.call(String.to_atom(room_number), {:add_player,player_id,password})
  end

  def removePlayer(room_number,player_id) do
    GenServer.cast(String.to_atom(room_number),{:remove_player,player_id})
  end

  def getChannelName(room_number)do
    GenServer.call(String.to_atom(room_number),:get_channel_name)
  end

  def handle_call(:get_channel_name,_from,state) do
    {:reply,"#{state.game_type}:#{state.room_number}",state}
  end
  
   def handle_call({:add_player,player_id,password}, _from, state) do
    if Enum.count(state.players) < state.number_of_player do
      if password == state.password or state.password == "*" do
	players = [player_id|state.players]
	state=Map.put(state,:players,players)
	{:reply,{:success,state.game_type},state}
      else
	{:reply,:wrong_password,state}
      end
    else
      {:reply,:unsuccess,state}
    end
  end


  def handle_cast({:remove_player,player_id},state) do 
  players = Enum.filter(state.players, &(&1 != player_id))
  state = Map.put(state,:players,players)
  #IO.puts "=======================================remove player =============================="
  #IO.inspect state.players
  {:noreply, state}
  end

 
  
end
