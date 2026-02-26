import os
import time
import yaml
from google import genai
from google.genai import types
from PIL import Image
from datetime import datetime
from dotenv import load_dotenv
import gradio as gr 
import io

# Path setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")
ROOT_ENV_PATH = os.path.abspath(os.path.join(BASE_DIR, "../../.env"))
CONFIG_PATH = os.path.join(BASE_DIR, "config.yaml")

# Load environment variables
# Prioritize local .env
if os.path.exists(ENV_PATH):
    load_dotenv(ENV_PATH)
    print(f"Loaded .env from: {ENV_PATH}")
else:
    print(f"Warning: .env not found at {ENV_PATH}")

# Load config
try:
    with open(CONFIG_PATH, "r") as f:
        CONFIG = yaml.safe_load(f)
except Exception as e:
    print(f"Warning: Failed to load config.yaml: {e}")
    CONFIG = {"styles": {}, "defaults": {"output_dir": "output"}}

def get_client():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found. Please check your .env file.")
    return genai.Client(api_key=api_key)

def save_image(image, prompt, seed):
    """Saves the PIL image to the output directory with metadata."""
    # Resolve output dir relative to BASE_DIR if it's not absolute
    out_cfg = CONFIG["defaults"].get("output_dir", "output")
    if not os.path.isabs(out_cfg):
        output_dir = os.path.join(BASE_DIR, out_cfg)
    else:
        output_dir = out_cfg
        
    date_str = datetime.now().strftime("%Y%m%d")
    save_path = os.path.join(output_dir, date_str)
    os.makedirs(save_path, exist_ok=True)

    timestamp = datetime.now().strftime("%H%M%S")
    # Clean prompt for filename
    safe_prompt = "".join([c for c in prompt[:20] if c.isalnum() or c in (' ', '_')]).strip().replace(" ", "_").lower()
    filename = f"{timestamp}_{safe_prompt}_{seed}.png"
    filepath = os.path.join(save_path, filename)
    
    image.save(filepath)
    
    # Save simple metadata
    meta = {
        "prompt": prompt,
        "seed": seed,
        "timestamp": timestamp
    }
    with open(filepath.replace(".png", ".json"), "w") as f:
        yaml.dump(meta, f)
        
    return filepath

def create_mock_image(prompt, seed):
    """Generates a simple mock image using PIL."""
    width, height = 1024, 1024
    # Create a solid color based on seed
    import random
    random.seed(seed)
    r = random.randint(50, 200)
    g = random.randint(50, 200)
    b = random.randint(50, 200)
    
    img = Image.new('RGB', (width, height), color=(r, g, b))
    
    # Add text
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    try:
        # Try to load a default font
        font = ImageFont.load_default()
    except:
        font = None
        
    text = f"MOCK IMAGE\n{prompt[:30]}..."
    draw.text((10, 10), text, fill=(255, 255, 255))
    
    return img

