import os
import re
import base64
import urllib.request
import mimetypes
import urllib.parse
import ssl
import shutil

# Bypass SSL verification if needed, though not recommended for production
ssl._create_default_https_context = ssl._create_unverified_context

SOURCE_DIR = "_opensource"
TARGET_DIR = "assets/img/opensource"
DEFAULT_IMAGE = "/assets/img/logo.jpg"

if not os.path.exists(TARGET_DIR):
    os.makedirs(TARGET_DIR)

def normalize_extension(ext):
    if not ext: return ".png"
    ext = ext.lower()
    if ext == ".jpe" or ext == ".jpeg": return ".jpg"
    return ext

def get_extension(url, content_type=None):
    if content_type:
        ext = mimetypes.guess_extension(content_type)
        if ext: return normalize_extension(ext)

    path = urllib.parse.urlparse(url).path
    ext = os.path.splitext(path)[1]
    if ext: return normalize_extension(ext)

    return ".png" # fallback

def process_image(val, slug, suffix=""):
    if not val or val == "None":
        return DEFAULT_IMAGE

    if val.startswith("/assets/"):
        return val

    # Fix known mangled URL in caikit
    if "caikit.png1200px-Source_Code_Pro" in val:
        val = "https://dw1.s81c.com/developer-static-pages/open/en/open-projects/images/caikit.png"

    filename = slug + suffix

    if val.startswith("data:image"):
        # Handle base64
        try:
            header, data = val.split(",", 1)
            mime = header.split(";")[0].split(":")[1]
            ext = normalize_extension(mimetypes.guess_extension(mime) or ".png")
            filepath = os.path.join(TARGET_DIR, filename + ext)
            # Only write if doesn't exist
            if not os.path.exists(filepath):
                with open(filepath, "wb") as f:
                    f.write(base64.b64decode(data))
            return "/assets/img/opensource/" + filename + ext
        except Exception as e:
            print(f"Error decoding base64 for {slug}: {e}")
            return val

    elif val.startswith("http"):
        # Handle URL
        try:
            # Use a more specific User-Agent to avoid blocks
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            req = urllib.request.Request(val, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as response:
                content_type = response.info().get_content_type()
                ext = get_extension(val, content_type)
                filepath = os.path.join(TARGET_DIR, filename + ext)

                # Check if we already downloaded it
                if not os.path.exists(filepath):
                    with open(filepath, "wb") as f:
                        f.write(response.read())
                return "/assets/img/opensource/" + filename + ext
        except Exception as e:
            print(f"Error downloading {val} for {slug}: {e}")
            # If it failed and we are on Wikimedia, try removing the /thumb/ and the trailing size part to get original
            if "wikimedia.org" in val and "/thumb/" in val:
                try:
                    parts = val.split('/')
                    original_url = '/'.join(parts[:-1]).replace('/thumb/', '/')
                    if original_url.endswith('.svg') or original_url.endswith('.png') or original_url.endswith('.jpg'):
                         print(f"Retrying with original Wikimedia URL: {original_url}")
                         return process_image(original_url, slug, suffix)

                    if 'thumb' in parts:
                        thumb_idx = parts.index('thumb')
                        original_parts = parts[:thumb_idx] + parts[thumb_idx+1:-1]
                        original_url = '/'.join(original_parts)
                        print(f"Retrying with alternative original Wikimedia URL: {original_url}")
                        return process_image(original_url, slug, suffix)
                except:
                    pass

            # If everything failed, use default image
            print(f"Falling back to default image for {slug}")
            return DEFAULT_IMAGE

    return val

files = os.listdir(SOURCE_DIR)
for f in files:
    if not f.endswith(".md"): continue
    path = os.path.join(SOURCE_DIR, f)
    slug = os.path.splitext(f)[0]

    with open(path, "r") as file:
        content = file.read()

    new_content = content

    # Process image
    img_match = re.search(r"^image:\s*(.*)", new_content, re.MULTILINE)
    img_val = None
    new_img_path = None
    if img_match:
        img_val = img_match.group(1).strip()
        new_img_path = process_image(img_val, slug)
        if new_img_path and new_img_path != img_val:
            new_content = re.sub(r"^image:\s*.*", f"image: {new_img_path}", new_content, flags=re.MULTILINE)

    # Process thumbnail
    thumb_match = re.search(r"thumbnail:\s*(.*)", new_content)
    if thumb_match:
        thumb_val = thumb_match.group(1).strip()
        if thumb_val == img_val:
            new_thumb_path = new_img_path
        else:
            new_thumb_path = process_image(thumb_val, slug, "_thumb")

        if new_thumb_path and new_thumb_path != thumb_val:
             new_content = re.sub(r"thumbnail:\s*.*", f"thumbnail: {new_thumb_path}", new_content)

    with open(path, "w") as file:
        file.write(new_content)
    print(f"Processed {f}")
