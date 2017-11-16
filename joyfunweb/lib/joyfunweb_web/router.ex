defmodule JoyfunwebWeb.Router do
  use JoyfunwebWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
    plug JoyfunwebWeb.Auth
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", JoyfunwebWeb do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
    resources "/user", UserController, only: [:index, :show, :create, :new]
  end

  # Other scopes may use custom stacks.
  # scope "/api", JoyfunwebWeb do
  #   pipe_through :api
  # end
end
