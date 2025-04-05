{pkgs}: {
  deps = [
    pkgs.postgresql
    pkgs.xxd
    pkgs.imagemagick
    pkgs.ffmpeg
    pkgs.jq
  ];
}
