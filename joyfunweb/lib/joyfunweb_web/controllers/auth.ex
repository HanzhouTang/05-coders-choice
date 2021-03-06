defmodule JoyfunwebWeb.Auth do
  import Plug.Conn
  def init(opts) do
    opts
  end
  def call(conn, _) do
    user_id = get_session(conn, :user_id)
    user = user_id && JoyFun.Impl.find(user_id)
    assign(conn, :current_user, user)
  end

  def login(conn, user) do
    conn
    |> assign(:current_user, user)
    |> put_session(:user_id, user.id)
    |> configure_session(renew: true)
  end

  def logout(conn) do
    room_number = get_session(conn,:room_number)
    user_id = get_session(conn,:user_id)
    if room_number do 
    Joyfunserver.removePlayer(room_number,user_id)
    end
    configure_session(conn, drop: true)
  end 
  
end
