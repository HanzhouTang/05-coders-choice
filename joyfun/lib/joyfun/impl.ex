defmodule JoyFun.Impl do
  alias JoyFun.User.Schema
  import Ecto.Query
  def add_user(email,username,password) do
    %Schema{}
    |> Schema.registration_changeset(%{email: email, username: username, password: password})
    |> JoyFun.Repo.insert
  end
  
  def find(id) do
    from(user in Schema, where: [id: ^id])
    |> JoyFun.Repo.one
  end
end
