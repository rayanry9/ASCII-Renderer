for i in range(8):
    for j in range(8):
        print(f"count = count + texture2D(texture, coords + vec2({i}.0, {j}.0));")