def generate_images(prompt, negative_prompt, style, aspect_ratio, image_count, seed, ref_image=None):
    """
    Generates images using Gemini 3 Pro Image (Nano Banana Pro).
    Uses generate_content as this is a Gemini model.
    Falls back to Gemini 2.5 Flash Image if Pro is unavailable/rate-limited.
    """
    print(f"DEBUG: generate_images called with prompt='{prompt}'")
    client = get_client()
    
    # Models to try in order (As of Feb 2026)
    # Note: Image generation (Imagen 3/4) requires a billed account (Error 400 INVALID_ARGUMENT).
    # Gemini 2.5 Flash / 3.0 Pro preview image models may return 404 or 429 on free tier.
    models_to_try = [
        "imagen-3.0-generate-001",
        "gemini-2.5-flash-image",
        "gemini-3-pro-image-preview",
        "gemini-2.5-flash"
    ]

    # Construct Prompt
    full_prompt = prompt
    if style and style != "none" and style in CONFIG["styles"]:
        full_prompt += f", {CONFIG['styles'][style]}"
    
    if negative_prompt:
         full_prompt += f" --negative_prompt='{negative_prompt}'"
         
    # Aspect Ratio instruction
    full_prompt += f", aspect ratio {aspect_ratio}"

    generated_images = []
    last_error = None

    for model_name in models_to_try:
        try:
            print(f"Generating with {model_name}: {full_prompt}")
            
            # Reset for this model
            current_model_images = []
            
            for i in range(int(image_count)):
                try:
                    if "imagen" in model_name:
                        # Request generation using imagen standard
                        response = client.models.generate_images(
                            model=model_name,
                            prompt=full_prompt,
                            config=dict(
                                number_of_images=1,
                                output_mime_type="image/jpeg",
                                aspect_ratio=aspect_ratio.replace(":", "/") if ":" in aspect_ratio else aspect_ratio
                            )
                        )
                        if response.generated_images:
                            for idx, gen_img in enumerate(response.generated_images):
                                pil_img = Image.open(io.BytesIO(gen_img.image.image_bytes))
                                path = save_image(pil_img, full_prompt, f"{seed}_{i}_{idx}" if seed != -1 else f"random_{i}_{idx}")
                                print(f"Saved to: {path}")
                                current_model_images.append(pil_img)
                            break # Success, move to next image count
                    else:
                        # Request generation using text-to-content
                        response = client.models.generate_content(
                            model=model_name,
                            contents=full_prompt,
                        )
                    
                    # Check candidates/parts
                    if response.candidates and response.candidates[0].content.parts:
                        found_image = False
                        for part in response.candidates[0].content.parts:
                            if part.inline_data:
                                pil_img = Image.open(io.BytesIO(part.inline_data.data))
                                path = save_image(pil_img, full_prompt, f"{seed}_{i}" if seed != -1 else f"random_{i}")
                                print(f"Saved to: {path}")
                                current_model_images.append(pil_img)
                                found_image = True
                            
                        if not found_image:
                            # If no image found in parts (e.g. text refusal)
                            print(f"[{model_name}] Response contained no image data. Refusal likely.")
                            # We don't raise immediately, trying next iteration/model
                            
                        if not hasattr(response, 'candidates') or not response.candidates:
                            print(f"[{model_name}] No content in response for iteration {i}")
                            
                except Exception as loop_err:
                    print(f"[{model_name}] Iteration {i} failed: {loop_err}")
                    # If it's a critical error like 429, 404, or 400 (Billing required), capture it
                    if any(code in str(loop_err) for code in ["429", "404", "400"]):
                        raise loop_err 
            
            if current_model_images:
                generated_images.extend(current_model_images)
                # If we successfully generated images with this model, stop trying others
                break
                
        except Exception as model_err:
            print(f"Model {model_name} failed: {model_err}")
            last_error = model_err
            # Continue to next model
            continue

    if not generated_images:
        print("All models failed. checking for fallback...")
        if last_error and any(code in str(last_error) for code in ["429", "400", "404"]):
             print(f"API Error ({last_error}). Returning MOCK image for testing.")
             # Fallback to mock
             mock_imgs = []
             for i in range(int(image_count)):
                 m_img = create_mock_image(prompt, f"{seed}_{i}")
                 save_image(m_img, prompt, f"mock_{seed}_{i}")
                 mock_imgs.append(m_img)
             return mock_imgs

        error_msg = f"All models failed. Last error: {last_error}"
        raise gr.Error(error_msg)
        
    return generated_images

    # (Original except block below is removed by replacement)
    # except Exception as e:
    #     import traceback
    #     traceback.print_exc()
    #     raise gr.Error(f"Generation failed: {str(e)}")

def edit_image(base_image, mask_image, prompt):
    """
    Edits image using Gemini 3 Pro (Multimodal).
    Passes [prompt, base_image].
    """
    try:
        client = get_client()
        model_name = "gemini-3-pro-image-preview"
        
        print(f"Editing with {model_name}: {prompt}")
        
        contents = [prompt, base_image]
        
        response = client.models.generate_content(
            model=model_name,
            contents=contents,
            # config=types.GenerateContentConfig(
            #     response_mime_type="image/jpeg"
            # )
        )
        
        generated_images = []
        if response.candidates and response.candidates[0].content.parts:
             for part in response.candidates[0].content.parts:
                if part.inline_data:
                    pil_img = Image.open(io.BytesIO(part.inline_data.data))
                    generated_images.append(pil_img)
                else:
                     print(f"Edit Part has no inline_data. Text content: {part.text}")
             
        return generated_images

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise gr.Error(f"Editing failed: {str(e)}")
