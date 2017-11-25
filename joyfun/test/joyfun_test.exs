defmodule JoyfunTest do
  use ExUnit.Case
  doctest Joyfun

  test "greets the world" do
    assert Joyfun.hello() == :world
  end
end
