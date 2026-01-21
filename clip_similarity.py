#!/usr/bin/env python3
"""
CLIP Text-Image Similarity Calculator

This script uses OpenAI's CLIP model to calculate similarity scores between
text descriptions and images. It reads data from a CSV file, downloads images,
computes similarities, and outputs the results back to the CSV.
"""

import os
import pandas as pd
import requests
from PIL import Image
from io import BytesIO
import torch
from transformers import CLIPProcessor, CLIPModel
import logging
from typing import Tuple, Optional
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CLIPSimilarityCalculator:
    """Calculate similarity between text and images using CLIP model."""

    def __init__(self, model_name: str = "openai/clip-vit-base-patch32"):
        """
        Initialize the CLIP model and processor.

        Args:
            model_name: HuggingFace model identifier for CLIP
        """
        logger.info(f"Loading CLIP model: {model_name}")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")

        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        logger.info("Model loaded successfully")

    def download_image(self, image_url: str, timeout: int = 10) -> Optional[Image.Image]:
        """
        Download an image from a URL.

        Args:
            image_url: URL of the image to download
            timeout: Request timeout in seconds

        Returns:
            PIL Image object or None if download fails
        """
        try:
            logger.info(f"Downloading image from: {image_url}")
            response = requests.get(image_url, timeout=timeout)
            response.raise_for_status()
            image = Image.open(BytesIO(response.content))
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            return image
        except Exception as e:
            logger.error(f"Failed to download image from {image_url}: {str(e)}")
            return None

    def calculate_similarity(self, image: Image.Image, text: str) -> float:
        """
        Calculate similarity score between an image and text.

        Args:
            image: PIL Image object
            text: Text description

        Returns:
            Similarity score between 0 and 1
        """
        try:
            # Preprocess inputs
            inputs = self.processor(
                text=[text],
                images=image,
                return_tensors="pt",
                padding=True
            ).to(self.device)

            # Calculate features
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits_per_image = outputs.logits_per_image
                similarity = logits_per_image.softmax(dim=1)[0][0].item()

            return similarity
        except Exception as e:
            logger.error(f"Failed to calculate similarity: {str(e)}")
            raise

    def process_csv(self, csv_path: str, output_path: Optional[str] = None) -> pd.DataFrame:
        """
        Process a CSV file with image URLs and text, calculate similarities.

        Args:
            csv_path: Path to input CSV file with columns: image_url, text, similarity_score
            output_path: Path to save output CSV (defaults to input path)

        Returns:
            DataFrame with calculated similarity scores
        """
        if output_path is None:
            output_path = csv_path

        logger.info(f"Loading CSV from: {csv_path}")
        df = pd.read_csv(csv_path)

        # Validate required columns
        required_columns = ['image_url', 'text', 'similarity_score']
        if not all(col in df.columns for col in required_columns):
            raise ValueError(f"CSV must contain columns: {required_columns}")

        logger.info(f"Processing {len(df)} rows")

        # Calculate similarity for each row
        for idx, row in df.iterrows():
            image_url = row['image_url']
            text = row['text']

            logger.info(f"Processing row {idx + 1}/{len(df)}")

            # Download image
            image = self.download_image(image_url)
            if image is None:
                logger.warning(f"Skipping row {idx} due to image download failure")
                df.at[idx, 'similarity_score'] = None
                continue

            # Calculate similarity
            try:
                similarity = self.calculate_similarity(image, text)
                df.at[idx, 'similarity_score'] = similarity
                logger.info(f"Similarity score: {similarity:.4f}")
            except Exception as e:
                logger.error(f"Error processing row {idx}: {str(e)}")
                df.at[idx, 'similarity_score'] = None

        # Save results
        logger.info(f"Saving results to: {output_path}")
        df.to_csv(output_path, index=False)
        logger.info("Processing complete!")

        return df


def main():
    """Main function to run the similarity calculator."""
    import argparse

    parser = argparse.ArgumentParser(
        description='Calculate CLIP similarity between text and images'
    )
    parser.add_argument(
        '--input',
        type=str,
        default='data.csv',
        help='Input CSV file path (default: data.csv)'
    )
    parser.add_argument(
        '--output',
        type=str,
        default=None,
        help='Output CSV file path (default: same as input)'
    )
    parser.add_argument(
        '--model',
        type=str,
        default='openai/clip-vit-base-patch32',
        help='CLIP model name (default: openai/clip-vit-base-patch32)'
    )

    args = parser.parse_args()

    # Check if input file exists
    if not os.path.exists(args.input):
        logger.error(f"Input file not found: {args.input}")
        return

    # Initialize calculator and process CSV
    calculator = CLIPSimilarityCalculator(model_name=args.model)
    calculator.process_csv(args.input, args.output)


if __name__ == '__main__':
    main()
