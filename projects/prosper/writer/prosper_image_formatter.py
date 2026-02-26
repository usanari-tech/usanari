import os
import argparse
from PIL import Image

class ProsperImageFormatter:
    def __init__(self, target_width=1280, target_height=670):
        self.target_width = target_width
        self.target_height = target_height

    def format_and_inject(self, draft_path, image_paths):
        with open(draft_path, "r", encoding="utf-8") as f:
            content = f.read()

        placeholders = content.count("[IMAGE]: PLACEHOLDER")
        has_banner = "[BANNER]: PLACEHOLDER" in content
        total_needed = placeholders + (1 if has_banner else 0)

        if len(image_paths) < total_needed:
            print(f"Error: Not enough images provided. Draft needs {total_needed}, but got {len(image_paths)}.")
            return

        print(f">>> [Prosper Image Formatter] Processing {len(image_paths)} images for {os.path.basename(draft_path)}")
        new_content = content
        img_index = 0

        # 1. Process Banner
        if has_banner:
            processed_path = self._crop_and_save(image_paths[img_index], draft_path, "Banner")
            new_content = new_content.replace("[BANNER]: PLACEHOLDER", f"[BANNER]: {os.path.abspath(processed_path)}")
            img_index += 1

        # 2. Process Body Images
        for i in range(placeholders):
            processed_path = self._crop_and_save(image_paths[img_index], draft_path, f"Image_{i+1}")
            new_content = new_content.replace("[IMAGE]: PLACEHOLDER", f"[IMAGE]: {os.path.abspath(processed_path)}", 1)
            img_index += 1

        # Save Output
        base, ext = os.path.splitext(draft_path)
        output_path = f"{base}_Illustrated{ext}"
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(new_content)
            
        print(f">>> 🖼️ Illustrated draft saved to: {output_path}")

    def _crop_and_save(self, input_path, draft_path, suffix):
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"Image not found: {input_path}")
            
        img = Image.open(input_path)
        
        # FUDGE style is on a white background. Instead of severe cropping that cuts off the drawing,
        # we will scale the image to fit within the target dimensions and pad the rest with white.
        img.thumbnail((self.target_width, self.target_height), Image.Resampling.LANCZOS)
        
        # Create a new white image of the target size
        new_img = Image.new("RGB", (self.target_width, self.target_height), "white")
        
        # Paste the resized image into the center of the white background
        paste_x = (self.target_width - img.width) // 2
        paste_y = (self.target_height - img.height) // 2
        new_img.paste(img, (paste_x, paste_y))
        
        img = new_img

        # Save to projects/prosper/images
        base_name = os.path.basename(draft_path).split('_Draft')[0]
        output_dir = os.path.join(os.path.dirname(draft_path), "../../images", base_name)
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, f"{suffix}.jpg")
        
        # Convert to RGB if needed (e.g., from RGBA)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
            
        img.save(output_path, "JPEG", quality=90)
        print(f"    [Formatted] {suffix} -> 1280x670 -> Saved to {output_path}")
        return output_path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Prosper Image Formatter (Force 1280x670 Crop)")
    parser.add_argument("draft", help="Path to markdown draft")
    parser.add_argument("images", nargs="+", help="Paths to generated images (First one is Banner, rest are for Body)")
    args = parser.parse_args()
    
    formatter = ProsperImageFormatter()
    formatter.format_and_inject(args.draft, args.images)
