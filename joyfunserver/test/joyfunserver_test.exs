defmodule JoyfunserverTest do
  use ExUnit.Case
  doctest Joyfunserver

  test "greets the world" do
    assert Joyfunserver.hello() == :world
  end
end
