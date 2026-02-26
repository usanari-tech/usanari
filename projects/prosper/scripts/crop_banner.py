from PIL import Image
import sys
import os

def crop_center_16_9(image_path, output_path):
    try:
        img = Image.open(image_path)
        width, height = img.size
        
        # Calculate target height for 16:9
        target_height = int(width * 9 / 16)
        
        if target_height > height:
            # If image is too short, crop width instead
            target_width = int(height * 16 / 9)
            left = (width - target_width) // 2
            top = 0
            right = left + target_width
            bottom = height
        else:
            # Crop height (standard for square -> 16:9)
            left = 0
            top = (height - target_height) // 2
            right = width
            bottom = top + target_height
            
        img_cropped = img.crop((left, top, right, bottom))
        
        # Resize to Note standard (1280x670)
        img_resized = img_cropped.resize((1280, 670), Image.Resampling.LANCZOS)
        
        img_resized.save(output_path)
        print(f"Successfully cropped and resized to {output_path} (1280x670)")
        
    except Exception as e:
        print(f"Error cropping image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python crop_banner.py <input_path> <output_path>")
        sys.exit(1)
        
    crop_center_16_9(sys.argv[1], sys.argv[2])
