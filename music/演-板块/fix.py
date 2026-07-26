#!/usr/bin/env python3
"""Post-build: rename index.html → 舞台时光.html and copy images."""
import os, shutil

dist = os.path.dirname(os.path.abspath(__file__)) + '/dist'
src = os.path.dirname(dist) + '/public/images'
dst = dist + '/images'

# Copy images to dist
if os.path.isdir(src):
    os.makedirs(dst, exist_ok=True)
    for f in os.listdir(src):
        shutil.copy2(os.path.join(src, f), os.path.join(dst, f))

# Rename HTML
old = os.path.join(dist, 'index.html')
new = os.path.join(dist, '舞台时光.html')
if os.path.exists(old) and not os.path.exists(new):
    os.rename(old, new)

print(f"✅ Done: {new}")
