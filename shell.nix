# shell.nix
{ pkgs ? import <nixpkgs> {} }:

let
  devEnv = import /home/user/results/.idx/dev.nix { inherit pkgs; };
in
pkgs.mkShell {
  buildInputs = devEnv.packages;
  shellHook = ''
    echo "Environment loaded with Node.js, OpenSSL, cURL, and MongoDB"
  '';
}

