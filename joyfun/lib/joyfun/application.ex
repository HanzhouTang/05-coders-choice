defmodule Joyfun.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    import Supervisor.Spec
    children = [
     worker(JoyFun.Repo,[])
    ]

    opts = [strategy: :one_for_one, name: Joyfun.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
