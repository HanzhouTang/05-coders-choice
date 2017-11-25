use Mix.Config
config :joyfun, ecto_repos: [JoyFun.Repo]
import_config "#{Mix.env}.exs"
