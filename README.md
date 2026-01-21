# CLIP Text-Image Similarity Calculator

A Python script that uses OpenAI's CLIP (Contrastive Language-Image Pre-training) model to calculate similarity scores between text descriptions and images. Perfect for content moderation, image search, recommendation systems, and ML applications.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the script with sample data
python clip_similarity.py

# Or specify custom input/output files
python clip_similarity.py --input my_data.csv --output results.csv
```

## ✨ Features

- 🤖 **OpenAI CLIP Model**: Uses state-of-the-art vision-language model from HuggingFace
- ⚡ **Hardware Acceleration**: Automatic detection and support for:
  - CUDA (NVIDIA GPUs)
  - MPS (Apple Silicon M1/M2/M3)
  - CPU (fallback)
- 📁 **CSV Processing**: Batch process multiple image-text pairs
- 🖼️ **Automatic Image Download**: Downloads images from URLs automatically
- 🎯 **Similarity Scoring**: Outputs normalized scores (0-1 range)
- 📊 **Comprehensive Logging**: Track progress and identify issues
- ✅ **Unit Tests**: Full test coverage included

## 📋 Requirements

- Python 3.8 or higher
- PyTorch 2.0+
- Transformers 4.30+
- Pillow, Pandas, Requests

All dependencies are listed in `requirements.txt`

## 📖 Usage

### Input Format

Create a CSV file with three columns:
- `image_url`: URL of the image to analyze
- `text`: Text description to compare with the image
- `similarity_score`: Will be filled by the script (leave empty)

**Example `data.csv`:**
```csv
image_url,text,similarity_score
https://example.com/cat.jpg,A cute cat sitting on a couch,
https://example.com/dog.jpg,A golden retriever playing in a park,
```

### Command-Line Options

```bash
python clip_similarity.py --help

Options:
  --input   Input CSV file path (default: data.csv)
  --output  Output CSV file path (default: same as input)
  --model   CLIP model name (default: openai/clip-vit-base-patch32)
```

### Example Usage

```bash
# Basic usage with default settings
python clip_similarity.py

# Custom input and output files
python clip_similarity.py --input my_images.csv --output results.csv

# Use a larger, more accurate model
python clip_similarity.py --model openai/clip-vit-large-patch14
```

## 🎯 How It Works

1. **Device Detection**: Automatically selects the best available hardware (CUDA > MPS > CPU)
2. **Model Loading**: Downloads and loads the CLIP model from HuggingFace (first run only)
3. **Image Processing**: Downloads images from URLs and converts them to RGB
4. **Similarity Calculation**: Encodes both image and text, calculates cosine similarity
5. **Results Output**: Saves similarity scores back to the CSV file

When you run the script, you'll see logs like:
```
INFO - Using device: mps
INFO - Loading CLIP model: openai/clip-vit-base-patch32
INFO - Model loaded successfully
INFO - Processing 5 rows
INFO - Processing row 1/5
INFO - Downloading image from: https://...
INFO - Similarity score: 0.8234
```

## 📊 Similarity Score Interpretation

- **0.8 - 1.0**: Very high similarity (text accurately describes the image)
- **0.6 - 0.8**: Good similarity (text relates well to the image)
- **0.4 - 0.6**: Moderate similarity (some relation between text and image)
- **0.0 - 0.4**: Low similarity (text doesn't match the image well)

*Note: CLIP uses softmax normalization, so scores represent relative similarity.*

## 🧪 Running Tests

```bash
# Run all unit tests
python -m unittest test_clip_similarity.py -v

# Or use pytest if installed
pytest test_clip_similarity.py -v
```

The test suite includes 14 test cases covering:
- Model initialization
- Image downloading and conversion
- Similarity calculation
- CSV processing
- Error handling

## 🖥️ Hardware Acceleration

### Apple Silicon (M1/M2/M3 Macs)

The script automatically detects and uses MPS (Metal Performance Shaders) for significant speed improvements:

```bash
pip install -r requirements.txt
python clip_similarity.py
# Output: INFO - Using device: mps
```

### NVIDIA GPUs (CUDA)

Install PyTorch with CUDA support:
```bash
# Visit https://pytorch.org/get-started/locally/ for your specific CUDA version
```

### CPU Fallback

If no GPU is available, the script automatically falls back to CPU processing.

## 📁 Project Files

- **`clip_similarity.py`** - Main similarity calculator script
- **`test_clip_similarity.py`** - Comprehensive unit tests
- **`data.csv`** - Sample data file with example image URLs
- **`requirements.txt`** - Python dependencies
- **`CLIP_SIMILARITY_README.md`** - Detailed documentation

## 🎨 Available CLIP Models

You can use different CLIP models from HuggingFace:

| Model | Speed | Accuracy | Best For |
|-------|-------|----------|----------|
| `openai/clip-vit-base-patch32` (default) | Fast | Good | General use, quick processing |
| `openai/clip-vit-base-patch16` | Medium | Better | Balanced performance |
| `openai/clip-vit-large-patch14` | Slow | Best | High accuracy requirements |

## 🐛 Troubleshooting

### Out of Memory Error
- Use a smaller model: `openai/clip-vit-base-patch32`
- Process fewer images at once
- Close other applications to free up RAM

### Slow Processing
- Ensure hardware acceleration is working (check logs for "Using device: cuda" or "Using device: mps")
- On Mac with Apple Silicon, verify PyTorch 2.0+ is installed
- Use a smaller/faster model

### Image Download Failures
- Check internet connectivity
- Verify image URLs are publicly accessible
- Some URLs may require authentication or have rate limiting

## 📚 Documentation

For detailed documentation including architecture, API reference, and advanced usage, see **[CLIP_SIMILARITY_README.md](CLIP_SIMILARITY_README.md)**.

## 📄 License

This script uses OpenAI's CLIP model. Please refer to the [model's license and usage terms](https://github.com/openai/CLIP).

## 🤝 Contributing

Feel free to open issues or submit pull requests with improvements!

---

**Made with ❤️ using OpenAI's CLIP model**
