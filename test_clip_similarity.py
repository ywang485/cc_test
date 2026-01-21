#!/usr/bin/env python3
"""
Unit tests for CLIP Text-Image Similarity Calculator
"""

import unittest
import os
import pandas as pd
import tempfile
import shutil
from unittest.mock import Mock, patch, MagicMock
from PIL import Image
import numpy as np
import torch

from clip_similarity import CLIPSimilarityCalculator


class TestCLIPSimilarityCalculator(unittest.TestCase):
    """Test cases for CLIPSimilarityCalculator class."""

    @classmethod
    def setUpClass(cls):
        """Set up test fixtures that are used by multiple tests."""
        cls.temp_dir = tempfile.mkdtemp()

    @classmethod
    def tearDownClass(cls):
        """Clean up temporary directory after all tests."""
        shutil.rmtree(cls.temp_dir)

    def setUp(self):
        """Set up test fixtures before each test."""
        # Create a mock calculator to avoid loading the actual model
        self.mock_model = MagicMock()
        self.mock_processor = MagicMock()

    def test_initialization(self):
        """Test that the calculator initializes correctly."""
        with patch('clip_similarity.CLIPModel.from_pretrained') as mock_model, \
             patch('clip_similarity.CLIPProcessor.from_pretrained') as mock_processor:

            calculator = CLIPSimilarityCalculator()

            mock_model.assert_called_once()
            mock_processor.assert_called_once()
            self.assertIsNotNone(calculator.model)
            self.assertIsNotNone(calculator.processor)
            self.assertIn(calculator.device, ['cuda', 'cpu'])

    def test_initialization_with_custom_model(self):
        """Test initialization with a custom model name."""
        custom_model = "openai/clip-vit-large-patch14"

        with patch('clip_similarity.CLIPModel.from_pretrained') as mock_model, \
             patch('clip_similarity.CLIPProcessor.from_pretrained') as mock_processor:

            calculator = CLIPSimilarityCalculator(model_name=custom_model)

            mock_model.assert_called_once_with(custom_model)
            mock_processor.assert_called_once_with(custom_model)

    def test_download_image_success(self):
        """Test successful image download."""
        with patch('clip_similarity.CLIPModel.from_pretrained'), \
             patch('clip_similarity.CLIPProcessor.from_pretrained'):

            calculator = CLIPSimilarityCalculator()

            # Mock the requests.get response
            mock_response = Mock()
            mock_response.status_code = 200

            # Create a simple test image
            test_image = Image.new('RGB', (100, 100), color='red')
            img_byte_arr = BytesIO()
            test_image.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            mock_response.content = img_byte_arr.read()

            with patch('clip_similarity.requests.get', return_value=mock_response):
                from io import BytesIO
                image = calculator.download_image("http://example.com/image.jpg")

                self.assertIsNotNone(image)
                self.assertIsInstance(image, Image.Image)
                self.assertEqual(image.mode, 'RGB')

    def test_download_image_failure(self):
        """Test image download failure handling."""
        with patch('clip_similarity.CLIPModel.from_pretrained'), \
             patch('clip_similarity.CLIPProcessor.from_pretrained'):

            calculator = CLIPSimilarityCalculator()

            # Mock a failed request
            with patch('clip_similarity.requests.get', side_effect=Exception("Network error")):
                image = calculator.download_image("http://example.com/image.jpg")

                self.assertIsNone(image)

    def test_download_image_converts_to_rgb(self):
        """Test that non-RGB images are converted to RGB."""
        with patch('clip_similarity.CLIPModel.from_pretrained'), \
             patch('clip_similarity.CLIPProcessor.from_pretrained'):

            calculator = CLIPSimilarityCalculator()

            # Mock the requests.get response with a grayscale image
            mock_response = Mock()
            mock_response.status_code = 200

            # Create a grayscale test image
            test_image = Image.new('L', (100, 100), color=128)
            img_byte_arr = BytesIO()
            test_image.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            mock_response.content = img_byte_arr.read()

            with patch('clip_similarity.requests.get', return_value=mock_response):
                from io import BytesIO
                image = calculator.download_image("http://example.com/image.jpg")

                self.assertIsNotNone(image)
                self.assertEqual(image.mode, 'RGB')

    def test_calculate_similarity(self):
        """Test similarity calculation."""
        with patch('clip_similarity.CLIPModel.from_pretrained') as mock_model_class, \
             patch('clip_similarity.CLIPProcessor.from_pretrained') as mock_processor_class:

            # Create mock model and processor
            mock_model = MagicMock()
            mock_processor = MagicMock()
            mock_model_class.return_value = mock_model
            mock_processor_class.return_value = mock_processor

            # Mock the processor output
            mock_inputs = {
                'input_ids': torch.zeros(1, 77),
                'pixel_values': torch.zeros(1, 3, 224, 224),
                'attention_mask': torch.ones(1, 77)
            }
            mock_processor.return_value = type('obj', (object,), {
                'to': lambda self, device: mock_inputs
            })()

            # Mock the model output
            mock_output = MagicMock()
            mock_logits = torch.tensor([[2.5]])
            mock_output.logits_per_image = mock_logits
            mock_model.return_value = mock_output

            calculator = CLIPSimilarityCalculator()

            # Create a test image
            test_image = Image.new('RGB', (224, 224), color='blue')
            test_text = "A blue image"

            similarity = calculator.calculate_similarity(test_image, test_text)

            self.assertIsInstance(similarity, float)
            self.assertGreaterEqual(similarity, 0.0)
            self.assertLessEqual(similarity, 1.0)

    def test_calculate_similarity_error_handling(self):
        """Test error handling in similarity calculation."""
        with patch('clip_similarity.CLIPModel.from_pretrained'), \
             patch('clip_similarity.CLIPProcessor.from_pretrained') as mock_processor_class:

            # Make processor raise an exception
            mock_processor = MagicMock()
            mock_processor.side_effect = Exception("Processing error")
            mock_processor_class.return_value = mock_processor

            calculator = CLIPSimilarityCalculator()
            calculator.processor = mock_processor

            test_image = Image.new('RGB', (224, 224), color='blue')
            test_text = "A blue image"

            with self.assertRaises(Exception):
                calculator.calculate_similarity(test_image, test_text)

    def test_process_csv_missing_columns(self):
        """Test that process_csv raises error for missing columns."""
        with patch('clip_similarity.CLIPModel.from_pretrained'), \
             patch('clip_similarity.CLIPProcessor.from_pretrained'):

            calculator = CLIPSimilarityCalculator()

            # Create a CSV with missing columns
            csv_path = os.path.join(self.temp_dir, 'test_missing_cols.csv')
            df = pd.DataFrame({
                'image_url': ['http://example.com/image.jpg'],
                'text': ['A test image']
                # Missing similarity_score column
            })
            df.to_csv(csv_path, index=False)

            with self.assertRaises(ValueError):
                calculator.process_csv(csv_path)

    def test_process_csv_success(self):
        """Test successful CSV processing."""
        with patch('clip_similarity.CLIPModel.from_pretrained'), \
             patch('clip_similarity.CLIPProcessor.from_pretrained'):

            calculator = CLIPSimilarityCalculator()

            # Create a test CSV
            csv_path = os.path.join(self.temp_dir, 'test_success.csv')
            df = pd.DataFrame({
                'image_url': ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
                'text': ['A cat', 'A dog'],
                'similarity_score': [None, None]
            })
            df.to_csv(csv_path, index=False)

            # Mock download_image and calculate_similarity
            test_image = Image.new('RGB', (224, 224), color='green')
            calculator.download_image = Mock(return_value=test_image)
            calculator.calculate_similarity = Mock(return_value=0.85)

            # Process CSV
            result_df = calculator.process_csv(csv_path)

            # Verify results
            self.assertEqual(len(result_df), 2)
            self.assertIsNotNone(result_df.loc[0, 'similarity_score'])
            self.assertIsNotNone(result_df.loc[1, 'similarity_score'])
            self.assertEqual(calculator.download_image.call_count, 2)
            self.assertEqual(calculator.calculate_similarity.call_count, 2)

    def test_process_csv_with_failed_download(self):
        """Test CSV processing with failed image download."""
        with patch('clip_similarity.CLIPModel.from_pretrained'), \
             patch('clip_similarity.CLIPProcessor.from_pretrained'):

            calculator = CLIPSimilarityCalculator()

            # Create a test CSV
            csv_path = os.path.join(self.temp_dir, 'test_failed_download.csv')
            df = pd.DataFrame({
                'image_url': ['http://example.com/bad_image.jpg'],
                'text': ['A test image'],
                'similarity_score': [None]
            })
            df.to_csv(csv_path, index=False)

            # Mock failed download
            calculator.download_image = Mock(return_value=None)

            # Process CSV
            result_df = calculator.process_csv(csv_path)

            # Verify that similarity_score is None for failed download
            self.assertTrue(pd.isna(result_df.loc[0, 'similarity_score']))

    def test_process_csv_output_path(self):
        """Test CSV processing with custom output path."""
        with patch('clip_similarity.CLIPModel.from_pretrained'), \
             patch('clip_similarity.CLIPProcessor.from_pretrained'):

            calculator = CLIPSimilarityCalculator()

            # Create a test CSV
            input_path = os.path.join(self.temp_dir, 'test_input.csv')
            output_path = os.path.join(self.temp_dir, 'test_output.csv')

            df = pd.DataFrame({
                'image_url': ['http://example.com/image.jpg'],
                'text': ['A test'],
                'similarity_score': [None]
            })
            df.to_csv(input_path, index=False)

            # Mock methods
            test_image = Image.new('RGB', (224, 224), color='red')
            calculator.download_image = Mock(return_value=test_image)
            calculator.calculate_similarity = Mock(return_value=0.75)

            # Process CSV with custom output path
            calculator.process_csv(input_path, output_path)

            # Verify output file exists
            self.assertTrue(os.path.exists(output_path))

            # Verify content
            result_df = pd.read_csv(output_path)
            self.assertIsNotNone(result_df.loc[0, 'similarity_score'])

    def test_csv_processing_preserves_order(self):
        """Test that CSV processing preserves row order."""
        with patch('clip_similarity.CLIPModel.from_pretrained'), \
             patch('clip_similarity.CLIPProcessor.from_pretrained'):

            calculator = CLIPSimilarityCalculator()

            # Create a test CSV with specific order
            csv_path = os.path.join(self.temp_dir, 'test_order.csv')
            df = pd.DataFrame({
                'image_url': [f'http://example.com/image{i}.jpg' for i in range(5)],
                'text': [f'Image {i}' for i in range(5)],
                'similarity_score': [None] * 5
            })
            df.to_csv(csv_path, index=False)

            # Mock methods
            test_image = Image.new('RGB', (224, 224))
            calculator.download_image = Mock(return_value=test_image)
            calculator.calculate_similarity = Mock(return_value=0.5)

            # Process CSV
            result_df = calculator.process_csv(csv_path)

            # Verify order is preserved
            for i in range(5):
                self.assertEqual(result_df.loc[i, 'text'], f'Image {i}')
                self.assertEqual(result_df.loc[i, 'image_url'],
                               f'http://example.com/image{i}.jpg')


class TestIntegration(unittest.TestCase):
    """Integration tests (these may take longer to run)."""

    def test_file_not_found(self):
        """Test handling of non-existent input file."""
        with patch('clip_similarity.CLIPModel.from_pretrained'), \
             patch('clip_similarity.CLIPProcessor.from_pretrained'):

            calculator = CLIPSimilarityCalculator()

            # Should not raise exception, just log error
            # (In real usage, main() handles this)
            with self.assertRaises(FileNotFoundError):
                calculator.process_csv('/nonexistent/path/to/file.csv')


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)
