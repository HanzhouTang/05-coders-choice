use Mix.Config
config(:joyfun, JoyFun.Repo,
  adapter: Ecto.Adapters.Postgres,
  database: "joyfun_#{Mix.env}",
  username: "postgres",
  password: "mnhg1234",
  hostname: "localhost")
