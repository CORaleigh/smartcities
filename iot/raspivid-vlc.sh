#1080
raspivid -o - -t 0 -hf -w 1920 -h 1080 -fps 24 |cvlc -vvv stream:///dev/stdin --sout '#standard{access=http,mux=ts,dst=:8160}' :demux=h264

#640 x 480
#raspivid --codec MJPEG --verbose -vf -hf -o - -t 0 -w 640 -h 480 -fps 20 -b 500000 | cvlc -vvv stream:///dev/stdin --sout '#rtp{access=udp,sdp=rtsp://:8554/stream}' :demux=h264
