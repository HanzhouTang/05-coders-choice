defmodule Joyfunserver do
  defdelegate createNewRoom(state), to: Joyfunserver.Application
  defdelegate addPlayer(room_number,password,player_id), to: Joyfunserver.Application
  defdelegate getChannelName(room_number), to: Joyfunserver.Application
  defdelegate getRoomNumber(), to: Joyfunserver.Application
  defdelegate removePlayer(room_number,player_id), to: Joyfunserver.Application
end
