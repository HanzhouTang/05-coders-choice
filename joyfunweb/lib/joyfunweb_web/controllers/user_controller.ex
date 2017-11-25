defmodule JoyfunwebWeb.UserController do
  use JoyfunwebWeb, :controller
  alias JoyfunwebWeb.Auth
  def new(conn, _params) do
    render conn, "new.html"
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




end
