from logic import generate_images
import os

print("=== Testing Logic with Mock Fallback ===")

try:
    images = generate_images(
        prompt="A test prompt for mock",
        negative_prompt="",
        style="none",
        aspect_ratio="1:1",
        image_count=1,
        seed=12345
    )
    
    if images:
        print(f"✅ Success! Returned {len(images)} images.")
        print("Check output directory for 'mock_...' files.")
    else:
        print("❌ Returned empty list.")
        
except Exception as e:
    print(f"❌ Failed: {e}")
