# CLIP Text-Image Similarity Calculator

A Python script that uses OpenAI's CLIP (Contrastive Language-Image Pre-training) model to calculate similarity scores between text descriptions and images.

## Features

- Downloads and uses OpenAI's CLIP model from HuggingFace
- Processes CSV files with image URLs and text descriptions
- Downloads images from URLs automatically
- Calculates similarity scores between images and text
- Outputs results back to CSV file
- Comprehensive error handling and logging
- Unit tests included
- **Hardware acceleration support**: CUDA (NVIDIA GPUs), MPS (Apple Silicon), and CPU

## Installation

1. Install Python 3.8 or higher

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Hardware Acceleration

The script automatically detects and uses the best available device:

**For NVIDIA GPUs (CUDA):**
```bash
# Visit https://pytorch.org/get-started/locally/ for specific installation commands
```

**For Apple Silicon Macs (M1/M2/M3 - MPS):**
```bash
# PyTorch with MPS support is included in PyTorch 2.0+
# Simply install the requirements - MPS will be detected automatically
pip install -r requirements.txt
```

**Note:** The script will automatically use:
1. CUDA if available (NVIDIA GPUs)
2. MPS if available (Apple Silicon Macs)
3. CPU as fallback

## Usage

### Basic Usage

Run the script with the default `data.csv` file:
```bash
python clip_similarity.py
```

### Advanced Usage

Specify custom input and output files:
```bash
python clip_similarity.py --input my_data.csv --output results.csv
```

Use a different CLIP model:
```bash
python clip_similarity.py --model openai/clip-vit-large-patch14
```

### Command-line Arguments

- `--input`: Input CSV file path (default: `data.csv`)
- `--output`: Output CSV file path (default: same as input)
- `--model`: CLIP model name from HuggingFace (default: `openai/clip-vit-base-patch32`)

## CSV Format

The input CSV file must have the following columns:

- `image_url`: URL of the image to analyze
- `text`: Text description to compare with the image
- `similarity_score`: Will be filled by the script (can be empty initially)

### Example CSV

```csv
image_url,text,similarity_score
https://example.com/cat.jpg,A cute cat sitting on a couch,
https://example.com/dog.jpg,A golden retriever playing in a park,
```

## Running Tests

Run the unit tests:
```bash
python -m unittest test_clip_similarity.py -v
```

Or run with pytest (if installed):
```bash
pytest test_clip_similarity.py -v
```

## How It Works

1. **Device Detection**: Automatically detects the best available device (CUDA > MPS > CPU)
2. **Model Loading**: Downloads and loads the CLIP model from HuggingFace
3. **Image Download**: Downloads images from URLs in the CSV file
4. **Preprocessing**: Converts images to RGB and prepares them for the model
5. **Similarity Calculation**: Uses CLIP to encode both image and text, then calculates cosine similarity
6. **Output**: Saves similarity scores (0-1 range) back to the CSV file

When you run the script, you'll see a log message indicating which device is being used:
```
INFO - Using device: mps
```

## Similarity Score Interpretation

- **0.8 - 1.0**: Very high similarity (text accurately describes the image)
- **0.6 - 0.8**: Good similarity (text relates well to the image)
- **0.4 - 0.6**: Moderate similarity (some relation between text and image)
- **0.0 - 0.4**: Low similarity (text doesn't match the image well)

Note: CLIP uses softmax normalization, so scores represent relative similarity.

## Available CLIP Models

You can use different CLIP models from HuggingFace:

- `openai/clip-vit-base-patch32` (default) - Faster, less accurate
- `openai/clip-vit-base-patch16` - Balanced performance
- `openai/clip-vit-large-patch14` - Slower, more accurate

## Error Handling

The script includes robust error handling:
- Failed image downloads are logged and skipped
- Network timeouts are handled gracefully
- Invalid CSV format is detected and reported
- All errors are logged with timestamps

## Requirements

- Python 3.8+
- PyTorch 2.0+
- Transformers 4.30+
- Pillow 9.0+
- Pandas 1.5+
- Requests 2.28+

## License

This script uses OpenAI's CLIP model. Please refer to the model's license and usage terms.

## Troubleshooting

### Out of Memory Error
If you encounter memory issues, try:
- Using a smaller model (e.g., `openai/clip-vit-base-patch32`)
- Processing fewer images at once
- Running on a machine with more RAM

### Slow Processing
- Use GPU if available (CUDA for NVIDIA, MPS for Apple Silicon)
- The script automatically detects and uses the best available device
- Use a smaller model (e.g., `openai/clip-vit-base-patch32`)
- Reduce image resolution (handled automatically by CLIP)
- On Mac with Apple Silicon, ensure you're using PyTorch 2.0+ for MPS support

### Image Download Failures
- Check internet connectivity
- Verify image URLs are accessible
- Some URLs may require authentication or have rate limiting
