import os
import shutil
import uuid
import json
import argparse
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from generate_infinitetalk import generate, _parse_args
from wan.configs import WAN_CONFIGS

app = FastAPI(title="InfiniteTalk API")

UPLOAD_DIR = "uploads"
RESULTS_DIR = "results"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

class GenerationRequest(BaseModel):
    prompt: str = "A talking head video"
    bbox: list = [0, 0, 0, 0] # Default bbox

@app.on_event("startup")
async def startup_event():
    import download_models
    t5_checkpoint = "weights/Wan2.1-I2V-14B-480P/models_t5_umt5-xxl-enc-bf16.pth"
    if not os.path.exists(t5_checkpoint):
        print(f"Weights not found at {t5_checkpoint}. Downloading models...")
        download_models.download_models()
        print("Models downloaded.")
    else:
        print("Models found.")

    # Load pipeline
    print("Loading InfiniteTalk pipeline...")
    import sys
    # Mock args for loading
    sys.argv = [
        "generate_infinitetalk.py",
        "--ckpt_dir", "weights/Wan2.1-I2V-14B-480P",
        "--task", "infinitetalk-14B",
        "--size", "infinitetalk-480",
        "--infinitetalk_dir", "weights/MeiGen-InfiniteTalk/single/infinitetalk.safetensors",
        "--wav2vec_dir", "weights/chinese-wav2vec2-base",
        "--input_json", "examples.json", # Dummy
        "--save_file", "dummy", # Dummy
        "--sample_steps", "40",
        "--sample_shift", "7.0"
    ]
    from generate_infinitetalk import _parse_args, load_pipeline
    args = _parse_args()
    
    # Store in app.state
    app.state.pipeline_components = load_pipeline(args)
    app.state.default_args = args
    print("Pipeline loaded successfully!")

@app.post("/generate")
async def generate_video(
    image: UploadFile = File(...),
    audio: UploadFile = File(...),
    # prompt: str = Form("A talking head video") # Simplified for now
):
    request_id = str(uuid.uuid4())
    job_dir = os.path.join(UPLOAD_DIR, request_id)
    os.makedirs(job_dir, exist_ok=True)

    # Save uploaded files
    image_path = os.path.join(job_dir, image.filename)
    audio_path = os.path.join(job_dir, audio.filename)
    
    with open(image_path, "wb") as f:
        shutil.copyfileobj(image.file, f)
    with open(audio_path, "wb") as f:
        shutil.copyfileobj(audio.file, f)

    # Create input JSON for InfiniteTalk
    input_json_path = os.path.join(job_dir, "input.json")
    input_data = {
        "prompt": "A talking head video",
        "cond_video": image_path,
        "cond_audio": {
            "person1": audio_path
        },
        "audio_type": "mono",
        "bbox": [0, 0, 0, 0]
    }
    
    with open(input_json_path, "w") as f:
        json.dump(input_data, f)

    try:
        from generate_infinitetalk import generate_with_pipeline
        
        # Retrieve pre-loaded pipeline
        if not hasattr(app.state, 'pipeline_components'):
             raise HTTPException(status_code=500, detail="Pipeline not initialized")
             
        wan_i2v, wav2vec_feature_extractor, audio_encoder, rank = app.state.pipeline_components
        args = app.state.default_args
        
        # Update args for this specific request
        args.input_json = input_json_path
        args.save_file = os.path.join(RESULTS_DIR, request_id)
        
        # Run generation using existing pipeline
        generate_with_pipeline(wan_i2v, wav2vec_feature_extractor, audio_encoder, rank, args)
        
        output_video_path = f"{args.save_file}.mp4"
        
        if os.path.exists(output_video_path):
            return FileResponse(output_video_path, media_type="video/mp4", filename=f"{request_id}.mp4")
        else:
            raise HTTPException(status_code=500, detail="Video generation failed, output file not found.")

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # sys.argv = original_argv # No longer needed as we don't modify it per request
        pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
