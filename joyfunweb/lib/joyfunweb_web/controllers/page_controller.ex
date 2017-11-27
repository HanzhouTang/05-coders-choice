defmodule JoyfunwebWeb.PageController do
  use JoyfunwebWeb, :controller
  plug :authenticate
  def index(conn, _params) do
    render conn, "index.html"
  end

  def painting(conn,_params) do
    room_number = get_session(conn,:room_number)
    user = conn.assigns.current_user
    if room_number do
      conn
      |> put_flash(:info, "#{user.username}, your room number is #{room_number}, please enjoy painting! ")
      |> render("painting.html",room_number: room_number,user_name: user.username)
    else
      conn
      |> put_flash(:error, "Must enter a room before painting! ")
      |> redirect(to: page_path(conn, :index))
      |> halt()
    end
  end
  
  def create_room(conn,%{"player_number" => player_number, "game_type" =>game_type, "password" => password}) do
    user = conn.assigns.current_user
    password = password || "*"
    player_number = String.to_integer player_number
    room_number = Joyfunserver.getRoomNumber()
    Joyfunserver.createNewRoom({room_number,password,player_number,game_type})
    Joyfunserver.addPlayer(room_number,password,user.id)
    conn
    |> put_session(:room_number,room_number)
    |> redirect(to: page_path(conn, String.to_atom(game_type)))
  end

  def join_room(conn,%{ "room_number" =>room_number, "password" => password}) do
    user = conn.assigns.current_user
    case Joyfunserver.addPlayer(room_number,password,user.id) do
      {:success,game_type} ->
	conn
	|> put_session(:room_number,room_number)
	|> redirect(to: page_path(conn,String.to_atom(game_type)))
      :unsuccess ->
	conn 
	|> put_flash(:error, "This room is full, please try other room")
	|> redirect(to: page_path(conn, :index))
	|> halt()
      :wrong_password ->
	conn 
	|> put_flash(:error, "wrong password, please try again")
	|> redirect(to: page_path(conn, :index))
	|> halt()
      :room_not_existing ->
	conn 
	|> put_flash(:error, "The room #{room_number} is not existing, please try again")
	|> redirect(to: page_path(conn, :index))
	|> halt()
    end
  end
  
  defp authenticate(conn, _opts) do
    if conn.assigns.current_user do
      conn
    else
      conn
      |> put_flash(:error, "You must be logged in to start")
      |> redirect(to: user_path(conn, :login))
      |> halt()
    end
  end
 
  
end
