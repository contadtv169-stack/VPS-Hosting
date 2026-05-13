#!/bin/bash
# Gerenciador de Streams Web TV

echo "=== Gerenciador de Streams Web TV ==="

# Função para converter RTSP para HLS
convert_to_hls() {
    local input=$1
    local output=$2
    local channel_name=$3

    ffmpeg -i "$input" \
        -c:v libx264 \
        -c:a aac \
        -hls_time 10 \
        -hls_list_size 10 \
        -hls_flags delete_segments \
        -hls_segment_filename "web-tv/stream/${channel_name}_%03d.ts" \
        "web-tv/stream/${channel_name}.m3u8" &
}

# Ler canais e iniciar streams
for channel_file in web-tv/channels/*.json; do
    name=$(basename "$channel_file" .json)
    stream_url=$(python3 -c "
import json
with open('$channel_file') as f:
    data = json.load(f)
    print(data.get('stream_url', ''))
")

    if [ -n "$stream_url" ]; then
        echo "Iniciando stream: $name -> $stream_url"
        convert_to_hls "$stream_url" "web-tv/stream/${name}.m3u8" "$name"
    fi
done

echo "Todos os streams iniciados!"
wait
