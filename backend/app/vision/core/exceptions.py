class VisionException(Exception):
    """Base exception for vision pipeline errors."""
    pass


class ImageDecodeError(VisionException):
    """Raised when an image payload cannot be decoded."""
    pass


class InvalidImageFormatError(VisionException):
    """Raised when an unsupported image format is provided."""
    pass


class ModelInferenceError(VisionException):
    """Raised when deep learning model inference fails."""
    pass
