defmodule JoyfunwebWeb.UserController do
  use JoyfunwebWeb, :controller
  alias JoyfunwebWeb.Auth

  def index(conn, _params) do
    render conn, "new.html"
  end

  def login(conn, _params) do
    render conn, "login.html"
  end
  
  def verfication(conn, %{"username" => username, "password" => password}) do
    case  JoyFun.Impl.verfication(username,password) do 
      {:ok,user} -> 
	conn
	|> Auth.login(user)
	|> put_flash(:info, "#{user.username} login successful ! ")
	|>redirect(to: page_path(conn, :index))
      :error_password ->
	conn
	|> put_flash(:error, "The password is wrong, please try again!")
	|> redirect(to: user_path(conn, :login))
    :error_username ->
	conn
	|> put_flash(:error, "The username is wrong, please try again!")
	|> redirect(to: user_path(conn, :login))
    end
  end

  def create(conn,%{"email" => email, "password" => password, "username" => username}) do
    case JoyFun.Impl.add_user(email,username,password) do
      {:ok, user} ->
	conn
	|> Auth.login(user)
	|> put_flash(:info, "#{user.username} created! ")
	|>redirect(to: page_path(conn, :index))
      {:error, _changeset} ->
	conn
	|> put_flash(:error, "There's something wrong, please check and try again! ")
	|> render("new.html")
    end
  end
  
  def logout(conn,_) do 
    conn
    |>Auth.logout
    |>redirect(to: user_path(conn, :login))
  end
  
end
