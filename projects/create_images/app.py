import os
import gradio as gr
import logic
import yaml
from PIL import Image, ImageOps

# Load config for presets
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "config.yaml")

try:
    with open(CONFIG_PATH, "r") as f:
        CONFIG = yaml.safe_load(f)
except Exception as e:
    print(f"Warning: Failed to load config.yaml from {CONFIG_PATH}: {e}")
    CONFIG = {"styles": {}, "compositions": {}}

style_keys = list(CONFIG.get("styles", {}).keys())
# Ensure 'none' exists if expected
if "none" not in style_keys:
    style_keys.insert(0, "none")

comp_keys = list(CONFIG.get("compositions", {}).keys())

def generate_click(prompt, neg_prompt, style, ratio, count, seed, ref_img):
    # Wrapper to call logic
    return logic.generate_images(prompt, neg_prompt, style, ratio, count, seed, ref_img)

def edit_click(input_dict, prompt):
    # Gradio ImageEditor returns a dict: {'background': <PIL>, 'layers': [<PIL>], 'composite': <PIL>}
    if not input_dict or not input_dict.get("background"):
        return None
        
    base = input_dict["background"]
    
    # Get the mask from the first layer (assuming one layer of drawing)
    layers = input_dict.get("layers", [])
    if not layers:
        return None
        
    # Layer is RGBA, drawn pixels are opaque. 
    # We need to convert this to a binary mask for the API?
    # Usually the API expects the mask to be white for "repair" area (or black? logic.py uses defaults).
    # Let's extract the alpha channel as the mask.
    mask_layer = layers[0]
    # Extract alpha
    if mask_layer.mode != 'RGBA':
        mask_layer = mask_layer.convert('RGBA')
    
    # Create mask: non-transparent pixels = mask
    # alpha channel: 0 is transparent, 255 is opaque
    r, g, b, a = mask_layer.split()
    mask = a # This is our mask (white = drawn area, black = transparent)
    
    return logic.edit_image(base, mask, prompt)

# --- UI Layout ---
with gr.Blocks(title="Nano Banana Factory 🍌") as demo:
    gr.Markdown("# 🍌 Nano Banana Image Factory")
    gr.Markdown("Gemini 3.0を使用した、あなただけの画像生成スタジオ。")
    
    with gr.Tabs():
        # --- TAB 1: GENERATE ---
        with gr.TabItem("Generate (生成)"):
            with gr.Row():
                with gr.Column(scale=1):
                    prompt = gr.Textbox(label="Prompt (ここに作りたい画像を書く)", lines=3, placeholder="retro game boy in a cyberpunk city...")
                    neg_prompt = gr.Textbox(label="Negative Prompt (除外したい要素)", placeholder="low quality, blur, distortion...")
                    
                    with gr.Accordion("Advanced Settings", open=True):
                        with gr.Row():
                             # Use allow_custom_value if needed, but keys should be sufficient
                             style = gr.Dropdown(label="Style Preset", choices=style_keys, value="none")
                             ratio = gr.Dropdown(label="Aspect Ratio", choices=["1:1", "16:9", "9:16", "4:3", "3:4"], value="1:1")
                        
                        with gr.Row():
                             count = gr.Slider(label="Count", minimum=1, maximum=4, step=1, value=1)
                             seed = gr.Number(label="Seed (-1 for random)", value=-1)
                    
                    # Reference Image (For future Img2Img expansion)
                    ref_img = gr.Image(label="Reference Image (Optional)", type="pil", visible=False) 
                    
                    btn_gen = gr.Button("Generate 🍌", variant="primary", size="lg")
                
                with gr.Column(scale=2):
                    gallery = gr.Gallery(label="Generated Images", columns=2, height='auto')
            
            btn_gen.click(fn=generate_click, inputs=[prompt, neg_prompt, style, ratio, count, seed, ref_img], outputs=gallery)

        # --- TAB 2: EDIT (INPAINTING) ---
        with gr.TabItem("Edit (修正)"):
            gr.Markdown("### Inpainting / Masking")
            gr.Markdown("画像をアップロードし、修正したい部分をブラシで塗ってください。")
            
            with gr.Row():
                with gr.Column():
                    # Gradio 5+: Use ImageEditor
                    input_mask = gr.ImageEditor(
                        label="Base Image + Mask", 
                        type="pil", 
                        brush=gr.Brush(colors=["#FFFFFF"], color_mode="fixed", default_size=20),
                        eraser=gr.Eraser(default_size=20),
                        sources=["upload", "clipboard"],
                    )
                    edit_prompt = gr.Textbox(label="Edit Instruction (修正指示)", placeholder="make it red / add a cat")
                    btn_edit = gr.Button("Fix It 🔧", variant="primary")
                
                with gr.Column():
                    edit_output = gr.Gallery(label="Result", columns=1)
            
            btn_edit.click(fn=edit_click, inputs=[input_mask, edit_prompt], outputs=edit_output)

if __name__ == "__main__":
    # Theme moved to launch
    demo.launch(theme=gr.themes.Soft())
