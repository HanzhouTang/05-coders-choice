defmodule JoyFun.User.Schema do
  use Ecto.Schema
  import Ecto.Changeset
  schema "users"  do
    field :email,         :string
    field :username,      :string
    field :password,      :string, virtual: true
    field :password_hash, :string
    timestamps()
  end

  def changeset(user, new_values) do
    user
    |> cast(new_values,[:email,:username])
    |> validate_required([:email,:username])
  end

  def registration_changeset(user, new_values) do
    user
    |> changeset(new_values)
    |> cast(new_values, [:password])
    |> validate_required([:password])
    |> validate_length(:password, min: 6, max: 100) 
    |> put_pass_hash()
  end

  defp put_pass_hash(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{password: pass}} ->
	put_change(changeset, :password_hash, Comeonin.Bcrypt.hashpwsalt(pass))
      _ ->
	changeset
    end
  end
  
end
