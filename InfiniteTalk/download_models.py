import os
from huggingface_hub import snapshot_download

def download_models():
    # Create weights directory
    os.makedirs("weights", exist_ok=True)

    print("Downloading Wan2.1-I2V-14B-480P...")
    snapshot_download(
        repo_id="Wan-AI/Wan2.1-I2V-14B-480P",
        local_dir="weights/Wan2.1-I2V-14B-480P"
    )
    
    # Explicitly check for T5 weights
    t5_path = "weights/Wan2.1-I2V-14B-480P/models_t5_umt5-xxl-enc-bf16.pth"
    if not os.path.exists(t5_path):
        print(f"T5 weights missing at {t5_path}. Attempting specific download...")
        try:
            from huggingface_hub import hf_hub_download
            hf_hub_download(
                repo_id="Wan-AI/Wan2.1-I2V-14B-480P",
                filename="models_t5_umt5-xxl-enc-bf16.pth",
                local_dir="weights/Wan2.1-I2V-14B-480P"
            )
            print("T5 weights downloaded successfully.")
        except Exception as e:
            print(f"Failed to download T5 weights: {e}")

    print("Downloading chinese-wav2vec2-base...")
    snapshot_download(
        repo_id="TencentGameMate/chinese-wav2vec2-base",
        local_dir="weights/chinese-wav2vec2-base"
    )

    print("Downloading MeiGen-InfiniteTalk...")
    snapshot_download(
        repo_id="MeiGen-AI/InfiniteTalk", # Corrected Repo ID if needed, but search said MeiGen-AI/InfiniteTalk
        local_dir="weights/MeiGen-InfiniteTalk"
    )
    
    # Explicitly check for InfiniteTalk safetensors
    it_path = "weights/MeiGen-InfiniteTalk/single/infinitetalk.safetensors"
    if not os.path.exists(it_path):
        print(f"InfiniteTalk weights missing at {it_path}. Attempting specific download...")
        try:
            from huggingface_hub import hf_hub_download
            hf_hub_download(
                repo_id="MeiGen-AI/InfiniteTalk",
                filename="single/infinitetalk.safetensors",
                local_dir="weights/MeiGen-InfiniteTalk"
            )
            print("InfiniteTalk weights downloaded successfully.")
        except Exception as e:
            print(f"Failed to download InfiniteTalk weights: {e}")
    
    print("Downloading Kokoro-82M (TTS)...")
    snapshot_download(
        repo_id="hexgrad/Kokoro-82M",
        local_dir="weights/Kokoro-82M"
    )

    print("All models downloaded successfully!")

if __name__ == "__main__":
    download_models()
