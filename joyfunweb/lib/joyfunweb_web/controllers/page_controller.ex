defmodule JoyfunwebWeb.PageController do
  use JoyfunwebWeb, :controller
  def index(conn, _params) do
    render conn, "index.html"
  end
end
